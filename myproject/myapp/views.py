from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from owlready2 import get_ontology, World
from owlready2.reasoning import sync_reasoner_hermit
import json

# This is the file path to your ontology
ONTOLOGY_FILE_PATH = "file://myapp/ontologies/osr.owl"

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
            # Add the other attributes here...
            
            # Then, we relate the Application instance to the Microservice instances
            application.hasMicroservice = [ms]

    # Then, we run the reasoner to validate the ontology
    try:
        sync_reasoner_hermit(infer_property_values=True)

        inconsistencies = list(ontology.inconsistent_classes())

        print(inconsistencies)  # print inconsistencies for debugging
        
        if len(inconsistencies) > 0:
            raise InconsistentOntologyError
    except InconsistentOntologyError:
        return False, "The form data is not valid according to the ontology."

    # If we get here without any exceptions, the form data is valid
    return True, "The form data is valid."

# Get the directory that the current file (views.py) is in
# file_dir = os.path.dirname(os.path.realpath('__file__'))

# Create the full file path by joining the directory path with the relative path to the ontology file
# ontology_path = os.path.join(file_dir, 'ontologies/osr.owl')


# This variable will store the most recently received data
received_data = None

# Load the ontology
# world = World()
# ontology = world.get_ontology("myapp/ontologies/osr.owl").load()
#sync_reasoner_pellet(world=world, infer_property_values=True)

# Prepend the file path with "file://" and load the ontology
# ontology = get_ontology("file://" + ontology_path).load()


# with ontology:
    # sync_reasoner_pellet()


@csrf_exempt
def deployment(request):

    global received_data

    # Load the ontology
    # ontology = get_ontology("ontologies/osr.owl").load()
    # onto = get_ontology("ontologies/osr.owl").load()


    if request.method == 'POST':

        # Parse the request body as JSON
        # data = json.loads(request.body)
        print(request.body.decode('utf-8'))

        # If this is a POST request, store the data for later processing
        received_data = json.loads(request.body.decode('utf-8'))

        print(received_data)
        return JsonResponse({"message": "Data received."}, status=200)
    
    # GET METHOD
    elif request.method == 'GET': 
        try:
            if received_data is None:
                # If no data has been received yet, return an error
                return JsonResponse({"error": "No data has been received yet."}, status=400)
            else:
                # If data has been received, validate it
                try:
                    is_valid, message = validate_form_data(received_data)
                    if is_valid:
                        # If the data is valid, print it and return a success message
                        print(received_data)
                        return JsonResponse({"message": message, "received_data": received_data}, status=200)
                    else:
                        # If the data is not valid, return an error message
                        return JsonResponse({"error": message, "inconsistencies": inconsistencies}, status=400)
                except InconsistentOntologyError:
                    # Handle the inconsistency error and return an error message
                    return JsonResponse({"error": "The form data is not valid due to ontology inconsistency."}, status=400)
        except Exception as e:
            # Handle other exceptions
            return JsonResponse({"error": "The form data is not valid due to ontology inconsistency."}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method. Only POST and GET are allowed."}, status=405)

        # Extract the application name and version
        # app_name = data['applicationName']
        # app_version = data['applicationVersion']

        # Create an instance of the Application class with the form data
        # with ontology:
             # app = ontology.Application(app_name)
            # app.hasVersion = [app_version]

            # Extract the microservices data from the form data
            # microservices_data = data['microservices']

        # Create instances of the Microservice class for each microservice in the form data
        '''
            for ms_data in microservices_data:

                ms = ontology.Microservice(ms_data['serviceName'])
                ms.hasImage = [ms_data['containerImage']]
                ms.hasReplicas = [ms_data['replicas']]
                ms.hasCPU = [ms_data['cpu']]
                ms.hasMemory = [ms_data['memory']]
                ms.hasContainerPort = [ms_data['containerPort']]
                ms.hasServicePort = [ms_data['servicePort']]

                # Link the microservice to the application
                app.hasMicroservice.append(ms)
        '''
        # Perform reasoning and consistency check
        # sync_reasoner_pellet(infer_property_values=True)
        # sync_reasoner_hermit(infer_property_values=True)
            
        # Check for inconsistencies

        # Check if the ontology is consistent
        # is_consistent = len(world.consistency_check()) == 0
        # Validate the data

        # Store the received data and the consistency check result
        # received_data = {
            # 'data': data,
            # 'is_consistent': is_consistent
        # }

        # If the ontology is not consistent, return an error message
        # if is_consistent:
            # return JsonResponse({"message": "Data received and valid."}, status=200)
        
        # If everything is okay, continue processing the form data
        # else:
            # return JsonResponse({"message": "Data received but not valid."}, status=400)

        # Store the received data
        # received_data = data
        # Store the received data
        # received_data = data
        # return JsonResponse({"message": "Data received."}, status=200)

    


    

def home(request):
    return JsonResponse({'info': 'Hello, H K!'}, safe=False)