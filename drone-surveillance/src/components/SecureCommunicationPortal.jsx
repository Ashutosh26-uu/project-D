import React, { useState, useEffect, useRef } from 'react';
import encryptionService from '../utils/encryption';

const SecureCommunicationPortal = () => {
  const [activeTab, setActiveTab] = useState('messaging');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [communicationStatus, setCommunicationStatus] = useState({
    encryption: 'active',
    connection: 'secure',
    integrity: 'verified',
    authentication: 'valid'
  });
  
  const [secureChannels, setSecureChannels] = useState([
    { id: 'channel1', name: 'Command Center', status: 'active', encryption: 'AES-256', participants: 5 },
    { id: 'channel2', name: 'Field Operations', status: 'active', encryption: 'AES-256', participants: 12 },
    { id: 'channel3', name: 'Intelligence', status: 'active', encryption: 'AES-256', participants: 8 },
    { id: 'channel4', name: 'Emergency', status: 'standby', encryption: 'AES-256', participants: 3 }
  ]);
  
  const [recipients] = useState([
    { id: 'user1', name: 'Commander Smith', role: 'Command', clearance: 'Top Secret' },
    { id: 'user2', name: 'Operator Johnson', role: 'Field', clearance: 'Secret' },
    { id: 'user3', name: 'Analyst Davis', role: 'Intelligence', clearance: 'Top Secret' },
    { id: 'user4', name: 'Technician Wilson', role: 'Technical', clearance: 'Secret' }
  ]);

  const [communicationLogs, setCommunicationLogs] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    initializeSecureCommunication();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const initializeSecureCommunication = () => {
    // Simulate secure WebSocket connection
    wsRef.current = new WebSocket('wss://localhost:8080/secure-comm');
    
    wsRef.current.onopen = () => {
      console.log('Secure communication channel established');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      } catch (error) {
        console.error('Communication error:', error);
      }
    };

    // Generate sample messages
    generateSampleMessages();
  };

  const generateSampleMessages = () => {
    const sampleMessages = [
      {
        id: 1,
        sender: 'Commander Smith',
        recipient: 'All',
        content: 'Mission status update: All drones operational, surveillance active.',
        timestamp: new Date(Date.now() - 3600000),
        encrypted: true,
        priority: 'high'
      },
      {
        id: 2,
        sender: 'Operator Johnson',
        recipient: 'Command Center',
        content: 'Target acquired at coordinates 28.6139, 77.2090. Awaiting authorization.',
        timestamp: new Date(Date.now() - 1800000),
        encrypted: true,
        priority: 'critical'
      },
      {
        id: 3,
        sender: 'Analyst Davis',
        recipient: 'Intelligence Team',
        content: 'Intelligence report: Suspicious activity detected in sector Alpha.',
        timestamp: new Date(Date.now() - 900000),
        encrypted: true,
        priority: 'medium'
      }
    ];
    setMessages(sampleMessages);
  };

  const handleIncomingMessage = (data) => {
    if (data.type === 'message') {
      setMessages(prev => [data.message, ...prev]);
    } else if (data.type === 'status') {
      setCommunicationStatus(prev => ({ ...prev, ...data.status }));
    }
  };

  const sendSecureMessage = async () => {
    if (!newMessage.trim() || !selectedRecipient) return;

    try {
      const messageData = {
        sender: 'Current User',
        recipient: selectedRecipient,
        content: newMessage,
        timestamp: new Date(),
        encrypted: isEncrypted,
        priority: 'normal'
      };

      let processedMessage = messageData;

      if (isEncrypted) {
        const encryptedContent = await encryptionService.encryptData(newMessage);
        processedMessage = {
          ...messageData,
          content: encryptedContent,
          originalContent: newMessage
        };
      }

      // Add to local messages
      setMessages(prev => [processedMessage, ...prev]);

      // Send via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          message: processedMessage
        }));
      }

      // Log communication
      const logEntry = {
        id: Date.now(),
        timestamp: new Date(),
        type: 'message_sent',
        sender: 'Current User',
        recipient: selectedRecipient,
        encrypted: isEncrypted,
        status: 'delivered'
      };
      setCommunicationLogs(prev => [logEntry, ...prev]);

      setNewMessage('');
      setSelectedRecipient('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      normal: '#3b82f6',
      high: '#f59e0b',
      critical: '#ef4444'
    };
    return colors[priority] || '#6b7280';
  };

  // const getPriorityIcon = (priority) => {
  //   const icons = {
  //     low: '📝',
  //     normal: '',
  //     high: '⚠️',
  //     critical: '🚨'
  //   };
  //   return icons[priority] || '💬';
  // };

  return (
    <div style={{
      // minHeight: '100vh',
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
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Secure Communication Portal
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
            End-to-End Encrypted Communication & Secure Messaging
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
            { id: 'messaging', label: 'Messaging' },
            { id: 'channels', label: 'Channels' },
            { id: 'status', label: 'Status' },
            { id: 'logs', label: 'Logs' }
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

        {/* Messaging Tab */}
        {activeTab === 'messaging' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '20px',
            // height: '70vh'
          }}>
            {/* Message List */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Secure Messages</h3>
              <div style={{ 
                flex: 1, 
                // overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column',
                gap: '15px'
              }}>
                {messages.map(message => (
                  <div key={message.id} style={{
                    padding: '15px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderLeft: `4px solid ${getPriorityColor(message.priority)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                          {/* {getPriorityIcon(message.priority)}  */}
                          {message.sender}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                          To: {message.recipient}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: message.encrypted ? '#10b981' : '#f59e0b',
                          color: 'white',
                          fontSize: '0.8em',
                          marginBottom: '5px'
                        }}>
                          {message.encrypted ? 'ENCRYPTED' : 'PLAIN'}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8em' }}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.9em',
                      wordBreak: 'break-word'
                    }}>
                      {message.encrypted && message.content.length > 100 
                        ? message.content.substring(0, 100) + '... [ENCRYPTED]'
                        : message.content
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Composition */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Compose Message</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Recipient
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9',
                    width: '100%'
                  }}
                >
                  <option value="">Select recipient...</option>
                  {recipients.map(recipient => (
                    <option key={recipient.id} value={recipient.name}>
                      {recipient.name} ({recipient.role})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Message
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your secure message..."
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9',
                    width: '100%',
                    // minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={isEncrypted}
                    onChange={(e) => setIsEncrypted(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <span>Encrypt Message</span>
                </label>
              </div>

              <button
                onClick={sendSecureMessage}
                disabled={!newMessage.trim() || !selectedRecipient}
                style={{
                  padding: '12px 20px',
                  background: (!newMessage.trim() || !selectedRecipient)
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (!newMessage.trim() || !selectedRecipient) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Send Secure Message
              </button>
            </div>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Secure Communication Channels</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {secureChannels.map(channel => (
                <div key={channel.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: channel.status === 'active' ? '#10b981' : '#f59e0b'
                    }} />
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '5px' }}>{channel.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                        Encryption: {channel.encryption} • Participants: {channel.participants}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: channel.status === 'active' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      fontSize: '0.8em',
                      marginBottom: '5px'
                    }}>
                      {channel.status.toUpperCase()}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8em' }}>
                      🔒 Secure Channel
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div>
            {/* Communication Status */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {Object.entries(communicationStatus).map(([key, value]) => (
                <div key={key} style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5em', marginBottom: '15px' }}>
                    {key === 'encryption' ? '🔒' : 
                     key === 'connection' ? '📡' : 
                     key === 'integrity' ? '✅' : '🔐'}
                  </div>
                  <div style={{ 
                    fontSize: '2em', 
                    fontWeight: 'bold', 
                    color: '#10b981', 
                    marginBottom: '5px' 
                  }}>
                    {value.toUpperCase()}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '1.1em' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                </div>
              ))}
            </div>

            {/* Security Metrics */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <h3 style={{ marginBottom: '20px' }}>🔒 Security Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>🔐</div>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#10b981' }}>100%</div>
                  <div style={{ color: '#94a3b8' }}>Messages Encrypted</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>✅</div>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#10b981' }}>0</div>
                  <div style={{ color: '#94a3b8' }}>Security Breaches</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>📡</div>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#3b82f6' }}>4</div>
                  <div style={{ color: '#94a3b8' }}>Active Channels</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>👥</div>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#8b5cf6' }}>28</div>
                  <div style={{ color: '#94a3b8' }}>Connected Users</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>📋 Communication Logs</h3>
            <div style={{ display: 'grid', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
              {communicationLogs.map(log => (
                <div key={log.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2em' }}>
                      {log.type === 'message_sent' ? '📤' : '📥'}
                    </span>
                    <div>
                      <div style={{ fontWeight: '600' }}>
                        {log.type === 'message_sent' ? 'Message Sent' : 'Message Received'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>
                        From: {log.sender} • To: {log.recipient}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: log.encrypted ? '#10b981' : '#f59e0b',
                      color: 'white',
                      fontSize: '0.8em',
                      marginBottom: '5px'
                    }}>
                      {log.encrypted ? 'ENCRYPTED' : 'PLAIN'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8em' }}>
                      {log.timestamp.toLocaleString()}
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

export default SecureCommunicationPortal; 