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
            ms.hasCPU = ms_data['cpu']
            ms.hasContainerPort = ms_data['containerPort']
            ms.hasServicePort = ms_data['servicePort']
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
# This is the Django view that will be called when the user submits the form

@csrf_exempt
def deployment(request):

    global received_data
    # Parse the form data
    if request.method == 'POST':
        # If this is a POST request, store the data for later processing
        received_data = json.loads(request.body.decode('utf-8'))
        return JsonResponse({"message": "Data received."}, status=200)
    
    # GET METHOD
    elif request.method == 'GET': 
        try:
            if received_data is None:
                # If no data has been received yet, return an error
                return JsonResponse({"error": "No data has been received yet."}, status=400)
            else:
                # If data has been received, validate it
                is_valid, message = validate_form_data(received_data)
                if is_valid:
                    # If the data is valid, print it and return a success message
                    print(received_data)
                    return JsonResponse({"message": message, "received_data": received_data}, status=200)
                else:
                    # If the data is not valid, return an error message
                    return JsonResponse({"error": message, "inconsistencies": inconsistencies}, status=400)
        except Exception as e:
            # Handle other exceptions
            return JsonResponse({"error": "The form data is not valid due to ontology inconsistency."}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method. Only POST and GET are allowed."}, status=405)

def home(request):
    return JsonResponse({'info': 'Hello, H K!'}, safe=False)