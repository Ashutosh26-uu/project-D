import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const SimulationPortal = () => {
  const [mode, setMode] = useState('live');
  const [virtualDrones, setVirtualDrones] = useState([]);
  const [detections, setDetections] = useState([]);
  const [message, setMessage] = useState('');

  const toggleMode = async (newMode) => {
    const res = await fetch(`${API_BASE_URL}/api/sim/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: newMode })
    });
    const data = await res.json();
    setMode(data.mode);
    setMessage(data.success ? `Mode set to ${data.mode}` : 'Failed to set mode');
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sim/virtual-drones`)
      .then(res => res.json())
      .then(data => setVirtualDrones(data.drones || []));
    fetch(`${API_BASE_URL}/api/sim/mock-detections`)
      .then(res => res.json())
      .then(data => setDetections(data.detections || []));
  }, [mode]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Simulation Mode</h2>
      <div>
        <button onClick={() => toggleMode('live')}>Live Mode</button>
        <button onClick={() => toggleMode('simulated')} style={{ marginLeft: 10 }}>Simulated Mode</button>
      </div>
      <div style={{ marginTop: 20 }}>
        <h4>Virtual Drones</h4>
        <ul>
          {virtualDrones.map(d => (
            <li key={d.name}>{d.name}: {d.status}</li>
          ))}
        </ul>
        <h4>Mock AI Detections</h4>
        <ul>
          {detections.map((det, i) => (
            <li key={i}>{det.drone}: {det.type} ({det.confidence})</li>
          ))}
        </ul>
      </div>
      {message && <div style={{ marginTop: 10, color: 'green' }}>{message}</div>}
    </div>
  );
};

export default SimulationPortal; 