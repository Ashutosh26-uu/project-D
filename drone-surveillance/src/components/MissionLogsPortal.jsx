import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const MissionLogsPortal = () => {
  const [missions, setMissions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/missions/list`)
      .then(res => res.json())
      .then(data => setMissions(data.missions || []));
  }, []);

  const replayMission = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/missions/${id}/replay`);
    const data = await res.json();
    setMessage(data.success ? 'Replay started!' : 'Failed to replay');
  };

  const exportMission = async (id, format) => {
    const res = await fetch(`${API_BASE_URL}/api/missions/${id}/export?format=${format}`);
    const data = await res.json();
    setMessage(data.success ? `Exported as ${format}` : 'Failed to export');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mission Logs & Flight History</h2>
      <ul>
        {missions.map(m => (
          <li key={m.id}>{m.name} ({m.date}) - Drones: {m.drones.join(', ')}
            <button onClick={() => replayMission(m.id)} style={{ marginLeft: 10 }}>Replay</button>
            <button onClick={() => exportMission(m.id, 'json')} style={{ marginLeft: 5 }}>Export JSON</button>
            <button onClick={() => exportMission(m.id, 'csv')} style={{ marginLeft: 5 }}>Export CSV</button>
          </li>
        ))}
      </ul>
      {message && <div style={{ marginTop: 10, color: 'green' }}>{message}</div>}
    </div>
  );
};

export default MissionLogsPortal; 