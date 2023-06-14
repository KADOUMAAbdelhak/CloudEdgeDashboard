import React from 'react';
import { useLocation } from 'react-router-dom';

const DeploymentInfo = () => {
  const location = useLocation();
  const serverResponse = location.state.serverResponse;

  return (
    <div>
      <h1>Deployment Information</h1>
      <pre>{serverResponse}</pre>
    </div>
  );
};

export default DeploymentInfo;