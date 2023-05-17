import React, { useState } from 'react';
import './DeploymentForm.css'; // Import the CSS file for styling

function DeploymentForm() {
  const [formData, setFormData] = useState({
    serviceName: '',
    // Add other form fields here
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="deployment-form-container">
      <h2>Deployment Form</h2>
      <form className="deployment-form" onSubmit={handleSubmit}>
        <label htmlFor="serviceName">Service Name:</label>
        <input
          type="text"
          id="serviceName"
          name="serviceName"
          value={formData.serviceName}
          onChange={handleChange}
        />
        {/* Add other form fields here */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default DeploymentForm;
