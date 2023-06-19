import React from 'react';
import { useLocation } from 'react-router-dom';
import './DeploymentInfo.css';

const DeploymentInfo = () => {
  const location = useLocation();
  const serverResponse = location.state.serverResponse;

  // Check if serverResponse and serviceStates exist
  let serviceStates;
  if (serverResponse && serverResponse.serviceStates) {
    // Parse service states into an array of strings
    serviceStates = serverResponse.serviceStates.split('\n').filter(line => line);
  }

  return (
    <div className="deployment-info">
      <h1>Deployment Information</h1>
      {serverResponse && (
        <>
          <div>
            <h2>Message : 'Docker compose file generated and services deployed successfully'</h2>
            {serverResponse.message === 'Docker compose file generated and services deployed successfully' ?
              <p className="success-message">{serverResponse.message}</p> :
              <p className="error-message">{serverResponse.message}</p>}
          </div>
          {serviceStates && (
            <div>
              <h2>Service States</h2>
              <table className="service-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Command</th>
                    <th>State</th>
                    <th>Ports</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceStates.map((state, index) => {
                    // Split each service state into its components
                    const [name, command, stateStatus, ports] = state.split(/\s{2,}/);  // Use regex to split by 2 or more spaces
                    return (
                      <tr key={index}>
                        <td>{name}</td>
                        <td>{command}</td>
                        <td>{stateStatus}</td>
                        <td>{ports}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {serverResponse.serviceLogs && (
            <div>
              <h2>Service Logs</h2>
              <pre className="code-block">{serverResponse.serviceLogs}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeploymentInfo;
