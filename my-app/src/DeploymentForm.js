import React, { useState } from 'react';
import { Formik, Field, FieldArray, Form } from 'formik';

const DeploymentForm = () => {
  const [microservices, setMicroservices] = useState([]);

  const handleAddMicroservice = () => {
    setMicroservices([...microservices, { serviceName: '', containerImage: '', replicas: '', cpu: '', memory: '', environmentVariables: '', ports: '', persistentVolume: '', configuration: '', healthCheck: '' }]);
  };

  const handleRemoveMicroservice = (index) => {
    const updatedMicroservices = [...microservices];
    updatedMicroservices.splice(index, 1);
    setMicroservices(updatedMicroservices);
  };

  return (
    <div>
      <h1>Microservice Deployment Information</h1>
      <Formik
        initialValues={{
          microservices: [],
        }}
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 500));
          alert(JSON.stringify(values, null, 2));
        }}
      >
        <Form>
          <FieldArray name="microservices">
            {({ push, remove }) => (
              <>
                {microservices.map((_, index) => (
                  <div key={index}>
                    <h3>Microservice {index + 1}</h3>
                    <label htmlFor={`microservices[${index}].serviceName`}>Service Name</label>
                    <Field name={`microservices[${index}].serviceName`} placeholder="Service Name" />

                    <label htmlFor={`microservices[${index}].containerImage`}>Container Image</label>
                    <Field name={`microservices[${index}].containerImage`} placeholder="Container Image" />

                    <label htmlFor={`microservices[${index}].replicas`}>Number of Replicas</label>
                    <Field name={`microservices[${index}].replicas`} placeholder="Number of Replicas" type="number" />

                    <label htmlFor={`microservices[${index}].cpu`}>CPU</label>
                    <Field name={`microservices[${index}].cpu`} placeholder="CPU Limit" />

                    <label htmlFor={`microservices[${index}].memory`}>Memory</label>
                    <Field name={`microservices[${index}].memory`} placeholder="Memory Limit" />

                    <label htmlFor={`microservices[${index}].storageRequest`}>Storage Request</label>
                    <Field name={`microservices[${index}].storageRequest`} placeholder="Storage Request" />

                    <label htmlFor={`microservices[${index}].containerPort`}>Container Port</label>
                    <Field name={`microservices[${index}].containerPort`} placeholder="Container Port" />

                    <label htmlFor={`microservices[${index}].servicePort`}>Service Port</label>
                    <Field name={`microservices[${index}].servicePort`} placeholder="Service Port" />

                    <label htmlFor={`microservices[${index}].serviceType`}>Service Type</label>
                    <Field as="select" name={`microservices[${index}].serviceType`} placeholder="Service Type">
                      <option value="ClusterIP">ClusterIP</option>
                      <option value="NodePort">NodePort</option>
                      <option value="LoadBalancer">LoadBalancer</option>
                      <option value="ExternalName">ExternalName</option>
                    </Field>

                     


                    {/* Add more fields specific to each microservice */}
                    {/* ... */}

                    <button type="button" onClick={() => handleRemoveMicroservice(index)}>
                      Remove Microservice
                    </button>
                  </div>
                ))}

                <button type="button" onClick={handleAddMicroservice}>
                  Add Microservice
                </button>
              </>
            )}
          </FieldArray>

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
};

export default DeploymentForm;
