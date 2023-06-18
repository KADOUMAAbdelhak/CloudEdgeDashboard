import React from 'react';
import { useLocation } from 'react-router-dom';
import './DeploymentInfo.css';

const DeploymentInfo = () => {
  const location = useLocation();
  const serverResponse = location.state.serverResponse;

  return (
    <div className="deployment-info">
      <h1>Deployment Information</h1>
      <div>
        <h2>Message</h2>
        <p>{serverResponse.message}</p>
      </div>
      <div>
        <h2>Service States</h2>
        <pre className="code-block">{serverResponse.serviceStates}</pre>
      </div>
      <div>
        <h2>Service Logs</h2>
        <pre className="code-block">{serverResponse.serviceLogs}</pre>
      </div>
    </div>
  );
};

export default DeploymentInfo;
