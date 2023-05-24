import React, { useState } from 'react';
import { Formik, Field, FieldArray, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
// import { fetch } from 'whatwg-fetch';  // Fetch API



const DeploymentForm = () => {

  const [microservices, setMicroservices] = useState([]);

  const handleAddMicroservice = () => {
    setMicroservices([
      ...microservices,
      { serviceName: '', containerImage: '', replicas: '', cpu: '', memory: '', environmentVariables: '', ports: '', persistentVolume: '', configuration: '', healthCheck: '' }
    ]);
    toast.success('Microservice added successfully'); // Show success notification
  };

  const handleRemoveMicroservice = (index) => {
    const updatedMicroservices = [...microservices];
    updatedMicroservices.splice(index, 1);
    setMicroservices(updatedMicroservices);
  };

  // Define validation schema using Yup

  const validationSchema = Yup.object().shape({
    applicationName: Yup.string().required('Application Name is required'),
    microservices: Yup.array().of(
      Yup.object().shape({
        serviceName: Yup.string().required('Service Name is required'),
        containerImage: Yup.string().required('Container Image is required'),
        replicas: Yup.number().required('Number of Replicas is required').positive('Number of Replicas must be positive').integer('Number of Replicas must be an integer'),
        cpu: Yup.string().required('CPU is required'),
        memory: Yup.string().required('Memory is required'),
      })
    ),
  });

  const validateUniqueServiceNames = (values) => {
    const serviceNames = values.microservices.map((microservice) => microservice.serviceName);
    const uniqueServiceNames = new Set(serviceNames);
    if (serviceNames.length !== uniqueServiceNames.size) {
      return 'Each microservice must have a unique service name';
    }
    return undefined;
  };

  const sendForm = async (values) => {
    try {
      const response = await axios.post('http://localhost:8000/api/deployment/', values);
  
      if (response.status === 200) {
        toast.success('Form submitted successfully');
        // eslint-disable-next-line no-restricted-globals
        
        return response.data;
      } else {
        throw new Error(`Request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('HTTP request failed:', error);
      toast.error('An error occurred while submitting the form');
    }
  };

  /* const sendForm = async (values) => {
    try {
        const response = await axios.post('http://localhost:8000/api/submit-deployment', values);

        if (response.status === 200) {
            toast.success('Form submitted successfully');
            return response.data;
        } else if (response.data && response.data.message) {
            throw new Error(response.data.message);
        } else {
            throw new Error(`Request failed: ${response.status}`);
        }
    } catch (error) {
        console.error('HTTP request failed:', error);
        toast.error(error.message || 'An error occurred while submitting the form');
    }
};*/


  return (
    <div className="container">
      <h1 className="text-center"> Microservice Deployment Information </h1>
      <Formik
        initialValues={{
          applicationName: '',
          applicationVersion: '',
          microservices: [],
        }}

        validationSchema={validationSchema} // Provide the validation schema to Formik

        validate={validateUniqueServiceNames} // Custom validation for unique service names
        

        onSubmit={(values, { setSubmitting }) => {
          sendForm(values).then(data => {
              // console.log(data);  // print the response data
              setSubmitting(false);
          });
      }}
      

        /* onSubmit={async (values, { setSubmitting }) => {
          // Send a POST request to the Django server
          try {
              const response = await fetch('http://localhost:8000/api/deployment/', {
                  method: 'POST', // Here we are specifying that it should be a POST request
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(values), // Convert the form data to JSON
              });

              // If the request was successful, you can use the response data
              if (response.ok) {
                  const data = await response.json();
                  console.log(data);
                  toast.success('Form submitted successfully');
              } else {
                  throw new Error(`Request failed: ${response.status}`);
              }
          } catch (error) {
              console.error('HTTP request failed:', error);
              toast.error('An error occurred while submitting the form');
          }

          setSubmitting(false);
        }}*/
      >
        <Form>
          {/* Application Information */}
          <div className="row">
            <div className="col-md-6">
              <fieldset>
                <legend> Application Information </legend>

                <div className="mb-3">
                  <label htmlFor="applicationName" className="form-label">
                    Application Name
                  </label>
                  <Field
                    id="applicationName"
                    name="applicationName"
                    placeholder="Application Name"
                    className="form-control"
                  />
                  <ErrorMessage name="applicationName" component="div" className="text-danger" />
                </div>

                <div className="mb-3">
                  <label htmlFor="applicationVersion" className="form-label">
                    Application Version
                  </label>
                  <Field
                    id="applicationVersion"
                    name="applicationVersion"
                    placeholder="Application Version"
                    className="form-control"
                  />
                  <ErrorMessage name="applicationVersion" component="div" className="text-danger" />
                </div>
              </fieldset>
            </div>
          </div>

          {/* Microservices */}
          <FieldArray name="microservices">
            {({ push, remove }) => (
              <>
                {microservices.map((_, index) => (
                  <div key={index} className="microservice-field">

                    <h3> Microservice {index + 1}</h3>

                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].serviceName`} className="form-label">Service Name</label>
                      <Field name={`microservices[${index}].serviceName`} placeholder="Service Name" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].serviceName`} component="div" className="text-danger" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].containerImage`} className="form-label">Container Image</label>
                      <Field name={`microservices[${index}].containerImage`} placeholder="Container Image" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].containerImage`} component="div" className="text-danger" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].replicas`} className="form-label">Number of Replicas</label>
                      <Field name={`microservices[${index}].replicas`} placeholder="Number of Replicas" type="number" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].replicas`} component="div" className="text-danger" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].cpu`} className="form-label">CPU</label>
                      <Field name={`microservices[${index}].cpu`} placeholder="CPU" type="number" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].cpu`} component="div" className="text-danger" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].memory`} className="form-label">Memory</label>
                      <Field name={`microservices[${index}].memory`} placeholder="Memory" type="number" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].memory`} component="div" className="text-danger" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].containerPort`} className="form-label">Container Port</label>
                      <Field name={`microservices[${index}].containerPort`} placeholder="Container Port" type="number" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].containerPort`} component="div" className="text-danger" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].servicePort`} className="form-label">Service Port</label>
                      <Field name={`microservices[${index}].servicePort`} placeholder="Service Port" type="number" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].servicePort`} component="div" className="text-danger" />
                    </div>

                    {/* Add more fields specific to each microservice */}
                    {/* ... */}

                    <button type="button" onClick={() => handleRemoveMicroservice(index)} className="btn btn-danger">
                      Remove Microservice
                    </button>
                  </div>
                ))}

                <button type="button" onClick={handleAddMicroservice} className="btn btn-success">
                  Add Microservice
                </button>
              </>
            )}
          </FieldArray>

          <button type="submit" className="btn btn-primary">Submit</button>
        </Form>
      </Formik>
      <ToastContainer />
    </div>
  );
};

export default DeploymentForm;
