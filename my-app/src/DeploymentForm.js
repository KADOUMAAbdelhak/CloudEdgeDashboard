import React from 'react';
import { Formik, Field, FieldArray, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



const DeploymentForm = () => {

  const [microservices, setMicroservices] = useState([]);

  const handleAddMicroservice = () => {
    setMicroservices([
      ...microservices,
      {
        serviceName: '',
        containerImage: '',
        replicas: '',
        cpu: '',
        memory: '',
        ports: '',
        environmentVariables: [''],
      },
    ]);
    toast.success('Microservice added successfully'); // Show success notification
  };

  const handleRemoveMicroservice = (index) => {
    const updatedMicroservices = [...microservices];
    updatedMicroservices.splice(index, 1);
    setMicroservices(updatedMicroservices);
    toast.success('Microservice removed successfully')
  };

  // Define validation schema using Yup
  
  const validationSchema = Yup.object().shape({
    applicationName: Yup.string()
    .required('Application Name is required')
    .matches(/^[a-zA-Z0-9]+$/, 'Application Name must be one word and consist of alphanumeric characters only.'),
    applicationVersion: Yup.string()
    .required('Application Version is required')
    .matches(/^(\d\.)?(\d\.)?(\*|\d)$/, 'Application Version must follow semantic versioning (x.y.z)'),
    microservices: Yup.array()
        .min(1, 'At least one microservice must be provided')
        .of(
      Yup.object().shape({
        serviceName: Yup.string().required('Service Name is required'),
        containerImage: Yup.string()
        .required('Container Image is required')
        .matches(
            /^([a-z0-9]+(-[a-z0-9]+)*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(:(\w+))?(\/([\w]+))?$/,
            'Container Image must follow Docker naming conventions'
        ),
        replicas: Yup.number().required('Number of Replicas is required').positive('Number of Replicas must be positive').integer('Number of Replicas must be an integer'),
        cpu: Yup.string().required('CPU is required'),
        memory: Yup.string().required('Memory is required'),
        ports: Yup.string()
        .required('Ports are required')
        .matches(
          /^([1-9][0-9]{0,4}|0):([1-9][0-9]{0,4}|0)$/,
          'Ports must be in format: containerPort:hostPort and port numbers must be between 1 and 65535'
        ),
        environmentVariables: Yup.array().of(
          Yup.string()
            .required('Environment variable is required')
            .matches(/^(\w+)=(\w+)$/, 'Environment variable must be in KEY=VALUE format')
        )
      })
    ),
  });

  // Inside your component...
  const navigate = useNavigate();
  const [yamlData, setYamlData] = useState('');

  // Minimum one microservice
  const validateMicroservices = (value) => {
    let error;
    if (!value || value.length === 0) {
      toast.error('At least one microservice must be added');
    }
    return error;
  };
  
  // Uniqueness of service name
  const validateUniqueServiceNames = (value, index, values) => {
    const serviceNames = values.microservices.map((m) => m.serviceName);
    const duplicateCount = serviceNames.filter((name) => name === value).length;
    if (duplicateCount > 1) {
      return 'Each microservice must have a unique service name';
    }
    return;
  };
  


  // Then in your axios post method...
  const sendForm = async (values) => {
    try {
      const response = await axios.post('http://localhost:8000/api/deployment/', values);

      if (response.status === 200) {
        toast.success('Form submitted successfully');
        let yamlData = response.data.data;
        setYamlData(yamlData);
        navigate('/yaml-display', { state: { yamlData: yamlData } });
      } else {
        throw new Error(`Request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('HTTP request failed:', error);
      toast.error('An error occurred while submitting the form');
    }
  };

  return (
    <div className="container">
      <h1 className="text-center"> Microservice Deployment Information </h1>
      <Formik
        initialValues={{
          applicationName: '',
          applicationVersion: '',
          microservices: [{
            serviceName: '',
            containerImage: '',
            replicas: '',
            cpu: '',
            memory: '',
            ports: '',
            environmentVariables: [''],
          }],
        }}

        validationSchema={validationSchema} // Provide the validation schema to Formik

        validate={validateMicroservices} // Provide The validation of microservice to Formik 

        // validate={validateUniqueServiceNames} // Custom validation for unique service names

        onSubmit={(values, { setSubmitting, resetForm }) => {
          sendForm(values)
            .then(data => {
              console.log(data);  // print the response data
              setSubmitting(false);
              resetForm();
            })
            .catch(error => {
              console.error('Form submission failed:', error);
              setSubmitting(false);
            });
            
        }}
      >
        <Form method="post" action='/yaml-display'>
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
          <FieldArray validate={validateMicroservices} name="microservices">
            {({ push, remove, form: { values } }) => (
              <>
                {microservices.map((_, index) => (
                  <div key={index} className="microservice-field">

                    <h3> Microservice {index + 1}</h3>

                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].serviceName`} className="form-label">Service Name</label>
                      <Field
                        validate={(value) => validateUniqueServiceNames(value, index, values)}
                        name={`microservices[${index}].serviceName`}
                        placeholder="Service Name"
                        className="form-control"
                      />
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
                      <label htmlFor={`microservices[${index}].ports`} className="form-label">Ports</label>
                      <Field name={`microservices[${index}].ports`} placeholder="containerPort:hostPort" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].ports`} component="div" className="text-danger" />
                    </div>

                    {/* Start of environment variables section */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].environmentVariables`} className="form-label">Environment Variables</label>
                      <FieldArray name={`microservices[${index}].environmentVariables`} placeholder="KEY=VALUE">
                        {({ push, remove }) => (
                          <>
                            {values.microservices[index].environmentVariables.map((_, subIndex) => (
                              <div key={subIndex}>
                                <Field name={`microservices[${index}].environmentVariables[${subIndex}]`} placeholder="KEY=VALUE" className="form-control"/>
                                <button type="button" onClick={() => remove(subIndex)}>Remove Variable</button>
                              </div>
                            ))}
                            <button type="button" onClick={() => push('')}>Add Variable</button>
                          </>
                        )}
                      </FieldArray>
                      <ErrorMessage name={`microservices[${index}].environmentVariables`} component="div" className="text-danger" />
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

          <button type="submit" className="btn btn-primary" >Submit</button>
        </Form>
      </Formik>
      <ToastContainer />
    </div>
  );
};

export default DeploymentForm;
