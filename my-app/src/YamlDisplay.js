import React, { useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-monokai';
import { useLocation, useNavigate } from 'react-router-dom';

function YamlDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const yamlData = location.state?.yamlData || "";

  const [serverResponse, setServerResponse] = useState(null);
  const [error, setError] = useState(null);

  console.log(yamlData);

  const sendToServer = async () => {
    setError(null);
    const response = await fetch('http://localhost:8000/api/yaml/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ yamlData }),
    });

    if (!response.ok) {
      setError('Failed to send YAML data to server');
      return;
    }

    const data = await response.json();
    const formattedData = JSON.stringify(data, null, 2);
    setServerResponse(formattedData);
    navigate('/deployment-info', { state: { serverResponse: formattedData }}); // redirecting to new component with response data

    console.log('YAML data sent successfully');
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderRadius: '10px' }}>
      <h1>YAML Templating Language</h1>
      <AceEditor
        mode="yaml"
        theme="monokai"
        name="YAML_EDITOR"
        value={yamlData}
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
          fontSize: 16, // Makes the font inside the editor bigger
        }}
        readOnly={true}
      />
      <button style={{ marginTop: '20px', padding: '10px', borderRadius: '5px', backgroundColor: '#008CBA', color: 'white', fontSize: '16px' }} onClick={sendToServer}>Deploy</button>
      {error && (
        <div style={{ marginTop: '20px', fontSize: '16px' }}>
          <h2>Error:</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

export default YamlDisplay;
