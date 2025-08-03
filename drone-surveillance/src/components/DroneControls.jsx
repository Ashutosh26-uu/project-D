
import { useState, useEffect } from 'react'

const DroneControls = ({ droneStatus, setDroneStatus, systemStatus, onActivateJamming, onDeactivateJamming, onStart3DMapping, onDetectLandmines, onAnalyzeThreats }) => {
  const [controlMode, setControlMode] = useState('auto') // auto, manual, emergency
  const [flightPath, setFlightPath] = useState([])
  const [waypoints, setWaypoints] = useState([])
  const [cameraMode, setCameraMode] = useState('normal') // normal, thermal, night, zoom
  const [isRecording, setIsRecording] = useState(false)
  const [actionStatus, setActionStatus] = useState({
    takeoff: false,
    land: false,
    emergency: false,
    patrol: false,
    thermal: false,
    return: false,
    jamming: false,
    mapping: false,
    landmine: false,
    threat: false
  })

  useEffect(() => {
    // Simulate battery drain
    const batteryInterval = setInterval(() => {
      if (droneStatus.isActive && controlMode !== 'emergency') {
        setDroneStatus(prev => ({
          ...prev,
          battery: Math.max(0, prev.battery - 0.1)
        }))
      }
    }, 1000)

    return () => clearInterval(batteryInterval)
  }, [droneStatus.isActive, controlMode, setDroneStatus])

  const handleControlChange = (control, value) => {
    setDroneStatus(prev => ({
      ...prev,
      [control]: value
    }))
  }

  const handleTakeoff = () => {
    setActionStatus(prev => ({ ...prev, takeoff: true }))
    setDroneStatus({ isActive: true, altitude: 50 })
    alert('🚁 TAKEOFF SEQUENCE INITIATED!\n\n- Engines: STARTED\n- Rotors: SPINNING\n- Altitude: CLIMBING\n- Status: AIRBORNE')
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, takeoff: false }))
    }, 3000)
  }

  const handleLanding = () => {
    setActionStatus(prev => ({ ...prev, land: true }))
    setDroneStatus({ isActive: false, altitude: 0 })
    alert('🛬 LANDING SEQUENCE INITIATED!\n\n- Altitude: DESCENDING\n- Landing gear: DEPLOYED\n- Approach: STABLE\n- Status: LANDING')
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, land: false }))
    }, 3000)
  }

  const handleEmergencyStop = () => {
    setActionStatus(prev => ({ ...prev, emergency: true }))
    alert('🚨 EMERGENCY STOP ACTIVATED!\n\n- All systems: SHUTDOWN\n- Emergency protocols: ENGAGED\n- Safety systems: ACTIVE\n- Status: EMERGENCY')
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, emergency: false }))
    }, 5000)
  }

  const handleStartPatrol = () => {
    setActionStatus(prev => ({ ...prev, patrol: true }))
    alert('🔄 AUTOMATED PATROL INITIATED!\n\n- Route: CALCULATED\n- Waypoints: SET\n- Sensors: ACTIVE\n- Status: PATROLLING')
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, patrol: false }))
    }, 3000)
  }

  const handleThermalScan = () => {
    setActionStatus(prev => ({ ...prev, thermal: true }))
    alert('🔥 THERMAL SCAN ACTIVATED!\n\n- Thermal sensors: ACTIVE\n- Range: MAXIMUM\n- Sensitivity: HIGH\n- Status: SCANNING')
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, thermal: false }))
    }, 4000)
  }

  const handleReturnToBase = () => {
    setActionStatus(prev => ({ ...prev, return: true }))
    alert('🏠 RETURN TO BASE INITIATED!\n\n- Coordinates: SET\n- Route: CALCULATED\n- Speed: OPTIMAL\n- Status: RETURNING')
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, return: false }))
    }, 3000)
  }

  const handleActivateJamming = () => {
    setActionStatus(prev => ({ ...prev, jamming: true }))
    onActivateJamming()
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, jamming: false }))
    }, 2000)
  }

  const handleDeactivateJamming = () => {
    setActionStatus(prev => ({ ...prev, jamming: true }))
    onDeactivateJamming()
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, jamming: false }))
    }, 2000)
  }

  const handleStart3DMapping = () => {
    setActionStatus(prev => ({ ...prev, mapping: true }))
    onStart3DMapping()
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, mapping: false }))
    }, 2000)
  }

  const handleDetectLandmines = () => {
    setActionStatus(prev => ({ ...prev, landmine: true }))
    onDetectLandmines()
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, landmine: false }))
    }, 3000)
  }

  const handleAnalyzeThreats = () => {
    setActionStatus(prev => ({ ...prev, threat: true }))
    onAnalyzeThreats()
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, threat: false }))
    }, 2000)
  }

  const handleAltitudeChange = (newAltitude) => {
    setDroneStatus({ altitude: Math.max(0, Math.min(droneStatus.maxAltitude, newAltitude)) })
  }

  const handleSpeedChange = (newSpeed) => {
    setDroneStatus({ speed: Math.max(0, Math.min(droneStatus.maxSpeed, newSpeed)) })
  }

  const addWaypoint = () => {
    const newWaypoint = {
      id: Date.now(),
      lat: droneStatus.location.lat + (Math.random() - 0.5) * 0.01,
      lng: droneStatus.location.lng + (Math.random() - 0.5) * 0.01,
      altitude: Math.floor(Math.random() * 100) + 50
    }
    setWaypoints(prev => [...prev, newWaypoint])
    alert(`➕ WAYPOINT ADDED!\n\nCoordinates: ${newWaypoint.lat.toFixed(4)}, ${newWaypoint.lng.toFixed(4)}\nAltitude: ${newWaypoint.altitude}m\nTotal waypoints: ${waypoints.length + 1}`)
  }

  const removeWaypoint = (id) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id))
    alert('🗑️ Waypoint removed from patrol route')
  }

  const handleRecording = () => {
    setActionStatus(prev => ({ ...prev, recording: true }))
    const newRecordingState = !isRecording
    
    if (newRecordingState) {
      alert('🔴 RECORDING STARTED!\n\n- Video recording initiated\n- Audio capture enabled\n- Storage: 4K resolution\n- Duration: Unlimited')
    } else {
      alert('⏹️ RECORDING STOPPED!\n\n- Video recording saved\n- File: surveillance_2024_06_27.mp4\n- Duration: 15:32\n- Size: 2.4 GB')
    }
    
    setIsRecording(newRecordingState)
    
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, recording: false }))
    }, 2000)
  }

  return (
    <div className="drone-controls" style={{ margin: '20px 30px 40px 20px' }}>
      <div className="controls-header">
        <h1 style={{margin:'20px 0'}}> Advanced Drone Control System</h1>
        <div className="control-mode">
          <div style={{ textAlign: 'left' }}>
            <span>Mode:</span>
            <span style={{ margin: '20px 30px 40px 20px' }}>
              <button 
                className={`mode-btn ${controlMode === 'auto' ? 'active' : ''}`}
                onClick={() => setControlMode('auto')}
                style={{ margin: '0 10px' }}
              >
                AUTO
              </button>
              <button 
                className={`mode-btn ${controlMode === 'manual' ? 'active' : ''}`}
                onClick={() => setControlMode('manual')}
                style={{ margin: '0 10px' }}
              >
                MANUAL
              </button>
              <button 
                className={`mode-btn ${controlMode === 'emergency' ? 'active' : ''}`}
                onClick={() => setControlMode('emergency')}
                style={{ margin: '0 10px' }}
              >
                EMERGENCY
              </button>
            </span>
          </div>
        </div>
      </div>

      <div className="controls-grid">
        {/* Basic Flight Controls */}
        <div className="control-section" style={{margin: '30px 10px'}}>
          <h4>🚁 Flight Controls</h4>
          <span 
            style={{
              display: 'flex',
              gap: '12px',         // space between buttons
              alignItems: 'center' // optional: vertical centering
            }}
          >
            <button 
              className={`control-btn takeoff ${actionStatus.takeoff ? 'active' : ''}`}
              onClick={handleTakeoff}
              disabled={actionStatus.takeoff || !droneStatus.isActive}
              style={{ margin: '10px 0' }}
            >
              {actionStatus.takeoff ? '🚁 TAKING OFF...' : '🚁 Takeoff'}
            </button>

            <button 
              className={`control-btn land ${actionStatus.land ? 'active' : ''}`}
              onClick={handleLanding}
              disabled={actionStatus.land || !droneStatus.isActive}
              style={{ margin: '10px 0' }}
            >
              {actionStatus.land ? '🛬 LANDING...' : '🛬 Land'}
            </button>

            <button 
              className={`control-btn emergency ${actionStatus.emergency ? 'active' : ''}`}
              onClick={handleEmergencyStop}
              disabled={actionStatus.emergency}
              style={{ margin: '10px 0' }}
            >
              {actionStatus.emergency ? '🚨 EMERGENCY...' : '🚨 Emergency Stop'}
            </button>
          </span>
        </div>

        {/* Mission Controls */}
        <div className="control-section">
          <h4>🎯 Mission Controls</h4>
          <span style={{
              'margin-top': '10px',
              display: 'flex',
              gap: '12px',         // space between buttons
              alignItems: 'center' // optional: vertical centering
            }}>
            <button 
              className={`control-btn patrol ${actionStatus.patrol ? 'active' : ''}`}
              onClick={handleStartPatrol}
              disabled={actionStatus.patrol || !droneStatus.isActive}
            >
              {actionStatus.patrol ? '🔄 PATROLLING...' : '🔄 Start Patrol'}
            </button>
            <button 
              className={`control-btn thermal ${actionStatus.thermal ? 'active' : ''}`}
              onClick={handleThermalScan}
              disabled={actionStatus.thermal || !droneStatus.isActive}
            >
              {actionStatus.thermal ? '🔥 SCANNING...' : '🔥 Thermal Scan'}
            </button>
            <button 
              className={`control-btn return ${actionStatus.return ? 'active' : ''}`}
              onClick={handleReturnToBase}
              disabled={actionStatus.return || !droneStatus.isActive}
            >
              {actionStatus.return ? '🏠 RETURNING...' : '🏠 Return to Base'}
            </button>
          </span>
        </div>

        {/* Advanced Military Controls */}
        <div className="control-section military">
          <h4>⚔️ Military Systems</h4>
          <div className="control-buttons">
            <button 
              className={`control-btn jamming ${actionStatus.jamming ? 'active' : ''}`}
              onClick={systemStatus.jammingActive ? handleDeactivateJamming : handleActivateJamming}
              disabled={actionStatus.jamming}
            >
              {actionStatus.jamming ? '🚫 JAMMING...' : systemStatus.jammingActive ? '✅ Deactivate Jamming' : '🚫 Activate Jamming'}
            </button>
            <button 
              className={`control-btn mapping ${actionStatus.mapping ? 'active' : ''}`}
              onClick={handleStart3DMapping}
              disabled={actionStatus.mapping || !droneStatus.isActive}
            >
              {actionStatus.mapping ? '🗺️ MAPPING...' : '🗺️ 3D Mapping'}
            </button>
            <button 
              className={`control-btn landmine ${actionStatus.landmine ? 'active' : ''}`}
              onClick={handleDetectLandmines}
              disabled={actionStatus.landmine || !droneStatus.isActive}
            >
              {actionStatus.landmine ? '💣 DETECTING...' : '💣 Detect Landmines'}
            </button>
            <button 
              className={`control-btn threat ${actionStatus.threat ? 'active' : ''}`}
              onClick={handleAnalyzeThreats}
              disabled={actionStatus.threat}
            >
              {actionStatus.threat ? '📊 ANALYZING...' : '📊 Threat Analysis'}
            </button>
          </div>
        </div>

        {/* Manual Controls */}
        {controlMode === 'manual' && (
          <div className="control-section">
            <h4>🎮 Manual Controls</h4>
            <div className="manual-controls">
              <div className="control-group">
                <label>Altitude: {droneStatus.altitude}m</label>
                <input 
                  type="range" 
                  min="0" 
                  max={droneStatus.maxAltitude} 
                  value={droneStatus.altitude}
                  onChange={(e) => handleAltitudeChange(Number(e.target.value))}
                />
                <span>{droneStatus.altitude}m / {droneStatus.maxAltitude}m</span>
              </div>
              <div className="control-group">
                <label>Speed: {droneStatus.speed} km/h</label>
                <input 
                  type="range" 
                  min="0" 
                  max={droneStatus.maxSpeed} 
                  value={droneStatus.speed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                />
                <span>{droneStatus.speed} km/h / {droneStatus.maxSpeed} km/h</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Display */}
        <div className="control-section">
          <h4>📊 Status Display</h4>
          <div className="status-display">
            <div className="status-item">
              <span className="status-label">Battery:</span>
              <span className="status-value">{droneStatus.battery}%</span>
            </div>
            <div className="status-item">
              <span className="status-label">Altitude:</span>
              <span className="status-value">{droneStatus.altitude}m</span>
            </div>
            <div className="status-item">
              <span className="status-label">Speed:</span>
              <span className="status-value">{droneStatus.speed} km/h</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-value ${droneStatus.isActive ? 'active' : 'inactive'}`}>
                {droneStatus.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Threat Level:</span>
              <span className="status-value" style={{ 
                color: droneStatus.threatLevel === 'HIGH' ? '#ff4444' : 
                       droneStatus.threatLevel === 'MEDIUM' ? '#ff8800' : '#4CAF50' 
              }}>
                {droneStatus.threatLevel}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Jamming:</span>
              <span className="status-value" style={{ 
                color: droneStatus.jammingStatus === 'ACTIVE' ? '#ff4444' : '#4CAF50' 
              }}>
                {droneStatus.jammingStatus}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Head Drone:</span>
              <span className="status-value">
                {droneStatus.isHeadDrone ? '👑 YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="control-section">
          <h4>🌐 System Status</h4>
          <div className="system-status-display">
            <div className="status-item">
              <span className="status-label">Weather:</span>
              <span className="status-value">{systemStatus.weather}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Wind:</span>
              <span className="status-value">{systemStatus.windSpeed} km/h</span>
            </div>
            <div className="status-item">
              <span className="status-label">Visibility:</span>
              <span className="status-value">{systemStatus.visibility}</span>
            </div>
            <div className="status-item">
              <span className="status-label">System Threat:</span>
              <span className="status-value" style={{ 
                color: systemStatus.threatLevel === 'HIGH' ? '#ff4444' : 
                       systemStatus.threatLevel === 'MEDIUM' ? '#ff8800' : '#4CAF50' 
              }}>
                {systemStatus.threatLevel}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Jamming System:</span>
              <span className="status-value" style={{ 
                color: systemStatus.jammingActive ? '#ff4444' : '#4CAF50' 
              }}>
                {systemStatus.jammingActive ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Head Drone Status:</span>
              <span className="status-value">{systemStatus.headDroneStatus}</span>
            </div>
          </div>
        </div>

        {/* Patrol Controls */}
        <div className="control-section">
          <h4>Patrol & Waypoints</h4>
          <div className="patrol-controls">
            <div className="patrol-buttons">
              <button 
                className={`patrol-btn start ${actionStatus.patrol ? 'active' : ''}`}
                onClick={handleStartPatrol}
                disabled={controlMode === 'auto' || actionStatus.patrol}
              >
                {actionStatus.patrol ? '🔄 STARTING...' : '🔄 Start Patrol'}
              </button>
            </div>
            
            <div className="waypoint-controls">
              <button className="waypoint-btn add" onClick={addWaypoint}>
                ➕ Add Waypoint
              </button>
              <button 
                className="waypoint-btn clear"
                onClick={() => {
                  setWaypoints([])
                  alert('🗑️ All waypoints cleared from patrol route')
                }}
                disabled={waypoints.length === 0}
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          {/* Waypoints List */}
          <div className="waypoints-list">
            <h5>Waypoints ({waypoints.length})</h5>
            {waypoints.map((waypoint) => (
              <div key={waypoint.id} className="waypoint-item">
                <span>
                  {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)} 
                  (Alt: {waypoint.altitude}m)
                </span>
                <button 
                  className="remove-waypoint"
                  onClick={() => removeWaypoint(waypoint.id)}
                >
                  ✕
                </button>
              </div>
            ))}
            {waypoints.length === 0 && (
              <p className="no-waypoints">No waypoints set</p>
            )}
          </div>
        </div>

        {/* Flight Log */}
        <div className="control-section">
          <h4>Flight Log</h4>
          <div className="flight-log">
            <div className="log-entry">
              <span className="log-time">{new Date().toLocaleTimeString()}</span>
              <span className="log-message">Drone system initialized</span>
            </div>
            <div className="log-entry">
              <span className="log-time">{new Date().toLocaleTimeString()}</span>
              <span className="log-message">Patrol route loaded</span>
            </div>
            <div className="log-entry">
              <span className="log-time">{new Date().toLocaleTimeString()}</span>
              <span className="log-message">Thermal sensors active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DroneControls 