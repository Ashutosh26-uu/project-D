import React, { useState, useEffect } from 'react';

const OTAManagementPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFirmware, setSelectedFirmware] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState({});
  const [message, setMessage] = useState('');

  const [systemHealth, setSystemHealth] = useState({
    totalDrones: 12,
    onlineDrones: 10,
    updateInProgress: 2,
    failedUpdates: 0
  });

  const [drones] = useState([
    {
      id: 1,
      name: 'Prithvi-1',
      status: 'online',
      battery: 85,
      signal: 'strong',
      firmware: 'v2.1.4',
      deploymentStatus: 'ready',
      deploymentProgress: 0,
      deploymentETA: 'N/A',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Aakash-2',
      status: 'online',
      battery: 92,
      signal: 'strong',
      firmware: 'v2.1.3',
      deploymentStatus: 'in_progress',
      deploymentProgress: 65,
      deploymentETA: '2 min',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Pinaka-3',
      status: 'offline',
      battery: 45,
      signal: 'weak',
      firmware: 'v2.1.2',
      deploymentStatus: 'failed',
      deploymentProgress: 0,
      deploymentETA: 'N/A',
      lastUpdate: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  const [firmwareVersions] = useState([
    {
      version: '2.1.5',
      name: 'Enhanced Security',
      size: '2.4 MB',
      type: 'Firmware',
      status: 'stable',
      releaseDate: '2024-01-15',
      features: [
        'Enhanced encryption protocols',
        'Improved GPS accuracy',
        'Better battery management',
        'Advanced threat detection'
      ]
    },
    {
      version: '2.1.4',
      name: 'Performance Update',
      size: '2.1 MB',
      type: 'Firmware',
      status: 'stable',
      releaseDate: '2024-01-10',
      features: [
        'Performance optimizations',
        'Bug fixes',
        'UI improvements',
        'Stability enhancements'
      ]
    },
    {
      version: '2.1.3',
      name: 'Security Patch',
      size: '1.8 MB',
      type: 'Firmware',
      status: 'stable',
      releaseDate: '2024-01-05',
      features: [
        'Security vulnerability fixes',
        'Authentication improvements',
        'Data protection enhancements'
      ]
    }
  ]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setMessage('Uploading firmware...');
    
    // Simulate upload
    setTimeout(() => {
      setMessage('Firmware uploaded successfully!');
      setSelectedFile(null);
    }, 2000);
  };

  const startDeployment = async () => {
    if (!selectedFirmware) return;

    setDeploymentStatus({
      status: 'starting',
      message: 'Starting deployment process...'
    });

    // Simulate deployment
    setTimeout(() => {
      setDeploymentStatus({
        status: 'in_progress',
        message: 'Deployment in progress...'
      });
    }, 1000);

    setTimeout(() => {
      setDeploymentStatus({
        status: 'completed',
        message: 'Deployment completed successfully!'
      });
    }, 5000);
  };

  const rollbackFirmware = async (droneId) => {
    setMessage(`Rolling back firmware for drone ${droneId}...`);
    
    // Simulate rollback
    setTimeout(() => {
      setMessage('Rollback completed successfully!');
    }, 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      online: '#10b981',
      offline: '#ef4444',
      maintenance: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getDeploymentStatusColor = (status) => {
    const colors = {
      ready: '#10b981',
      in_progress: '#f59e0b',
      failed: '#ef4444',
      completed: '#3b82f6'
    };
    return colors[status] || '#6b7280';
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
            OTA Management Portal
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
            Over-the-Air Firmware & Model Updates Management
          </p>
        </div>

        {/* System Health Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { label: 'Total Drones', value: systemHealth.totalDrones, icon: '🛸', color: '#3b82f6' },
            { label: 'Online Drones', value: systemHealth.onlineDrones, icon: '🟢', color: '#10b981' },
            { label: 'Updates in Progress', value: systemHealth.updateInProgress, icon: '⏳', color: '#f59e0b' },
            { label: 'Failed Updates', value: systemHealth.failedUpdates, icon: '❌', color: '#ef4444' }
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

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'deployment', label: 'Deployment' },
            { id: 'firmware', label: 'Firmware' },
            { id: 'monitoring', label: 'Monitoring' }
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
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Drone Fleet Status</h3>
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
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>{drone.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                      Status: {drone.status} • Battery: {drone.battery}% • Signal: {drone.signal}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: getStatusColor(drone.status),
                      color: 'white',
                      fontSize: '0.8em',
                      marginBottom: '5px'
                    }}>
                      {drone.status.toUpperCase()}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8em' }}>
                      Last Update: {new Date(drone.lastUpdate).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deployment Tab */}
        {activeTab === 'deployment' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Deployment Management</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Select Firmware Version
              </label>
              <select
                value={selectedFirmware}
                onChange={(e) => setSelectedFirmware(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#f1f5f9',
                  width: '100%',
                  marginBottom: '15px'
                }}
              >
                <option value="">Select firmware version...</option>
                {firmwareVersions.map(fw => (
                  <option key={fw.version} value={fw.version}>
                    {fw.version} - {fw.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={startDeployment}
                disabled={!selectedFirmware}
                style={{
                  padding: '12px 24px',
                  background: !selectedFirmware
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !selectedFirmware ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Start Deployment
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {drones.map(drone => (
                <div key={drone.id} style={{
                  padding: '15px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>{drone.name}</span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: getDeploymentStatusColor(drone.deploymentStatus),
                      color: 'white',
                      fontSize: '0.8em'
                    }}>
                      {drone.deploymentStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '0.9em' }}>
                    <div>Current: {drone.firmware}</div>
                    <div>Target: {selectedFirmware || 'None'}</div>
                    <div>Progress: {drone.deploymentProgress}%</div>
                    <div>ETA: {drone.deploymentETA}</div>
                  </div>
                  
                  {drone.deploymentStatus === 'failed' && (
                    <button
                      onClick={() => rollbackFirmware(drone.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        marginTop: '10px'
                      }}
                    >
                      Rollback
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Firmware Tab */}
        {activeTab === 'firmware' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Firmware Management</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Upload New Firmware
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".bin,.hex,.fw"
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#f1f5f9',
                  width: '100%',
                  marginBottom: '15px'
                }}
              />
              
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                style={{
                  padding: '12px 24px',
                  background: !selectedFile
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !selectedFile ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Upload Firmware
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {firmwareVersions.map(fw => (
                <div key={fw.version} style={{
                  padding: '20px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1em', marginBottom: '5px' }}>
                        {fw.name} v{fw.version}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                        Size: {fw.size} • Type: {fw.type}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: fw.status === 'stable' ? '#10b981' : '#f59e0b',
                        color: 'white',
                        fontSize: '0.8em',
                        marginBottom: '5px'
                      }}>
                        {fw.status.toUpperCase()}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8em' }}>
                        Released: {fw.releaseDate}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{textAlign: 'justify', color: '#94a3b8', fontSize: '0.9em' }}>
                    <strong style={{ fontSize: '1.2em' }}>Features:</strong>
                    <ul style={{ margin: '5px 0 0 20px', color: '#94a3b8', fontSize: '0.9em' }}>
                      {fw.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Deployment Monitoring</h3>
            
            {deploymentStatus.status && (
              <div style={{
                padding: '15px',
                background: deploymentStatus.status === 'starting' ? 'rgba(59, 130, 246, 0.1)' :
                           deploymentStatus.status === 'in_progress' ? 'rgba(245, 158, 11, 0.1)' :
                           'rgba(16, 185, 129, 0.1)',
                border: deploymentStatus.status === 'starting' ? '1px solid rgba(59, 130, 246, 0.3)' :
                        deploymentStatus.status === 'in_progress' ? '1px solid rgba(245, 158, 11, 0.3)' :
                        '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <strong>{deploymentStatus.message}</strong>
              </div>
            )}

            <div style={{ display: 'grid', gap: '15px' }}>
              {drones.map(drone => (
                <div key={drone.id} style={{
                  padding: '15px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>{drone.name}</span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: getDeploymentStatusColor(drone.deploymentStatus),
                      color: 'white',
                      fontSize: '0.8em'
                    }}>
                      {drone.deploymentStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '0.9em' }}>
                    <div>Status: <span style={{ color: getStatusColor(drone.status) }}>{drone.status}</span></div>
                    <div>Battery: {drone.battery}%</div>
                    <div>Signal: {drone.signal}</div>
                    <div>Last Update: {new Date(drone.lastUpdate).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTAManagementPortal;