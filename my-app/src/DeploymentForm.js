import React from 'react';
import { Formik, Field, FieldArray, Form, ErrorMessage } from 'formik';
import { useFormikContext } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';



const DeploymentForm = () => {

  const MyComponent = () => {
    const { values } = useFormikContext();
  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('formValues', JSON.stringify(values));
  }, [values]);
  
    // rest of your component...
  };
  
  // Define validation schema using Yup
  
  const validationSchema = Yup.object().shape({
    microservices: Yup.array()
      .min(1, 'At least one microservice must be provided')
      .of(
        Yup.object().shape({
          serviceName: Yup.string().required('Service Name is required'),
          containerImage: Yup.string()
            .required('Container Image is required'),
          cpu: Yup.string().required('CPU is required'),
          memory: Yup.string().required('Memory is required'),
          ports: Yup.array()
            .of(
              Yup.string()
                .required('Port mapping is required')
                .matches(/^(\d+):(\d+)$/, 'Port mapping must be in "hostPort:contianerPort" format')
                .test('is-valid-port', 'Ports must be numbers between 1 and 65535', function(value) {
                  const ports = value.split(':').map(Number);
                  return ports.every(port => port > 0 && port <= 65535);
                }),
            )
            .min(1, 'At least one port mapping is required'),
          environmentVariables: Yup.string(), 
          dependentService: Yup.string(),
          labels: Yup.string(),
          restartPolicy: Yup.string().required('Restart policy is required'),
          healthCheck: Yup.string(),
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
        // If successful, clear form data from localStorage
        localStorage.removeItem('formValues');
        toast.success('Form submitted successfully');
        let yamlData = response.data.data;
        setYamlData(yamlData);
        navigate('/yaml-display', { state: { yamlData: yamlData } });
      } else {
        throw new Error(`Request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('HTTP request failed:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        toast.error(`An error occurred while submitting the form: ${error.response.data.error}`);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in Node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
    }
  };
  // Load form data from localStorage before rendering the form
  let initialValues = {
    microservices: [{
      serviceName: '',
      containerImage: '',
      cpu: '',
      memory: '',
      ports: [],
      environmentVariables: '',
      restartPolicy: '',
      healthCheck: '',
      volumes: '',
      networks: ''
    }],
  };

  const savedFormValues = localStorage.getItem('formValues');
  if (savedFormValues) {
    initialValues = JSON.parse(savedFormValues);
  }

  const onSubmit = (values, actions) => {
    // Transform environment variables from array to comma-separated string
    values.microservices = values.microservices.map((ms) => ({
      ...ms,
      environmentVariables: ms.environmentVariables.join(','),
    }));
  
    sendForm(values);
    actions.setSubmitting(false);
  };



  return (
    <div className="container">
      <h1 className="text-center"> Microservice Deployment Information </h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema} // Provide the validation schema to Formik
        validate={validateMicroservices} // Provide The validation of microservice to Formik 
        validateUniqueServiceNames={validateUniqueServiceNames} // Custom validation for unique service names

        onSubmit={(values, actions) => {
          sendForm(values);
          actions.setSubmitting(false);
        }}
      >
        <Form method="post" action='/yaml-display'>
          {/* Microservices */}
          <FieldArray validate={validateMicroservices} name="microservices">
            {({ push, remove, form: { values } }) => (
              <>
                {values.microservices.map((_, index) => (
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

                    {/* Image section */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].containerImage`} className="form-label">Container Image</label>
                      <small className="form-text text-muted"> Please enter the Docker image name for your service, e.g., 'nginx:latest' </small>
                      <Field name={`microservices[${index}].containerImage`} placeholder="Container Image" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].containerImage`} component="div" className="text-danger" />
                    </div>

                    {/* CPU section */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].cpu`} className="form-label">CPU</label>
                      <small className="form-text text-muted"> Specify the maximum amount of CPU resources that this service can use, e.g., '2' </small>
                      <Field name={`microservices[${index}].cpu`} placeholder="CPU" type="number" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].cpu`} component="div" className="text-danger" />
                    </div>

                    {/* memory section */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].memory`} className="form-label">Memory</label>
                      <small className="form-text text-muted"> Specify the maximum amount of memory (RAM) that this service can use, e.g., '512 or 1024' </small>
                      <Field name={`microservices[${index}].memory`} placeholder="Memory" type="number" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].memory`} component="div" className="text-danger" />
                    </div>

                    {/* Ports section */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].ports`} className="form-label">Ports</label>
                      <small className="form-text text-muted"> Enter the container port and the host port separated by a colon, e.g., '8080:80'</small>
                      <FieldArray name={`microservices[${index}].ports`}>
                        {({ insert, remove, push }) => (
                          <div>
                            {values.microservices[index].ports.length > 0 &&
                              values.microservices[index].ports.map((port, idx) => (
                                <div className="row" key={idx}>
                                  <div className="col">
                                    <Field
                                      name={`microservices[${index}].ports[${idx}]`}
                                      placeholder="hostPort:containerPort"
                                      className="form-control"
                                    />
                                  </div>
                                  <div className="col-auto">
                                    <button
                                      type="button"
                                      className="btn btn-primary mb-3"
                                      onClick={() => remove(idx)}
                                    >
                                      -
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-primary mb-3"
                                      onClick={() => insert(idx, '')}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <ErrorMessage
                                    name={`microservices[${index}].ports[${idx}]`}
                                    component="div"
                                    className="text-danger"
                                  />
                                </div>
                              ))}
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => push('')}
                            >
                              Add new port mapping
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>

                    {/* Start of environment variables section */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].environmentVariables`} className="form-label">Environment Variables</label>
                      <small className="form-text text-muted"> Enter the environment variables as "KEY=VALUE,"</small>
                      <Field name={`microservices[${index}].environmentVariables`} placeholder="KEY=VALUE," className="form-control" />
                      <ErrorMessage name={`microservices[${index}].environmentVariables`} component="div" className="text-danger" />
                    </div>

                    {/* Dependent Services */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].dependentService`} className="form-label">Dependent Services</label>
                      <small className="form-text text-muted"> List the names of other services that this service depends on.  </small>
                      <Field as="select" name={`microservices[${index}].dependentService`} className="form-control">
                        <option value="">None</option>
                        {values.microservices.map((microservice, microserviceIndex) => (
                          index !== microserviceIndex && (
                            <option key={microserviceIndex} value={microservice.serviceName}>
                              {microservice.serviceName}
                            </option>
                          )
                        ))}
                      </Field>
                      <ErrorMessage name={`microservices[${index}].dependentService`} component="div" className="text-danger" />
                    </div>

                    {/* Restart policies section */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].restartPolicy`} className="form-label">Restart Policy</label>
                      <small className="form-text text-muted"> Choose how the system should handle service restarts. </small>
                      <Field as="select" name={`microservices[${index}].restartPolicy`} className="form-control">
                        <option value="">Select...</option>
                        <option value="no">No</option>
                        <option value="always">Always</option>
                        <option value="on-failure">On Failure</option>
                        <option value="unless-stopped">Unless Stopped</option>
                      </Field>
                      <ErrorMessage name={`microservices[${index}].restartPolicy`} component="div" className="text-danger" />
                    </div>

                    {/* Health checks section */}
                    <div className="mb-3">
                      <label htmlFor={`microservices[${index}].healthCheck`} className="form-label">Health Check</label>
                      <small className="form-text text-muted"> Enter a command that the system can run to check the health of the service. </small>
                      <Field name={`microservices[${index}].healthCheck`} placeholder="Health Check URL" className="form-control" />
                      <ErrorMessage name={`microservices[${index}].healthCheck`} component="div" className="text-danger" />
                    </div>

                    {/* Add more fields specific to each microservice */}
                    {/* ... */}
                            
                    <button type="button" onClick={() => remove(index)} className="btn btn-danger">
                      Remove Microservice
                    </button>
                  </div>
                ))}

                <button type="button" onClick={() => push({
                        serviceName: '',
                        containerImage: '',
                        replicas: '',
                        cpu: '',
                        memory: '',
                        ports: [],
                        environmentVariables: '',
                        restartPolicy: '',
                        healthCheck: ''
                      })}
                        className="btn btn-success">
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
