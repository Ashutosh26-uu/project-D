import React, { useState } from 'react';
import './DroneDashboard.css';

const DEMO_SWARM = [
  { id: 1, name: 'Pinaak-01', sync: 'Synchronized' },
  { id: 2, name: 'Akash-02', sync: 'Synchronized' },
  { id: 3, name: 'Prithvi-03', sync: 'Paused' },
  { id: 4, name: 'Arjun-04', sync: 'Synchronized' },
];

export default function SwarmAISyncPortal() {
  const [swarm, setSwarm] = useState(DEMO_SWARM);
  const [log, setLog] = useState([]);

  const handleSync = (id, action) => {
    setSwarm(s => s.map(d => d.id === id ? { ...d, sync: action === 'Sync Now' ? 'Synchronized' : 'Paused' } : d));
    setLog(lg => [
      { time: new Date().toLocaleTimeString(), drone: swarm.find(d => d.id === id).name, action },
      ...lg.slice(0, 19)
    ]);
  };

  return (
    <div className="dashboard-panel" style={{ minWidth: 400, maxWidth: 900, margin: '0 auto' }}>
      <h2>Sync Control</h2>
      <p style={{ color: '#888', marginBottom: 12 }}>Swarm-level AI coordination, status, and sync actions</p>
      <table className="dashboard-table" style={{ width: '100%', minWidth: 600 }}>
        <thead>
          <tr>
            <th>Drone</th>
            <th>Sync Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {swarm.map(drone => (
            <tr key={drone.id}>
              <td>{drone.name}</td>
              <td style={{ color: drone.sync === 'Synchronized' ? '#4CAF50' : '#ffaa00', fontWeight: 600 }}>{drone.sync}</td>
              <td>
                <button onClick={() => handleSync(drone.id, 'Sync Now')} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, fontSize: 15, marginRight: 8, cursor: 'pointer' }}>Sync Now</button>
                <button onClick={() => handleSync(drone.id, 'Pause Sync')} style={{ background: '#ffaa00', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Pause Sync</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 28 }}>
        <h4 style={{ color: '#1976d2' }}>Sync Log</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {log.map((entry, idx) => (
            <li key={idx} style={{ marginBottom: 8, background: '#e3f2fd', borderRadius: 6, padding: '8px 16px', color: '#1976d2', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 4px #1976d211' }}>
              [{entry.time}] {entry.drone}: {entry.action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 