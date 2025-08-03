import React, { useEffect, useState, useRef } from 'react';

const IFFPortal = () => {
  const [drones, setDrones] = useState([]);
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [iffStatus, setIffStatus] = useState('friend');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [threatLevel, setThreatLevel] = useState('low');
  const [confidence, setConfidence] = useState(85);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const wsRef = useRef(null);

  // Enhanced drone data with IFF information
  const enhancedDrones = [
    {
      id: 1,
      name: 'Prithvi-1',
      iff: 'friend',
      status: 'active',
      lastSeen: new Date(),
      signalStrength: 'strong',
      threatLevel: 'low',
      confidence: 95,
      location: { lat: 28.6139, lng: 77.2090 },
      classification: 'military_friendly',
      transponder: 'MIL-FRIEND-001'
    },
    {
      id: 2,
      name: 'Aakash-2',
      iff: 'friend',
      status: 'active',
      lastSeen: new Date(),
      signalStrength: 'strong',
      threatLevel: 'low',
      confidence: 92,
      location: { lat: 28.6145, lng: 77.2100 },
      classification: 'military_friendly',
      transponder: 'MIL-FRIEND-002'
    },
    {
      id: 3,
      name: 'Pinaka-3',
      iff: 'friend',
      status: 'active',
      lastSeen: new Date(),
      signalStrength: 'medium',
      threatLevel: 'low',
      confidence: 88,
      location: { lat: 28.6150, lng: 77.2080 },
      classification: 'military_friendly',
      transponder: 'MIL-FRIEND-003'
    }
  ];

  // Unknown targets detected
  const unknownTargets = [
    {
      id: 'TGT-001',
      type: 'aircraft',
      iff: 'unknown',
      status: 'detected',
      lastSeen: new Date(),
      signalStrength: 'weak',
      threatLevel: 'medium',
      confidence: 45,
      location: { lat: 28.6200, lng: 77.2150 },
      classification: 'unknown',
      transponder: 'UNKNOWN-001',
      velocity: { speed: 120, direction: 45 },
      altitude: 1500
    },
    {
      id: 'TGT-002',
      type: 'drone',
      iff: 'unknown',
      status: 'tracking',
      lastSeen: new Date(),
      signalStrength: 'medium',
      threatLevel: 'high',
      confidence: 78,
      location: { lat: 28.6180, lng: 77.2120 },
      classification: 'suspicious',
      transponder: 'UNKNOWN-002',
      velocity: { speed: 80, direction: 180 },
      altitude: 800
    }
  ];

  useEffect(() => {
    setDrones(enhancedDrones);
    setTargets(unknownTargets);

    // WebSocket connection for real-time updates
    wsRef.current = new WebSocket('ws://localhost:8080');
    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({ type: 'register', role: 'iff_client' }));
    };
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'iff_update') {
          handleIFFUpdate(data);
        } else if (data.type === 'new_target') {
          handleNewTarget(data);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    return () => wsRef.current && wsRef.current.close();
  }, []);

  const handleIFFUpdate = (data) => {
    if (data.droneId) {
      setDrones(prev => prev.map(d => 
        d.name === data.droneId ? { ...d, iff: data.status } : d
      ));
    }
  };

  const handleNewTarget = (data) => {
    const newTarget = {
      id: `TGT-${Date.now()}`,
      type: data.targetType || 'unknown',
      iff: 'unknown',
      status: 'detected',
      lastSeen: new Date(),
      signalStrength: data.signalStrength || 'weak',
      threatLevel: data.threatLevel || 'medium',
      confidence: data.confidence || 50,
      location: data.location || { lat: 28.6100, lng: 77.2000 },
      classification: 'unknown',
      transponder: `UNKNOWN-${Date.now()}`,
      velocity: data.velocity || { speed: 0, direction: 0 },
      altitude: data.altitude || 0
    };
    setTargets(prev => [newTarget, ...prev]);
  };

  const tagTarget = async (targetId, newIffStatus) => {
    try {
      const res = await fetch('http://localhost:5000/api/iff/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetId: targetId, 
          iff: newIffStatus,
          confidence: confidence,
          threatLevel: threatLevel
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage(`Target ${targetId} tagged as ${newIffStatus}`);
        
        // Update target status
        setTargets(prev => prev.map(t => 
          t.id === targetId ? { ...t, iff: newIffStatus, status: 'classified' } : t
        ));
        
        // Send WebSocket update
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'iff_classification',
            targetId: targetId,
            status: newIffStatus,
            timestamp: new Date().toISOString()
          }));
        }
      } else {
        setMessage('Failed to update target classification');
      }
    } catch (error) {
      setMessage('Error updating target classification');
      console.error('IFF tagging error:', error);
    }
  };

  const startScan = () => {
    setIsScanning(true);
    setScanResults([]);
    
    // Simulate scanning process
    const scanInterval = setInterval(() => {
      const newResult = {
        id: `SCAN-${Date.now()}`,
        timestamp: new Date(),
        targetType: ['aircraft', 'drone', 'missile', 'helicopter'][Math.floor(Math.random() * 4)],
        signalStrength: ['weak', 'medium', 'strong'][Math.floor(Math.random() * 3)],
        threatLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 100),
        location: {
          lat: 28.6100 + (Math.random() - 0.5) * 0.02,
          lng: 77.2000 + (Math.random() - 0.5) * 0.02
        }
      };
      
      setScanResults(prev => [newResult, ...prev]);
      
      if (scanResults.length >= 10) {
        clearInterval(scanInterval);
        setIsScanning(false);
      }
    }, 1000);
  };

  const getIFFColor = (iff) => {
    const colors = {
      friend: '#10b981',
      foe: '#ef4444',
      unknown: '#f59e0b',
      neutral: '#6b7280'
    };
    return colors[iff] || '#6b7280';
  };

  const getThreatColor = (level) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[level] || '#6b7280';
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return '#10b981';
    if (conf >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: '#f1f5f9',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            IFF (Identify Friend or Foe) System
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
            Advanced Target Identification and Classification System
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'targets', label: 'Targets' },
            { id: 'scanning', label: 'Scanning' },
            { id: 'classification', label: 'Classification' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : 'rgba(51, 65, 85, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* System Status */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[
                { label: 'Friendly Assets', value: drones.filter(d => d.iff === 'friend').length, icon: '🟢', color: '#10b981' },
                { label: 'Unknown Targets', value: targets.filter(t => t.iff === 'unknown').length, icon: '🟡', color: '#f59e0b' },
                { label: 'Hostile Targets', value: targets.filter(t => t.iff === 'foe').length, icon: '🔴', color: '#ef4444' },
                { label: 'Active Scans', value: isScanning ? 1 : 0, icon: '🔍', color: '#3b82f6' }
              ].map((metric, index) => (
                <div key={index} style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>{metric.icon}</div>
                  <div style={{ fontSize: '2em', fontWeight: 'bold', color: metric.color }}>
                    {metric.value}
                  </div>
                  <div style={{ color: '#94a3b8' }}>{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Friendly Assets */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginBottom: '20px', color:'#10b981'}}>Friendly Assets</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                {drones.map(drone => (
                  <div key={drone.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 'bold' }}>{drone.name}</span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: getIFFColor(drone.iff),
                          color: 'white',
                          fontSize: '0.8em'
                        }}>
                          {drone.iff.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                        Transponder: {drone.transponder} | Signal: {drone.signalStrength} | Confidence: {drone.confidence}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9em', color: '#94a3b8' }}>
                        Last Seen: {drone.lastSeen.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unknown Targets */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <h3 style={{ marginBottom: '20px', color: '#f59e0b' }}>Unknown Targets</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                {targets.filter(t => t.iff === 'unknown').map(target => (
                  <div key={target.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 'bold' }}>{target.id}</span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: getThreatColor(target.threatLevel),
                          color: 'white',
                          fontSize: '0.8em'
                        }}>
                          {target.threatLevel.toUpperCase()}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: getConfidenceColor(target.confidence),
                          color: 'white',
                          fontSize: '0.8em'
                        }}>
                          {target.confidence}%
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                        Type: {target.type} | Altitude: {target.altitude}m | Speed: {target.velocity.speed}km/h
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => tagTarget(target.id, 'friend')}
                        style={{
                          padding: '8px 16px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8em'
                        }}
                      >
                        Friend
                      </button>
                      <button
                        onClick={() => tagTarget(target.id, 'foe')}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8em'
                        }}
                      >
                        Foe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Targets Tab */}
        {activeTab === 'targets' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Target Management</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {targets.map(target => (
                <div key={target.id} style={{
                  padding: '20px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 10px 0' }}>{target.id}</h4>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: getIFFColor(target.iff),
                          color: 'white',
                          fontSize: '0.8em'
                        }}>
                          {target.iff.toUpperCase()}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: getThreatColor(target.threatLevel),
                          color: 'white',
                          fontSize: '0.8em'
                        }}>
                          {target.threatLevel.toUpperCase()}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: getConfidenceColor(target.confidence),
                          color: 'white',
                          fontSize: '0.8em'
                        }}>
                          {target.confidence}% Confidence
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9em', color: '#94a3b8' }}>
                        Last Seen: {target.lastSeen.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <strong>Type:</strong> {target.type}
                    </div>
                    <div>
                      <strong>Altitude:</strong> {target.altitude}m
                    </div>
                    <div>
                      <strong>Speed:</strong> {target.velocity.speed}km/h
                    </div>
                    <div>
                      <strong>Direction:</strong> {target.velocity.direction}°
                    </div>
                    <div>
                      <strong>Signal:</strong> {target.signalStrength}
                    </div>
                    <div>
                      <strong>Transponder:</strong> {target.transponder}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => tagTarget(target.id, 'friend')}
                      style={{
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9em'
                      }}
                    >
                      Mark as Friend
                    </button>
                    <button
                      onClick={() => tagTarget(target.id, 'foe')}
                      style={{
                        padding: '10px 20px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9em'
                      }}
                    >
                      Mark as Foe
                    </button>
                    <button
                      onClick={() => tagTarget(target.id, 'neutral')}
                      style={{
                        padding: '10px 20px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9em'
                      }}
                    >
                      Mark as Neutral
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanning Tab */}
        {activeTab === 'scanning' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Active Scanning</h3>
            
            <div style={{ marginBottom: '30px' }}>
              <button
                onClick={startScan}
                disabled={isScanning}
                style={{
                  padding: '15px 30px',
                  background: isScanning
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isScanning ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {isScanning ? '🔍 Scanning...' : 'Start Active Scan'}
              </button>
            </div>

            {isScanning && (
              <div style={{
                padding: '15px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <strong>🔍 Active scanning in progress...</strong>
              </div>
            )}

            <div style={{ display: 'grid', gap: '15px' }}>
              {scanResults.map(result => (
                <div key={result.id} style={{
                  padding: '15px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{result.targetType.toUpperCase()}</strong>
                      <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                        Signal: {result.signalStrength} | Threat: {result.threatLevel} | Confidence: {result.confidence}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.9em', color: '#94a3b8' }}>
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classification Tab */}
        {activeTab === 'classification' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Manual Classification</h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                  Target ID
                </label>
                <input
                  type="text"
                  placeholder="Enter target ID"
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9',
                    width: '200px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                  IFF Classification
                </label>
                <select
                  value={iffStatus}
                  onChange={(e) => setIffStatus(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9',
                    width: '200px'
                  }}
                >
                  <option value="friend">Friend</option>
                  <option value="foe">Foe</option>
                  <option value="neutral">Neutral</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                  Threat Level
                </label>
                <select
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9',
                    width: '200px'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                  Confidence Level: {confidence}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  style={{
                    width: '200px'
                  }}
                />
              </div>

              <button
                onClick={() => tagTarget('MANUAL-TARGET', iffStatus)}
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Apply Classification
              </button>
            </div>

            {message && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#10b981'
              }}>
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IFFPortal; 