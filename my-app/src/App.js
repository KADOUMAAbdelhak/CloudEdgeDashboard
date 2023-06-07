import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeploymentForm from './DeploymentForm';
import YamlDisplay from './YamlDisplay';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DeploymentForm />} />
          <Route path="/yaml-display" element={<YamlDisplay />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
