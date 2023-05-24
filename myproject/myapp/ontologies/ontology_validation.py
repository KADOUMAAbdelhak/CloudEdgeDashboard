from owlready2 import World

def validate_form_data(form_data):
    world = World()

    # Load your ontology (suppose your ontology is named "deployment.owl")
    # This should be the path to your .owl file in your Django application.
    ontology = world.get_ontology("osr.owl").load()

    # Instantiate the classes using the form data. Let's consider 'Application' class as an example:
    # Assume form_data is a dictionary with 'applicationName' as one of the keys
    application_instance = ontology.Application(form_data['applicationName'])

    # Similarly, create instances for 'Microservice' class and add data properties, like:
    # (You should loop this part for each microservice in the submitted form data)
    microservice_instance = ontology.Microservice(form_data['microserviceName'])
    microservice_instance.hasImage = form_data['containerImage']
    microservice_instance.hasCPU = form_data['cpu']
    # ... (Add other properties as necessary)
    
    # Then link the application instance and microservice instance using the object property
    application_instance.hasMicroservices = [microservice_instance]

    # After creating the instances, use a reasoner to infer new knowledge and check consistency
    with ontology:
        # The Pellet reasoner can be used as follows:
        sync_reasoner_pellet(infer_property_values = True, infer_data_property_values = True)

        # Now check if the inferred ontology is consistent
        if world.consistent:
            return True, "Form data is valid"
        else:
            # If not consistent, generate a message explaining why
            return False, "Form data is inconsistent"

    # If we somehow reached here without returning, return a generic failure message
    return False, "Could not validate form data"

'''
def handle_form_submission(request):
    # Load the ontology
    ontology = get_ontology("ontologies/osr.owl").load()

    # Assume the form data is in request.POST
    # You should replace the field names with your actual form field names
    app_name = request.POST.get('applicationName')
    app_version = request.POST.get('applicationVersion')

    # Create an instance of Application and set its properties
    with ontology:
        app = ontology.Application(app_name)
        app.hasVersion = [app_version]
        
        # Iterate over microservices
        for i, microservice in enumerate(request.POST.get('microservices', [])):
            # Create a Microservice instance for each microservice in the form data
            microservice_instance = ontology.Microservice(microservice['name'])
            microservice_instance.hasImage = [microservice['containerImage']]
            microservice_instance.hasReplicas = [microservice['replicas']]
            microservice_instance.hasCPU = [microservice['cpu']]
            microservice_instance.hasMemory = [microservice['memory']]
            microservice_instance.hasContainerPort = [microservice['containerPort']]
            microservice_instance.hasServicePort = [microservice['servicePort']]
            
            # Connect the microservice to the application
            app.hasMicroservices.append(microservice_instance)

    # Now, call the reasoner and validate the instances
    sync_reasoner_pellet(infer_property_values=True)
    
    # Check if the ontology is consistent
    is_consistent = ontology.is_consistent()

    # If the ontology is not consistent, return an error message
    if not is_consistent:
        return JsonResponse({
            'status': 'error',
            'message': 'Form data is not valid'
        })

    # If everything is okay, continue processing the form data
    # ...
    if is_consistent:
        return JsonResponse({
            'status': 'success',
            'message': 'Form data is valid'
            })
'''

