import React, { useState, useEffect, useRef } from 'react';
import encryptionService from '../utils/encryption';

const EnhancedSecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityMetrics, setSecurityMetrics] = useState({
    encryptionStatus: 'active',
    threatLevel: 'low',
    activeSessions: 0,
    failedAttempts: 0,
    dataIntegrity: 100,
    systemHealth: 98.5
  });
  
  const [securityEvents, setSecurityEvents] = useState([]);
  const [encryptionLogs, setEncryptionLogs] = useState([]);
  const [threatAlerts, setThreatAlerts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const wsRef = useRef(null);

  useEffect(() => {
    initializeSecurityMonitoring();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const initializeSecurityMonitoring = () => {
    // Simulate real-time security events
    const eventInterval = setInterval(() => {
      generateSecurityEvent();
    }, 3000);

    return () => clearInterval(eventInterval);
  };

  const generateSecurityEvent = () => {
    const eventTypes = ['login_attempt', 'data_access', 'encryption_operation', 'threat_detected'];
    
    const event = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      user: ['admin', 'operator1', 'viewer2', 'system'][Math.floor(Math.random() * 4)],
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      description: 'Security event detected'
    };

    setSecurityEvents(prev => [event, ...prev.slice(0, 19)]);
  };

  const startSecurityScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          setIsScanning(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[severity] || '#6b7280';
  };

  const getEventIcon = (type) => {
    const icons = {
      login_attempt: '🔐',
      data_access: '📁',
      encryption_operation: '🔒',
      threat_detected: '⚠️'
    };
    return icons[type] || '📊';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f1f5f9',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {/* 🛡️ Enhanced Security Dashboard */}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 'clamp(0.8rem, 2vw, 1rem)', textAlign: 'left' }}>
            Real-time Security Monitoring & Encryption Management
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
            { id: 'overview', label: 'Status' },
            { id: 'encryption', label: 'Encryption' },
            { id: 'threats', label: 'Threats' },
            { id: 'events', label: 'Events' }
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
                transition: 'all 0.3s ease',
                fontSize: 'clamp(0.8rem, 2vw, 1rem)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Security Status Cards */}
            {/* <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[
                { 
                  label: 'System Status', 
                  value: 'SECURE', 
                  icon: '🟢', 
                  color: '#10b981',
                  subtitle: 'All systems operational'
                },
                { 
                  label: 'Threat Level', 
                  value: securityMetrics.threatLevel.toUpperCase(), 
                  icon: '⚠️', 
                  color: getSeverityColor(securityMetrics.threatLevel),
                  subtitle: 'No active threats detected'
                },
                { 
                  label: 'Active Sessions', 
                  value: securityMetrics.activeSessions, 
                  icon: '👥', 
                  color: '#3b82f6',
                  subtitle: 'Users currently online'
                },
                { 
                  label: 'Data Integrity', 
                  value: `${securityMetrics.dataIntegrity}%`, 
                  icon: '🔒', 
                  color: '#10b981',
                  subtitle: 'All data verified'
                }
              ].map((metric, index) => (
                <div key={index} style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '2.5em', marginBottom: '15px' }}>{metric.icon}</div>
                  <div style={{ fontSize: '2em', fontWeight: 'bold', color: metric.color, marginBottom: '5px' }}>
                    {metric.value}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '1.1em', marginBottom: '5px' }}>{metric.label}</div>
                  <div style={{ color: '#64748b', fontSize: '0.9em' }}>{metric.subtitle}</div>
                </div>
              ))}
            </div> */}

            {/* Quick Actions */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button
                  onClick={startSecurityScan}
                  disabled={isScanning}
                  style={{
                    padding: '15px 25px',
                    background: isScanning 
                      ? 'rgba(107, 114, 128, 0.5)' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isScanning ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {isScanning ? `🔍 Scanning... ${scanProgress}%` : 'Start Security Scan'}
                </button>
                
                <button
                  onClick={() => setActiveTab('encryption')}
                  style={{
                    padding: '15px 25px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Encryption Status
                </button>

                <button
                  onClick={() => setActiveTab('threats')}
                  style={{
                    padding: '15px 25px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  View Threats
                </button>
              </div>
            </div>

            {/* Recent Security Events */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <h3 style={{ marginBottom: '20px' }}>📋 Recent Security Events</h3>
              <div style={{ display: 'grid', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {securityEvents.slice(0, 10).map(event => (
                  <div key={event.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2em' }}>{getEventIcon(event.type)}</span>
                      <div>
                        <div style={{ fontWeight: '600' }}>{event.type.replace('_', ' ').toUpperCase()}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                          {event.user} • {event.ip}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: getSeverityColor(event.severity),
                        color: 'white',
                        fontSize: '0.8em',
                        marginBottom: '5px'
                      }}>
                        {event.severity.toUpperCase()}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8em' }}>
                        {event.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Encryption Tab */}
        {activeTab === 'encryption' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>🔒 Encryption Management</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div style={{
                  background: 'rgba(51, 65, 85, 0.3)',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>🔒</div>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#3b82f6' }}>AES-256-GCM</div>
                  <div style={{ color: '#94a3b8' }}>Encryption Algorithm</div>
                </div>
                <div style={{
                  background: 'rgba(51, 65, 85, 0.3)',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>🔑</div>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#10b981' }}>Active</div>
                  <div style={{ color: '#94a3b8' }}>Key Management</div>
                </div>
                <div style={{
                  background: 'rgba(51, 65, 85, 0.3)',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>🛡️</div>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#f59e0b' }}>100%</div>
                  <div style={{ color: '#94a3b8' }}>Data Protection</div>
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                background: 'rgba(51, 65, 85, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <h4 style={{ marginBottom: '15px' }}>🔐 Encryption Status</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>System Data Encryption</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Active</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Communication Encryption</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ TLS 1.3</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Key Rotation</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Automatic</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Backup Encryption</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Threats Tab */}
        {activeTab === 'threats' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>⚠️ Threat Detection</h3>
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '3em', marginBottom: '20px' }}>✅</div>
              <h3>No Active Threats</h3>
              <p>All systems are secure and no threats have been detected.</p>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>📋 Security Events</h3>
            <div style={{ display: 'grid', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
              {securityEvents.map(event => (
                <div key={event.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '1.5em' }}>{getEventIcon(event.type)}</span>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                        {event.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                        User: {event.user} • IP: {event.ip}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: getSeverityColor(event.severity),
                      color: 'white',
                      fontSize: '0.8em',
                      marginBottom: '8px'
                    }}>
                      {event.severity.toUpperCase()}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8em' }}>
                      {event.timestamp.toLocaleString()}
                    </div>
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

export default EnhancedSecurityDashboard; 