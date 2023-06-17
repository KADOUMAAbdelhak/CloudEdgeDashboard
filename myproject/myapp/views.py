from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from owlready2 import get_ontology
from owlready2.reasoning import sync_reasoner_hermit
import json
import yaml
import os
import subprocess
import docker
import socket 
import re


BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Base directory of your Django project or app

# This is the file path to your ontology
ONTOLOGY_FILE_PATH = "file://myapp/ontologies/osr.owl"

# Docker client 
client = docker.from_env()

# env verification fucntion
def is_valid_env_var(env_var):
    return re.fullmatch(r'^[a-zA-Z_][a-zA-Z0-9_]*=.*$', env_var) is not None


# verify if port is free
def is_port_free(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("localhost", port))
            return True
        except socket.error:
            return False

# verify image function
def verify_image(image_name):
    try:
        client.images.pull(image_name)
        return True
    except docker.errors.ImageNotFound:
        return False
    except docker.errors.APIError:
        return False

# This is a custom exception that we will raise when the ontology is inconsistent
class InconsistentOntologyError(Exception):
    def __init__(self, inconsistencies):
        self.inconsistencies = inconsistencies

# This variable will store the most recently received data
received_data = None


# This function convert the YAML File to docker compose yaml structure
def process_data(data):
    docker_compose_data = {'version': '3.8', 'services': {}}

    for ms in data['microservices']:
        service_data = {}
        # Container image
        service_data['image'] = ms['containerImage']

        # Deployment settings
        service_data['deploy'] = {
            'resources': {
                'limits': {
                    'cpus': str(ms['cpu']),
                    'memory': f"{ms['memory']}M"
                }
            }
        }

        # Environment variables
        if 'environmentVariables' in ms and ms['environmentVariables']:
            environmentVariablesArray = ms['environmentVariables'].split(",")
            environmentVariables = {}
            for variable in environmentVariablesArray:
                key, value = variable.split("=")
                environmentVariables[key.strip()] = value.strip()
            service_data['environment'] = environmentVariables

        # Port mapping
        if 'ports' in ms and ms['ports']:   # Changed from 'ports' to 'port'
            service_data['ports'] = [ms['ports']]  # Wrap single port value into a list

        # Dependencies
        if 'depends_on' in ms and ms['depends_on']:
            service_data['depends_on'] = [ms['depends_on']]

        # Restart policy
        if 'restartPolicy' in ms and ms['restartPolicy']:
            service_data['restart'] = ms['restartPolicy']

        # Health checks
        if 'healthCheck' in ms and ms['healthCheck']:
            service_data['healthcheck'] = {
                'test': ["CMD", "curl", "-f", ms['healthCheck']],
                'interval': '1m',
                'timeout': '10s',
                'retries': 3,
                'start_period': '30s'
            }
        
        docker_compose_data['services'][ms['serviceName']] = service_data

    return docker_compose_data



# deploy_docker_compose function
def deploy_docker_compose(file_path):
    print(f"File path: {file_path}")
    dir_path = os.path.dirname(file_path)
    print(f"Directory path: {dir_path}")

    if not os.path.isfile(file_path):
        print(f"The file does not exist at the provided path: {file_path}")
        return

    os.chdir(dir_path)
    # Run the Docker Compose command
    subprocess.run(["docker-compose", "up", "-d"], check=True)

class CustomDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

def str_presenter(dumper, data):
    if len(data.split("\n")) > 1:  # check for multiline string
        return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
    return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='')

yaml.add_representer(str, str_presenter, Dumper=CustomDumper)

# This view handle form information into yaml file
@csrf_exempt
def deployment(request):
    used_ports = set()
    if request.method == 'POST':
        form_data = json.loads(request.body.decode('utf-8'))
        # Check if the images exist
        microservices = form_data.get('microservices', [])
        for service in microservices:
            service_used_ports = set()
            image_name = service.get('containerImage')
            if image_name and not verify_image(image_name):
                return JsonResponse({"error": f"Image {image_name} does not exist."}, status=400)
            
        # Check if port is free
            port_mapping = service['ports']  # notice it's 'port' now, not 'ports'
            host_port = int(port_mapping.split(':')[0])  # split and take the host port

            # Check if this port was already used by another service
            if host_port in used_ports:
                return JsonResponse({"error": f"Port {host_port} was already assigned to another service."}, status=400)

            # Check if this port is free on the host system
            if not is_port_free(host_port):
                return JsonResponse({"error": f"Port {host_port} is not available on the host system."}, status=400)

            used_ports.add(host_port)

        # Check if env variables are valid
            if 'environment' in service:
                for env_var in service['environment']:
                    if not is_valid_env_var(env_var):
                        return JsonResponse({"error": f"Invalid environment variable: {env_var}"}, status=400)

                
        # If the images exist and the data is valid, convert it to YAML and return it as a response
        yaml_data = yaml.dump(form_data, Dumper=CustomDumper)
        return JsonResponse({"data": yaml_data}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method. Only POST is allowed."}, status=405)

def home(request):
    return JsonResponse({'info': 'Hello, H K!'}, safe=False)


# This view handle deployment
@csrf_exempt
def handle_yaml(request):
    global received_data
    if request.method == 'POST':
        received_yaml = json.loads(request.body.decode('utf-8'))['yamlData']
        parsed_data = yaml.safe_load(received_yaml)
        received_data = parsed_data

        # Process the parsed data to match the Docker Compose structure
        docker_compose_data = process_data(parsed_data)

        # Then dump it back to YAML format.
        docker_compose_yaml = yaml.safe_dump(docker_compose_data)

        # Save the Docker Compose file
        file_path = os.path.join(BASE_DIR, 'docker-compose.yaml')
        with open(file_path, 'w') as file:
            file.write(docker_compose_yaml)

        # Deploy the Docker Compose file
        try:
            deploy_docker_compose(file_path)
            message = 'Docker compose file generated and services deployed successfully'
        except subprocess.CalledProcessError:
            message = 'There was an error deploying the services'

        # Use os.path.join to create the full file path
        file_path = os.path.join(BASE_DIR, 'docker-compose.yaml')
        dir_path = os.path.dirname(file_path)
        os.chdir(dir_path) # change directory
        # Get the state of the services
        # service_states = subprocess.check_output(["docker-compose", "ps"]).decode('utf-8')

        return JsonResponse({'message': message})
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)