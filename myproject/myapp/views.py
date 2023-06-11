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

# This is the file path to your ontology
ONTOLOGY_FILE_PATH = "file://myapp/ontologies/osr.owl"

# Docker client 
client = docker.from_env()

# env verification fucntion
def is_valid_env_var(env_var):
    return re.match("^[a-zA-Z_][a-zA-Z0-9_]*=[a-zA-Z0-9_]*$", env_var) is not None


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

# This function validates a form data dictionary against the ontology
def validate_form_data(form_data):
    # First, we load the ontology
    # world = World()
    ontology = get_ontology(ONTOLOGY_FILE_PATH).load()
    with ontology:
        # Then, we create instances of Application and Microservice in the ontology
        # based on the form data
        application = ontology.Application(form_data['applicationName'])
        application.hasVersion = form_data['applicationVersion']
        for ms_data in form_data['microservices']:
            ms = ontology.Microservice(ms_data['serviceName'])
            ms.hasImage = ms_data['containerImage']
            ms.hasReplicas = ms_data['replicas']
            ms.hasCPU = ms_data['cpu']
            ms.hasMemory = ms_data['memory']
            # Add the other attributes here...
            # Then, we relate the Application instance to the Microservice instances
            application.hasMicroservice = [ms]
    # Then, we run the reasoner to validate the ontology
    try:
        sync_reasoner_hermit(infer_property_values=True)
        inconsistencies = list(ontology.inconsistent_classes())
        if len(inconsistencies) > 0:
            raise InconsistentOntologyError
    except InconsistentOntologyError:
        return False, "The form data is not valid according to the ontology."

    # If we get here without any exceptions, the form data is valid
    return True, "The form data is valid."

# This variable will store the most recently received data
received_data = None


# This function convert the YAML File to docker compose yaml structure
def process_data(data):
    # Create a dictionary that will hold the Docker Compose data
    docker_compose_data = {'version': '3', 'services': {}}
    # Loop over the microservices in the data
    for ms in data['microservices']:
        # Create a dictionary that will hold the service data
        service_data = {}
        # Set the image of the service
        service_data['image'] = ms['containerImage']
        # Set the environment variables of the service
        if 'environmentVariables' in ms:
            service_data['environment'] = ms['environmentVariables']
        # If the service has defined ports, set them
        if 'ports' in ms:
            # Docker Compose expects the ports to be a list of strings
            # As per the new structure, ports are already a list, so no need to wrap them in another list
            service_data['ports'] = ms['ports']
        # Add the service data to the Docker Compose data under the service name
        docker_compose_data['services'][ms['serviceName']] = service_data
    return docker_compose_data

# This function deploy the app
def deploy_docker_compose(file_path):
    # Change the current working directory to the directory of the file
    dir_path = os.path.dirname(file_path)
    os.chdir(dir_path)

    # Run the Docker Compose command
    subprocess.run(["docker-compose", "up", "-d"], check=True)

# This view handle form information into yaml file
@csrf_exempt
def deployment(request):
    used_ports = set()
    if request.method == 'POST':
        form_data = json.loads(request.body.decode('utf-8'))

        # Validate form data
        is_valid, message = validate_form_data(form_data)
        if is_valid:
            # Check if the images exist
            microservices = form_data.get('microservices', [])
            for service in microservices:
                image_name = service.get('containerImage')
                if image_name and not verify_image(image_name):
                    return JsonResponse({"error": f"Image {image_name} does not exist."}, status=400)
                
            # Check if port is free
                for port_mapping in service['ports']:
                    host_port = int(port_mapping.split(':')[0])  # split and take the host port

                    # Check if this port was already used by another service
                    if host_port in used_ports:
                        return JsonResponse({"error": f"Port {host_port} was already assigned to another service."}, status=400)
                        
                    # Check if this port is free on the host system
                    if not is_port_free(host_port):
                        return JsonResponse({"error": f"Port {host_port} is not available on the host system."}, status=400)
                    
                    used_ports.add(host_port)

            
            # Check if env variables are valid
                if 'environmentVariables' in service:
                    for env_var in service['environmentVariables']:
                        if not is_valid_env_var(env_var):  # is_valid_env_var validates the whole "KEY=VALUE" string
                            return JsonResponse({"error": f"Invalid environment variable: {env_var}"}, status=400)

                    
            # If the images exist and the data is valid, convert it to YAML and return it as a response
            yaml_data = yaml.dump(form_data)
            return JsonResponse({"data": yaml_data}, status=200)
        else:
            return JsonResponse({"error": message}, status=400)
    elif request.method == 'GET':
        return JsonResponse({"error": "GET method not supported for this endpoint."}, status=405)
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

        with open('docker-compose.yaml', 'w') as file:
            file.write(docker_compose_yaml)

        return JsonResponse({'message': 'Docker compose file generated successfully'})
    elif request.method == 'GET':
        if os.path.exists('docker-compose.yaml'):
            with open('docker-compose.yaml', 'rb') as file:
                response = HttpResponse(file.read(), content_type='application/octet-stream')
                response['Content-Disposition'] = 'attachment; filename="docker-compose.yaml"'
                return response
        else:
            return JsonResponse({'error': 'Docker compose file not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)