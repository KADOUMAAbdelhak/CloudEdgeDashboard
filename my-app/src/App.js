import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeploymentForm from './DeploymentForm';
import YamlDisplay from './YamlDisplay';
import DeploymentInfo from './DeploymentInfo';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DeploymentForm />} />
          <Route path="/yaml-display" element={<YamlDisplay />} />
          <Route path="/deployment-info" element={<DeploymentInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
