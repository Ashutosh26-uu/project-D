import React, { useEffect, useState, useCallback } from 'react';

const OTAManagementPortal = () => {
  const [drones, setDrones] = useState([]);
  const [firmwareVersions, setFirmwareVersions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [deploymentStrategy, setDeploymentStrategy] = useState('rolling');
  const [selectedDrones, setSelectedDrones] = useState([]);
  const [deploymentNotes, setDeploymentNotes] = useState('');
  const [systemHealth, setSystemHealth] = useState({
    totalDrones: 0,
    onlineDrones: 0,
    updateInProgress: 0,
    failedUpdates: 0
  });

  // Enhanced drone data with firmware information
  const enhancedDrones = [
    {
      id: 1,
      name: 'Prithvi-1',
      currentFirmware: 'v2.1.4',
      targetFirmware: 'v2.2.0',
      status: 'online',
      lastUpdate: '2024-01-15T10:30:00Z',
      updateProgress: 0,
      battery: 85,
      signal: 'strong',
      deploymentStatus: 'ready'
    },
    {
      id: 2,
      name: 'Aakash-2',
      currentFirmware: 'v2.1.4',
      targetFirmware: 'v2.2.0',
      status: 'updating',
      lastUpdate: '2024-01-15T11:15:00Z',
      updateProgress: 65,
      battery: 92,
      signal: 'strong',
      deploymentStatus: 'in_progress'
    },
    {
      id: 3,
      name: 'Pinaka-3',
      currentFirmware: 'v2.1.3',
      targetFirmware: 'v2.2.0',
      status: 'offline',
      lastUpdate: '2024-01-14T16:45:00Z',
      updateProgress: 0,
      battery: 45,
      signal: 'weak',
      deploymentStatus: 'pending'
    }
  ];

  // Available firmware versions
  const availableFirmware = [
    { version: 'v2.2.0', releaseDate: '2024-01-15', size: '45.2 MB', features: ['Enhanced AI detection', 'Improved battery management', 'Security patches'] },
    { version: 'v2.1.4', releaseDate: '2024-01-10', size: '42.1 MB', features: ['Bug fixes', 'Performance improvements'] },
    { version: 'v2.1.3', releaseDate: '2024-01-05', size: '41.8 MB', features: ['Initial release'] }
  ];

  useEffect(() => {
    setDrones(enhancedDrones);
    setFirmwareVersions(availableFirmware);
    
    // Update system health
    setSystemHealth({
      totalDrones: enhancedDrones.length,
      onlineDrones: enhancedDrones.filter(d => d.status === 'online').length,
      updateInProgress: enhancedDrones.filter(d => d.status === 'updating').length,
      failedUpdates: enhancedDrones.filter(d => d.deploymentStatus === 'failed').length
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      setDrones(prev => prev.map(drone => {
        if (drone.status === 'updating' && drone.updateProgress < 100) {
          return {
            ...drone,
            updateProgress: Math.min(100, drone.updateProgress + Math.random() * 10)
          };
        }
        return drone;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(100);
      setSelectedFile(null);
      // Add new firmware version
      const newFirmware = {
        version: `v${Math.floor(Math.random() * 3) + 2}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        releaseDate: new Date().toISOString().split('T')[0],
        size: `${(Math.random() * 20 + 30).toFixed(1)} MB`,
        features: ['New features', 'Bug fixes', 'Performance improvements']
      };
      setFirmwareVersions(prev => [newFirmware, ...prev]);
    }, 2000);
  };

  const startDeployment = async () => {
    if (selectedDrones.length === 0) return;

    setDeploymentStatus({ status: 'starting', message: 'Initializing deployment...' });

    // Simulate deployment process
    setTimeout(() => {
      setDeploymentStatus({ status: 'in_progress', message: 'Deployment in progress...' });
      
      // Update selected drones
      setDrones(prev => prev.map(drone => 
        selectedDrones.includes(drone.id) 
          ? { ...drone, status: 'updating', updateProgress: 0, deploymentStatus: 'in_progress' }
          : drone
      ));
    }, 1000);
  };

  const rollbackFirmware = async (droneId) => {
    setDrones(prev => prev.map(drone => 
      drone.id === droneId 
        ? { ...drone, status: 'rollback', updateProgress: 0, deploymentStatus: 'rollback_in_progress' }
        : drone
    ));

    // Simulate rollback
    setTimeout(() => {
      setDrones(prev => prev.map(drone => 
        drone.id === droneId 
          ? { ...drone, status: 'online', updateProgress: 0, deploymentStatus: 'rolled_back', currentFirmware: 'v2.1.4' }
          : drone
      ));
    }, 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      online: '#10b981',
      updating: '#f59e0b',
      offline: '#ef4444',
      rollback: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const getDeploymentStatusColor = (status) => {
    const colors = {
      ready: '#10b981',
      in_progress: '#f59e0b',
      pending: '#6b7280',
      failed: '#ef4444',
      rolled_back: '#8b5cf6'
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
            🔄 OTA Management Portal
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
            { id: 'overview', label: '📊 Overview' },
            { id: 'deployment', label: '🚀 Deployment' },
            { id: 'firmware', label: '📦 Firmware' },
            { id: 'monitoring', label: '📈 Monitoring' }
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
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold' }}>{drone.name}</span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: getStatusColor(drone.status),
                        color: 'white',
                        fontSize: '0.8em'
                      }}>
                        {drone.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                      Current: {drone.currentFirmware} | Target: {drone.targetFirmware}
                    </div>
                  </div>
                  
                  {drone.status === 'updating' && (
                    <div style={{ width: '200px', marginRight: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.8em' }}>Progress</span>
                        <span style={{ fontSize: '0.8em' }}>{Math.round(drone.updateProgress)}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(148, 163, 184, 0.2)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${drone.updateProgress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => rollbackFirmware(drone.id)}
                      disabled={drone.status === 'updating'}
                      style={{
                        padding: '8px 16px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: drone.status === 'updating' ? 'not-allowed' : 'pointer',
                        opacity: drone.status === 'updating' ? 0.5 : 1
                      }}
                    >
                      Rollback
                    </button>
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
            <h3 style={{ marginBottom: '20px' }}>Deploy Firmware Update</h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Deployment Strategy */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                  Deployment Strategy
                </label>
                <select
                  value={deploymentStrategy}
                  onChange={(e) => setDeploymentStrategy(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9',
                    width: '200px'
                  }}
                >
                  <option value="rolling">Rolling Update</option>
                  <option value="blue-green">Blue-Green Deployment</option>
                  <option value="canary">Canary Release</option>
                  <option value="all-at-once">All at Once</option>
                </select>
              </div>

              {/* Target Firmware */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                  Target Firmware Version
                </label>
                <select
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9',
                    width: '200px'
                  }}
                >
                  {firmwareVersions.map(fw => (
                    <option key={fw.version} value={fw.version}>
                      {fw.version} ({fw.size})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drone Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                  Select Target Drones
                </label>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {drones.map(drone => (
                    <label key={drone.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={selectedDrones.includes(drone.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDrones(prev => [...prev, drone.id]);
                          } else {
                            setSelectedDrones(prev => prev.filter(id => id !== drone.id));
                          }
                        }}
                      />
                      <span>{drone.name} ({drone.status})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deployment Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                  Deployment Notes
                </label>
                <textarea
                  value={deploymentNotes}
                  onChange={(e) => setDeploymentNotes(e.target.value)}
                  placeholder="Enter deployment notes..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Deploy Button */}
              <button
                onClick={startDeployment}
                disabled={selectedDrones.length === 0}
                style={{
                  padding: '15px 30px',
                  background: selectedDrones.length === 0
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: selectedDrones.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                🚀 Start Deployment ({selectedDrones.length} drones selected)
              </button>
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
            
            {/* Upload Section */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px' }}>Upload New Firmware</h4>
              <form onSubmit={handleUpload} style={{ display: 'grid', gap: '15px' }}>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".bin,.hex,.img"
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9'
                  }}
                />
                
                {isUploading && (
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(148, 163, 184, 0.2)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  style={{
                    padding: '12px 24px',
                    background: !selectedFile || isUploading
                      ? 'rgba(107, 114, 128, 0.5)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {isUploading ? 'Uploading...' : '📤 Upload Firmware'}
                </button>
              </form>
            </div>

            {/* Available Firmware Versions */}
            <div>
              <h4 style={{ marginBottom: '15px' }}>Available Firmware Versions</h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                {firmwareVersions.map((fw, index) => (
                  <div key={index} style={{
                    padding: '20px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h5 style={{ margin: 0, fontSize: '1.1em' }}>{fw.version}</h5>
                      <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>{fw.size}</span>
                    </div>
                    <div style={{ color: '#94a3b8', marginBottom: '10px', fontSize: '0.9em' }}>
                      Released: {fw.releaseDate}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9em' }}>Features:</strong>
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