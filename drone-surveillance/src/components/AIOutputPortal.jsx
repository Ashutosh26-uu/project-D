import React, { useEffect, useState, useRef, useCallback } from 'react';
import useDroneWebSocket from '../hooks/useDroneWebSocket';

const DEMO_AI_DATA = [
  { droneId: 'Pinaak-01', detection: 'Person', confidence: 0.92, time: '2024-06-01 12:01:23', alert: 'None', severity: 'Low', coordinates: '28.6139, 77.2090' },
  { droneId: 'Akash-02', detection: 'Vehicle', confidence: 0.87, time: '2024-06-01 12:01:25', alert: 'Suspicious Vehicle', severity: 'Medium', coordinates: '28.6129, 77.2080' },
  { droneId: 'Prithvi-03', detection: 'Animal', confidence: 0.78, time: '2024-06-01 12:01:28', alert: 'None', severity: 'Low', coordinates: '28.6149, 77.2100' },
  { droneId: 'Arjun-04', detection: 'Unknown Object', confidence: 0.65, time: '2024-06-01 12:01:30', alert: 'Potential Threat', severity: 'High', coordinates: '28.6159, 77.2110' },
];

const AI_WS_URL = 'ws://localhost:8080/ai';

export default function AIOutputPortal() {
  const [aiData, setAIData] = useState(DEMO_AI_DATA);
  const [filteredData, setFilteredData] = useState(DEMO_AI_DATA);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // table, cards, timeline
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Responsive state
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  // Refs
  const updateIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);

  const { status, lastMessage } = useDroneWebSocket('all', AI_WS_URL);

  // Enhanced responsive design handler
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setScreenSize({ width: newWidth, height: newHeight });
      setIsMobile(newWidth < 768);
      setIsTablet(newWidth >= 768 && newWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Enhanced real-time data simulation
  useEffect(() => {
    if (autoRefresh) {
      updateIntervalRef.current = setInterval(() => {
        if (Math.random() > 0.7) {
          const detectionTypes = ['Person', 'Vehicle', 'Animal', 'Unknown Object', 'Weapon', 'Drone', 'Building'];
          const droneIds = ['Pinaak-01', 'Akash-02', 'Prithvi-03', 'Arjun-04', 'Vayu-05', 'Agni-06'];
          const severities = ['Low', 'Medium', 'High', 'Critical'];
          const alerts = ['None', 'Suspicious Activity', 'Potential Threat', 'Confirmed Threat', 'Emergency'];

          const newDetection = {
            droneId: droneIds[Math.floor(Math.random() * droneIds.length)],
            detection: detectionTypes[Math.floor(Math.random() * detectionTypes.length)],
            confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
            time: new Date().toISOString(),
            alert: alerts[Math.floor(Math.random() * alerts.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            coordinates: `${(28.6 + Math.random() * 0.1).toFixed(4)}, ${(77.2 + Math.random() * 0.1).toFixed(4)}`,
            id: Date.now()
          };

          setAIData(prev => [newDetection, ...prev.slice(0, 49)]);
        }
      }, 2000 / animationSpeed);
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [autoRefresh, animationSpeed]);

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'ai_detection') {
      setAIData(prev => {
        const filtered = prev.filter(row => row.droneId !== lastMessage.droneId);
        return [{
          droneId: lastMessage.droneId,
          detection: lastMessage.detection,
          confidence: lastMessage.confidence,
          time: lastMessage.time,
          alert: lastMessage.alert || 'None',
          severity: lastMessage.severity || 'Low',
          coordinates: lastMessage.coordinates || 'Unknown',
          id: Date.now()
        }, ...filtered].slice(0, 50);
      });
    }
  }, [lastMessage]);

  // Enhanced filtering and sorting
  useEffect(() => {
    let filtered = aiData;

    // Filter by severity
    if (filterSeverity !== 'All') {
      filtered = filtered.filter(item => item.severity === filterSeverity);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.droneId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detection.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alert.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'time') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'confidence') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredData(filtered);
  }, [aiData, filterSeverity, searchTerm, sortBy, sortOrder]);

  // Utility functions
  const getSeverityColor = (severity) => {
    const colors = {
      'Low': '#00aa44',
      'Medium': '#ffaa00',
      'High': '#ff4444',
      'Critical': '#ff0000'
    };
    return colors[severity] || '#666';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return '#00aa44';
    if (confidence >= 0.7) return '#ffaa00';
    if (confidence >= 0.5) return '#ff6600';
    return '#ff4444';
  };

  const getDetectionIcon = (detection) => {
    const icons = {
      'Person': '👤',
      'Vehicle': '🚗',
      'Animal': '🐾',
      'Unknown Object': '❓',
      'Weapon': '⚔️',
      'Drone': '🚁',
      'Building': '🏢'
    };
    return icons[detection] || '🔍';
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return isMobile ? date.toLocaleTimeString() : date.toLocaleString();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getGridColumns = () => {
    if (isMobile) return '1fr';
    if (isTablet) return '1fr 1fr';
    return 'repeat(auto-fit, minmax(300px, 1fr))';
  };

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      backgroundColor: '#0a0a1a',
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Enhanced Header */}
      <h1 style={{
        color: '#00d4ff',
        fontSize: isMobile ? '20px' : '28px',
        textShadow: '0 0 10px #00d4ff40',
        marginTop: '0px',      
        marginBottom: '10px' 
      }}>
        Results
      </h1>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <div style={{
            color: '#00ff88',
            fontSize: isMobile ? '12px' : '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <span>🔗 {status === 'connected' ? 'Live' : 'Offline'}</span>
            <span>📊 {filteredData.length} detections</span>
            <span>⚡ Speed: {animationSpeed}x</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: isMobile ? '6px 10px' : '8px 12px',
              backgroundColor: autoRefresh ? '#00aa44' : '#aa4400',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold'
            }}
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Resume'}
          </button>

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              padding: isMobile ? '6px' : '8px',
              backgroundColor: '#2a2a4e',
              color: '#eee',
              border: '1px solid #444',
              borderRadius: '5px',
              fontSize: isMobile ? '10px' : '12px'
            }}
          >
            <option value="table">📊 Table</option>
            <option value="cards">📋 Cards</option>
            <option value="timeline">⏰ Timeline</option>
          </select>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
        backgroundColor: '#16213e',
        padding: '15px',
        borderRadius: '12px',
        border: '2px solid #0f3460'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>
            🔍 Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search detections..."
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2a2a4e',
              color: '#eee',
              border: '1px solid #444',
              borderRadius: '5px',
              fontSize: '12px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>
            ⚠️ Severity Filter
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2a2a4e',
              color: '#eee',
              border: '1px solid #444',
              borderRadius: '5px',
              fontSize: '12px'
            }}
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>
            📈 Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2a2a4e',
              color: '#eee',
              border: '1px solid #444',
              borderRadius: '5px',
              fontSize: '12px'
            }}
          >
            <option value="time">Time</option>
            <option value="confidence">Confidence</option>
            <option value="severity">Severity</option>
            <option value="droneId">Drone ID</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>
            ⚡ Speed
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#00aaff'
            }}
          />
        </div>
      </div>

      {/* Enhanced Data Display */}
      {viewMode === 'table' && (
        <div style={{
          backgroundColor: '#16213e',
          borderRadius: '12px',
          border: '2px solid #0f3460',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: isMobile ? '11px' : '13px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#0f3460' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('droneId')}>
                    🚁 Drone {sortBy === 'droneId' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('detection')}>
                    🔍 Detection {sortBy === 'detection' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('confidence')}>
                    📊 Confidence {sortBy === 'confidence' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('severity')}>
                    ⚠️ Severity {sortBy === 'severity' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  {!isMobile && (
                    <>
                      <th style={{ padding: '12px 8px', textAlign: 'left' }}>📍 Location</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('time')}>
                        ⏰ Time {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#1a2650' : '#16213e',
                      borderBottom: '1px solid #0f3460',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSelectedDetection(item)}
                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#2a3660'}
                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#1a2650' : '#16213e'}
                  >
                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#00aaff' }}>
                      {item.droneId}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ marginRight: '5px' }}>{getDetectionIcon(item.detection)}</span>
                      {item.detection}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        color: getConfidenceColor(item.confidence),
                        fontWeight: 'bold'
                      }}>
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        color: getSeverityColor(item.severity),
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: `${getSeverityColor(item.severity)}20`,
                        fontSize: '10px'
                      }}>
                        {item.severity}
                      </span>
                    </td>
                    {!isMobile && (
                      <>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#aaa' }}>
                          {item.coordinates}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#aaa' }}>
                          {formatTime(item.time)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'cards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: getGridColumns(),
          gap: '15px'
        }}>
          {filteredData.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                backgroundColor: '#16213e',
                padding: '15px',
                borderRadius: '12px',
                border: `2px solid ${getSeverityColor(item.severity)}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 15px ${getSeverityColor(item.severity)}30`
              }}
              onClick={() => setSelectedDetection(item)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{
                  fontSize: '20px',
                  marginRight: '10px'
                }}>
                  {getDetectionIcon(item.detection)}
                </span>
                <span style={{
                  color: getSeverityColor(item.severity),
                  fontWeight: 'bold',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: `${getSeverityColor(item.severity)}20`
                }}>
                  {item.severity}
                </span>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ color: '#00aaff', fontWeight: 'bold', fontSize: '14px' }}>
                  {item.droneId}
                </div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                  {item.detection}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
                <div>Confidence: <span style={{ color: getConfidenceColor(item.confidence), fontWeight: 'bold' }}>
                  {(item.confidence * 100).toFixed(1)}%
                </span></div>
                <div>Location: {item.coordinates}</div>
                <div>Time: {formatTime(item.time)}</div>
                {item.alert !== 'None' && (
                  <div style={{ color: '#ff6600', fontWeight: 'bold', marginTop: '5px' }}>
                    Alert: {item.alert}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detection Detail Modal */}
      {selectedDetection && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#16213e',
            padding: '20px',
            borderRadius: '12px',
            border: `2px solid ${getSeverityColor(selectedDetection.severity)}`,
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80%',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ color: '#00d4ff', margin: 0 }}>Detection Details</h3>
              <button
                onClick={() => setSelectedDetection(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ lineHeight: '1.6' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Drone:</strong> {selectedDetection.droneId}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Detection:</strong> {getDetectionIcon(selectedDetection.detection)} {selectedDetection.detection}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Confidence:</strong> <span style={{ color: getConfidenceColor(selectedDetection.confidence) }}>
                  {(selectedDetection.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Severity:</strong> <span style={{ color: getSeverityColor(selectedDetection.severity) }}>
                  {selectedDetection.severity}
                </span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Location:</strong> {selectedDetection.coordinates}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Time:</strong> {formatTime(selectedDetection.time)}
              </div>
              {selectedDetection.alert !== 'None' && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Alert:</strong> <span style={{ color: '#ff6600' }}>
                    {selectedDetection.alert}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}