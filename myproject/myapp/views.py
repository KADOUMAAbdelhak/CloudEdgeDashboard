from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import HttpResponse, JsonResponse
from owlready2 import *
from .ontologies.ontology_validation import validate_form_data




# This variable will store the most recently received data
received_data = None


@csrf_exempt
def deployment(request):
    global received_data

    if request.method == 'POST':
        # Parse the request body as JSON
        data = json.loads(request.body)

        # Store the received data
        received_data = data

        return JsonResponse({"message": "Data received."}, status=200)
    elif request.method == 'GET':
        
        if received_data is not None:
            
            # Return the most recently received data
            return JsonResponse(received_data, status=200)
        else:
            return JsonResponse({"message": "No data has been received yet."}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method. Only POST and GET are allowed."}, status=405)


    

def home(request):
    return JsonResponse({'info': 'Hello, H K!'}, safe=False)

# Create your views here.

def handle_form_submission(request):
    if request.method == 'POST':
        form_data = json.loads(request.body)
        ...
        valid, message = validate_form_data(form_data)
        if valid:
            return JsonResponse({"message": "Form data is valid"}, status=200)
        else:
            return JsonResponse({"message": message}, status=400)
    else:
        return JsonResponse({"message": "Invalid request method. Only POST requests are accepted."}, status=405)