import React, { useState, useEffect, useRef, useCallback } from 'react';

const MissionMappingPortal = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [drones, setDrones] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [missions, setMissions] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [mapMode, setMapMode] = useState('satellite');
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [missionStats, setMissionStats] = useState({
    activeMissions: 3,
    completedToday: 12,
    totalDistance: 45.2,
    avgSpeed: 15.8
  });
  const [weatherData, setWeatherData] = useState({
    temperature: 24,
    windSpeed: 12,
    visibility: 8.5,
    conditions: 'Clear'
  });
  const mapRef = useRef(null);

  // Initialize demo data
  useEffect(() => {
    setDrones([
      {
        id: 1, name: 'Pinaak-01', lat: 28.6139, lng: 77.2090,
        status: 'active', battery: 85, altitude: 120, speed: 15.2,
        mission: 'Patrol Alpha', eta: '15:30'
      },
      {
        id: 2, name: 'Akash-02', lat: 28.615, lng: 77.215,
        status: 'returning', battery: 45, altitude: 95, speed: 18.7,
        mission: 'Survey Beta', eta: '16:45'
      },
      {
        id: 3, name: 'Prithvi-03', lat: 28.617, lng: 77.212,
        status: 'standby', battery: 92, altitude: 0, speed: 0,
        mission: 'Ready', eta: 'N/A'
      }
    ]);

    setWaypoints([
      { id: 1, lat: 28.6145, lng: 77.211, label: 'Alpha-1', type: 'patrol', priority: 'high' },
      { id: 2, lat: 28.616, lng: 77.213, label: 'Beta-2', type: 'survey', priority: 'medium' },
      { id: 3, lat: 28.618, lng: 77.214, label: 'Gamma-3', type: 'checkpoint', priority: 'low' }
    ]);

    setMissions([
      {
        id: 1, name: 'Patrol Alpha', status: 'active',
        drones: ['Pinaak-01'], progress: 65, eta: '15:30',
        waypoints: [1, 2], distance: 12.5
      },
      {
        id: 2, name: 'Survey Beta', status: 'active',
        drones: ['Akash-02'], progress: 80, eta: '16:45',
        waypoints: [2, 3], distance: 8.3
      },
      {
        id: 3, name: 'Recon Charlie', status: 'planned',
        drones: [], progress: 0, eta: 'TBD',
        waypoints: [1, 3], distance: 15.7
      }
    ]);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prev => prev.map(drone => ({
        ...drone,
        lat: drone.lat + (Math.random() - 0.5) * 0.001,
        lng: drone.lng + (Math.random() - 0.5) * 0.001,
        battery: Math.max(20, drone.battery + (Math.random() > 0.7 ? -1 : 0)),
        speed: drone.status === 'active' ? 12 + Math.random() * 8 : 0
      })));

      setMissionStats(prev => ({
        ...prev,
        totalDistance: prev.totalDistance + Math.random() * 0.5,
        avgSpeed: 14 + Math.random() * 4
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleMapClick = useCallback((event) => {
    if (!isAddingWaypoint && !isDrawingRoute) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert screen coordinates to lat/lng (simplified)
    const lat = 28.6139 + (200 - y) / 20000;
    const lng = 77.2090 + (x - 400) / 8000;

    if (isAddingWaypoint) {
      const newWaypoint = {
        id: Date.now(),
        lat,
        lng,
        label: `WP-${waypoints.length + 1}`,
        type: 'patrol',
        priority: 'medium'
      };
      setWaypoints(prev => [...prev, newWaypoint]);
      setIsAddingWaypoint(false);
    } else if (isDrawingRoute) {
      setRoutePoints(prev => [...prev, { lat, lng }]);
    }
  }, [isAddingWaypoint, isDrawingRoute, waypoints.length]);

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981', returning: '#f59e0b',
      standby: '#6b7280', emergency: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444', medium: '#f59e0b', low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: '#f1f5f9',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>
          🗺️ Mission Mapping & Planning Portal
        </h1>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { id: 'map', label: '🗺️ Live Map' },
            { id: 'missions', label: '🎯 Missions' },
            // { id: 'planning', label: '📋 Planning' },
            // { id: 'analytics', label: '📊 Analytics' }
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

        {/* Live Map Tab */}
        {activeTab === 'map' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '15px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setIsAddingWaypoint(!isAddingWaypoint)}
                    style={{
                      padding: '8px 16px',
                      background: isAddingWaypoint ? '#ef4444' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {isAddingWaypoint ? '❌ Cancel' : '📍 Add Waypoint'}
                  </button>
                  <button
                    onClick={() => setIsDrawingRoute(!isDrawingRoute)}
                    style={{
                      padding: '8px 16px',
                      background: isDrawingRoute ? '#ef4444' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {isDrawingRoute ? '❌ Cancel' : '🛤️ Draw Route'}
                  </button>
                </div>
                <select
                  value={mapMode}
                  onChange={(e) => setMapMode(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#f1f5f9'
                  }}
                >
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div
                ref={mapRef}
                onClick={handleMapClick}
                style={{
                  height: '500px',
                  background: mapMode === 'satellite'
                    ? 'linear-gradient(45deg, #2d5016 0%, #4a7c59 50%, #2d5016 100%)'
                    : mapMode === 'terrain'
                      ? 'linear-gradient(45deg, #8b4513 0%, #daa520 50%, #8b4513 100%)'
                      : 'linear-gradient(45deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%)',
                  position: 'relative',
                  cursor: (isAddingWaypoint || isDrawingRoute) ? 'crosshair' : 'default'
                }}
              >
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  {/* Grid lines */}
                  {[...Array(11)].map((_, i) => (
                    <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={500} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  ))}
                  {[...Array(7)].map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 80} x2={800} y2={i * 80} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  ))}

                  {/* Waypoints */}
                  {waypoints.map(wp => {
                    const x = 400 + (wp.lng - 77.2090) * 8000;
                    const y = 200 - (wp.lat - 28.6139) * 20000;
                    return (
                      <g key={wp.id}>
                        <circle
                          cx={x} cy={y} r={8}
                          fill={getPriorityColor(wp.priority)}
                          stroke="white" strokeWidth="2"
                        />
                        <text x={x} y={y - 15} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                          {wp.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Drones */}
                  {drones.map(drone => {
                    const x = 400 + (drone.lng - 77.2090) * 8000;
                    const y = 200 - (drone.lat - 28.6139) * 20000;
                    return (
                      <g key={drone.id}>
                        <circle
                          cx={x} cy={y} r={12}
                          fill={getStatusColor(drone.status)}
                          stroke="white" strokeWidth="3"
                        />
                        <text x={x} y={y + 25} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                          {drone.name}
                        </text>
                        {drone.status === 'active' && (
                          <circle cx={x} cy={y} r={20} fill="none" stroke={getStatusColor(drone.status)} strokeWidth="2" opacity="0.5">
                            <animate attributeName="r" values="12;25;12" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Route points */}
                  {routePoints.map((point, index) => {
                    const x = 400 + (point.lng - 77.2090) * 8000;
                    const y = 200 - (point.lat - 28.6139) * 20000;
                    return (
                      <circle key={index} cx={x} cy={y} r={4} fill="#f59e0b" />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Side Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Weather Info */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <h3 style={{ marginBottom: '15px' }}>🌤️ Weather Conditions</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div>Temperature: {weatherData.temperature}°C</div>
                  <div>Wind: {weatherData.windSpeed} km/h</div>
                  <div>Visibility: {weatherData.visibility} km</div>
                  <div>Conditions: {weatherData.conditions}</div>
                </div>
              </div>

              {/* Active Drones */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <h3 style={{ marginBottom: '15px' }}>🚁 Active Drones</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {drones.map(drone => (
                    <div key={drone.id} style={{
                      padding: '10px',
                      background: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedDrone?.id === drone.id ? '2px solid #3b82f6' : '1px solid transparent'
                    }}
                      onClick={() => setSelectedDrone(drone)}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{drone.name}</div>
                      <div style={{ fontSize: '0.9em', color: '#94a3b8' }}>
                        Status: <span style={{ color: getStatusColor(drone.status) }}>{drone.status}</span>
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#94a3b8' }}>
                        Battery: {drone.battery}% | Speed: {drone.speed} km/h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {missions.map(mission => (
              <div key={mission.id} style={{
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>{mission.name}</h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: mission.status === 'active' ? '#10b981' : mission.status === 'planned' ? '#f59e0b' : '#6b7280',
                    color: 'white',
                    fontSize: '0.8em'
                  }}>
                    {mission.status}
                  </span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>Progress</span>
                    <span>{mission.progress}%</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${mission.progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9em', marginBottom: '15px' }}>
                  <div>Drones: {mission.drones.join(', ') || 'None assigned'}</div>
                  <div>Distance: {mission.distance} km</div>
                  <div>ETA: {mission.eta}</div>
                </div>
                <button style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[
                { label: 'Active Missions', value: missionStats.activeMissions, icon: '🎯', color: '#3b82f6' },
                { label: 'Completed Today', value: missionStats.completedToday, icon: '✅', color: '#10b981' },
                { label: 'Total Distance', value: `${missionStats.totalDistance.toFixed(1)} km`, icon: '📏', color: '#f59e0b' },
                { label: 'Avg Speed', value: `${missionStats.avgSpeed.toFixed(1)} km/h`, icon: '⚡', color: '#ef4444' }
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionMappingPortal;