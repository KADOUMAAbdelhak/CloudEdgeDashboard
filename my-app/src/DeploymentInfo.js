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
        <pre className="code-block">{serverResponse}</pre>
      </div>
    </div>
  );
};

export default DeploymentInfo;
