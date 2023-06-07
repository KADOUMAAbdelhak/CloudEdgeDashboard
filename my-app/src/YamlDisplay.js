import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-monokai';
import { useLocation } from 'react-router-dom';

function YamlDisplay() {
  const location = useLocation();
  const yamlData = location.state.yamlData;

  console.log(yamlData);

  const sendToServer = async () => {
    const response = await fetch('http://localhost:8000/api/yaml/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ yamlData }),
    });

    if (!response.ok) {
      console.error('Failed to send YAML data to server');
      return;
    }

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
    </div>
  );
};

export default YamlDisplay;

