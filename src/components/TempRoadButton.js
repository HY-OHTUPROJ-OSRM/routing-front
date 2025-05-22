import React, { useState } from 'react';
import TempRoads from './TempRoad.js';

function TempRoadButton() {
  const [showPanel, setShowPanel] = useState(false);

  const buttonStyle = {
    position: 'absolute',
    top: '80px',
    right: '10px',
    width: '40px',
    height: '40px',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const panelStyle = {
    position: 'absolute',
    top: '130px',
    right: '10px',
    width: '350px',
    maxHeight: '70vh',
    overflowY: 'auto',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    display: showPanel ? 'block' : 'none'
  };

  return (
    <>
      <button
        style={buttonStyle}
        onClick={() => setShowPanel(!showPanel)}
        title="Temporary Roads"
      >
        🛣️
      </button>
      
      <div style={panelStyle}>
        <TempRoads />
      </div>
    </>
  );
}

export default TempRoadButton;