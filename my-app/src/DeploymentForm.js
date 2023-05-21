import React, { useState } from 'react';
import { Formik, Field, FieldArray, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import './DeploymentForm.css';



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
    applicationVersion: Yup.string().required('Application Version is required'),
    microservices: Yup.array().of(
      Yup.object().shape({
        serviceName: Yup.string().required('Service Name is required'),
        containerImage: Yup.string().required('Container Image is required'),
        replicas: Yup.number().required('Number of Replicas is required').positive('Number of Replicas must be positive').integer('Number of Replicas must be an integer'),
        cpu: Yup.string().required('CPU is required'),
        memory: Yup.string().required('Memory is required'),
        // Add more validation for other microservice fields
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

  return (
    <div className="container">
      <h1 className="text-center">Microservice Deployment Information</h1>
      <Formik
        initialValues={{
          applicationName: '',
          applicationVersion: '',
          microservices: [],
        }}
        validationSchema={validationSchema} // Provide the validation schema to Formik
        validate={validateUniqueServiceNames} // Custom validation for unique service names
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 500));
          alert(JSON.stringify(values, null, 2));
        }}
      >
        <Form >
          {/* Application Information */}
          <div className="row">
            <div className="col-md-6">
              <fieldset>
                <legend>Application Information</legend>

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

                    <h3>Microservice {index + 1}</h3>

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
      <style jsx>{`
        .microservice-field {
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
          opacity: 1;
          transform: translateY(0);
          margin-bottom: 2rem;
        }

        .microservice-field-exit {
          opacity: 0;
          transform: translateY(-10px);
        }

        .form-label {
          font-weight: bold;
        }

        .form-control {
          width: 100%;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          color: #495057;
          background-color: #fff;
          background-clip: padding-box;
          border: 1px solid #ced4da;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .text-danger {
          color: #dc3545;
        }

        .btn-danger {
          color: #fff;
          background-color: #dc3545;
          border-color: #dc3545;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .btn-success {
          color: #fff;
          background-color: #28a745;
          border-color: #28a745;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .btn-primary {
          color: #fff;
          background-color: #007bff;
          border-color: #007bff;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DeploymentForm;
