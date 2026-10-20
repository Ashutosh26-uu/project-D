import React, { useState, useEffect, useRef } from 'react';
import './DroneDashboard.css';
import DroneSimulation3D from './DroneSimulation3D';
import ThreatPortal from './ThreatPortal';
// Placeholder: Import your API utility here for AI detection
// import { detectAI } from '../api/aiDetection';
// Add import for new globe panel
import ThreeDGlobePanel from './ThreeDGlobePanel';
import AIOutputPortal from './AIOutputPortal';
import MissionMappingPortal from './MissionMappingPortal';
import SecurityPortal from './SecurityPortal';
import MissionHistoryPortal from './MissionHistoryPortal';
import FirmwareManagementPortal from './FirmwareManagementPortal';
import EmergencyControlsPortal from './EmergencyControlsPortal';
import IntegrationPortal from './IntegrationPortal';
import SwarmAISyncPortal from './SwarmAISyncPortal';
import IFFPortal from './IFFPortal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const WS_BASE_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';

const DroneDashboard = (props) => {
  const { detections = [], airDefenses = [], radars = [], missiles = [], detectAirDefense, detectRadar, detectMissile } = props;
  const [drones, setDrones] = useState([
    { id: 1, name: 'Prithvi-1', type: 'Reconnaissance', battery: 85, status: 'Active', location: 'Sector A', altitude: 1200, speed: 45, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 2, name: 'Aakash-2', type: 'Combat', battery: 92, status: 'Active', location: 'Sector B', altitude: 800, speed: 60, threatLevel: 'Medium', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 3, name: 'Pinaka-3', type: 'Surveillance', battery: 78, status: 'Active', location: 'Sector C', altitude: 1500, speed: 35, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 4, name: 'Agni-4', type: 'Heavy Combat', battery: 95, status: 'Active', location: 'Sector D', altitude: 600, speed: 75, threatLevel: 'High', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 5, name: 'BrahMos-5', type: 'Stealth', battery: 88, status: 'Active', location: 'Sector E', altitude: 2000, speed: 55, threatLevel: 'Medium', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 6, name: 'Nirbhay-6', type: 'Multi-Role', battery: 82, status: 'Active', location: 'Sector F', altitude: 1000, speed: 50, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 7, name: 'Astra-7', type: 'Reconnaissance', battery: 80, status: 'Active', location: 'Sector G', altitude: 1100, speed: 48, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 8, name: 'Maitri-8', type: 'Combat', battery: 90, status: 'Active', location: 'Sector H', altitude: 900, speed: 62, threatLevel: 'Medium', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 9, name: 'Barak-9', type: 'Surveillance', battery: 76, status: 'Active', location: 'Sector I', altitude: 1400, speed: 37, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 10, name: 'Kaveri-10', type: 'Heavy Combat', battery: 93, status: 'Active', location: 'Sector J', altitude: 700, speed: 73, threatLevel: 'High', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 11, name: 'Tejas-11', type: 'Stealth', battery: 87, status: 'Active', location: 'Sector K', altitude: 2100, speed: 57, threatLevel: 'Medium', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 12, name: 'Arjun-12', type: 'Multi-Role', battery: 81, status: 'Active', location: 'Sector L', altitude: 1050, speed: 52, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 13, name: 'Dhruv-13', type: 'Reconnaissance', battery: 84, status: 'Active', location: 'Sector M', altitude: 1250, speed: 46, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 14, name: 'Rudra-14', type: 'Combat', battery: 91, status: 'Active', location: 'Sector N', altitude: 850, speed: 61, threatLevel: 'Medium', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 15, name: 'Lakshya-15', type: 'Surveillance', battery: 79, status: 'Active', location: 'Sector O', altitude: 1550, speed: 36, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 16, name: 'Nishant-16', type: 'Heavy Combat', battery: 94, status: 'Active', location: 'Sector P', altitude: 650, speed: 74, threatLevel: 'High', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 17, name: 'Rustom-17', type: 'Stealth', battery: 89, status: 'Active', location: 'Sector Q', altitude: 2050, speed: 56, threatLevel: 'Medium', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 18, name: 'Saras-18', type: 'Multi-Role', battery: 83, status: 'Active', location: 'Sector R', altitude: 1020, speed: 51, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 19, name: 'Hansa-19', type: 'Reconnaissance', battery: 86, status: 'Active', location: 'Sector S', altitude: 1150, speed: 49, threatLevel: 'Low', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    { id: 20, name: 'Kiran-20', type: 'Combat', battery: 88, status: 'Active', location: 'Sector T', altitude: 950, speed: 63, threatLevel: 'Medium', emergencyActive: false, lastReflexAction: null, lastEmergencyTime: null },
    // Add drones 21-64 with Indian weapon system names
    ...Array.from({ length: 44 }, (_, i) => {
      const idx = i + 21;
      const indianNames = [
        'Vikrant', 'Vikramaditya', 'INS Arihant', 'INS Chakra', 'INS Delhi', 'INS Mumbai', 'INS Kolkata', 'INS Chennai',
        'INS Kochi', 'INS Visakhapatnam', 'INS Mormugao', 'INS Imphal', 'INS Surat', 'INS Udaygiri', 'INS Dunagiri',
        'INS Taragiri', 'INS Vindhyagiri', 'INS Nilgiri', 'INS Himgiri', 'INS Udaygiri', 'INS Dunagiri', 'INS Taragiri',
        'INS Vindhyagiri', 'INS Nilgiri', 'INS Himgiri', 'INS Udaygiri', 'INS Dunagiri', 'INS Taragiri', 'INS Vindhyagiri',
        'INS Nilgiri', 'INS Himgiri', 'INS Udaygiri', 'INS Dunagiri', 'INS Taragiri', 'INS Vindhyagiri', 'INS Nilgiri',
        'INS Himgiri', 'INS Udaygiri', 'INS Dunagiri', 'INS Taragiri', 'INS Vindhyagiri', 'INS Nilgiri', 'INS Himgiri',
        'INS Udaygiri', 'INS Dunagiri', 'INS Taragiri', 'INS Vindhyagiri'
      ];
      const types = ['Reconnaissance','Combat','Surveillance','Heavy Combat','Stealth','Multi-Role'];
      const threatLevels = ['Low','Medium','High'];
      const sector = idx <= 26 ? String.fromCharCode(64 + idx) : 'A' + String.fromCharCode(64 + idx - 26);
      
      let name;
      const fullIndex = i + 20; // 20 hardcoded drones above + i
      if (fullIndex >= 50 && fullIndex <= 63) {
        name = `Badal ${fullIndex - 49}`;
      } else {
        name = indianNames[i % indianNames.length] + '-' + idx;
      }
      return {
        id: idx,
        name,
        type: types[i % types.length],
        battery: Math.round(70 + Math.random() * 30),
        status: 'Active',
        location: `Sector ${sector}`,
        altitude: Math.round(600 + Math.random() * 1600),
        speed: Math.round(35 + Math.random() * 45),
        threatLevel: threatLevels[i % threatLevels.length],
        emergencyActive: false,
        lastReflexAction: null,
        lastEmergencyTime: null
      };
    })
  ]);

  // State to track the ultimate head drone
  const [ultimateHeadId, setUltimateHeadId] = useState(1); // Prithvi-1 starts as ultimate head
  const [leadershipHistory, setLeadershipHistory] = useState([
    { droneId: 1, droneName: 'Prithvi-1', timestamp: new Date(), reason: 'Initial Assignment' }
  ]);

  // Function to find the next ultimate head when current one is destroyed
  const findNextUltimateHead = (currentDrones, destroyedDroneId) => {
    const activeDrones = currentDrones.filter(drone => drone.id !== destroyedDroneId && drone.status === 'Active');
    
    if (activeDrones.length === 0) {
      return null; // No active drones left
    }

    // Priority order for leadership transfer:
    // 1. Super heads (Aakash-2, Pinaka-3, etc.)
    // 2. Group heads
    // 3. Drones with highest battery
    // 4. Drones with highest combat capability (Heavy Combat > Combat > others)
    // 5. Drones with lowest ID (first in fleet)

    // First, try to find super heads
    const superHeads = activeDrones.filter(drone => {
      const group = Math.floor((drone.id - 1) / 5) + 1;
      const isHead = (drone.id - 1) % 5 === 0;
      return isHead && (group === 1 || group === 2);
    });

    if (superHeads.length > 0) {
      // Return the super head with highest battery
      return superHeads.reduce((best, current) => 
        current.battery > best.battery ? current : best
      );
    }

    // Then try group heads
    const groupHeads = activeDrones.filter(drone => {
      const isHead = (drone.id - 1) % 5 === 0;
      return isHead;
    });

    if (groupHeads.length > 0) {
      return groupHeads.reduce((best, current) => 
        current.battery > best.battery ? current : best
      );
    }

    // Then find drone with highest battery and combat capability
    const combatPriority = { 'Heavy Combat': 4, 'Combat': 3, 'Multi-Role': 2, 'Stealth': 1, 'Reconnaissance': 0, 'Surveillance': 0 };
    
    return activeDrones.reduce((best, current) => {
      const bestScore = best.battery + combatPriority[best.type] * 10;
      const currentScore = current.battery + combatPriority[current.type] * 10;
      return currentScore > bestScore ? current : best;
    });
  };

  // Function to transfer leadership
  const transferLeadership = (newHeadDrone) => {
    setUltimateHeadId(newHeadDrone.id);
    setLeadershipHistory(prev => [...prev, {
      droneId: newHeadDrone.id,
      droneName: newHeadDrone.name,
      timestamp: new Date(),
      reason: 'Leadership Transfer - Previous Head Destroyed'
    }]);

    // Add alert for leadership transfer
    setAlerts(prev => [{
      id: Date.now(),
      type: 'Leadership',
      severity: 'High',
      location: newHeadDrone.location,
      time: 'Just now',
      description: `Leadership transferred to ${newHeadDrone.name}. Prithvi-1 has been destroyed.`
    }, ...prev.slice(0, 19)]);
  };

  // Assign group, isHead, isSuperHead, IFF, and isUltimateHead
  const dronesWithHierarchy = drones.map((drone, i) => {
    const group = Math.floor(i / 5) + 1;
    const isHead = i % 5 === 0;
    // First 2 heads are super heads
    const isSuperHead = isHead && (group === 1 || group === 2);
    const iffCode = `IFF-${(i+1).toString().padStart(4, '0')}`;
    const isFriend = true;
    const isUltimateHead = drone.id === ultimateHeadId;
    
    return { ...drone, group, isHead, isSuperHead, iffCode, isFriend, isUltimateHead };
  });

  // Monitor for Prithvi-1 destruction and transfer leadership
  useEffect(() => {
    const prithvi1 = drones.find(drone => drone.id === 1);
    if (prithvi1 && prithvi1.status !== 'Active' && ultimateHeadId === 1) {
      // Prithvi-1 has been destroyed, find new ultimate head
      const newUltimateHead = findNextUltimateHead(drones, 1);
      if (newUltimateHead) {
        transferLeadership(newUltimateHead);
      }
    }
  }, [drones, ultimateHeadId]);

  // Function to destroy a drone (for testing)
  const destroyDrone = (droneId) => {
    setDrones(prev => prev.map(drone => 
      drone.id === droneId 
        ? { ...drone, status: 'Destroyed', battery: 0 }
        : drone
    ));

    // If the destroyed drone was the ultimate head, transfer leadership
    if (droneId === ultimateHeadId) {
      const newUltimateHead = findNextUltimateHead(drones, droneId);
      if (newUltimateHead) {
        transferLeadership(newUltimateHead);
      }
    }
  };

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Intrusion', severity: 'High', location: 'Sector B', time: '2 min ago', description: 'Unauthorized vehicle detected' },
    { id: 2, type: 'Threat', severity: 'Medium', location: 'Sector D', time: '5 min ago', description: 'Suspicious activity detected' },
    { id: 3, type: 'System', severity: 'Low', location: 'Sector A', time: '8 min ago', description: 'Weather conditions affecting visibility' }
  ]);

  const [systemStatus, setSystemStatus] = useState({
    weather: 'Clear',
    windSpeed: 12,
    visibility: 'Good',
    threatLevel: 'Medium',
    jammingActive: false
  });

  const [selectedDrone, setSelectedDrone] = useState(null);
  const [landmines, setLandmines] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [threeDMap, setThreeDMap] = useState({ progress: 0, status: 'Mapping' });
  const [focusedDrone, setFocusedDrone] = useState(null);
  const [navigationSystem, setNavigationSystem] = useState('GPS');
  const [navSwitchAlert, setNavSwitchAlert] = useState(null);
  const [lastNavSwitch, setLastNavSwitch] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enemyJammingActive, setEnemyJammingActive] = useState(false);
  const [zoneJammingActive, setZoneJammingActive] = useState(false);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const emergencyPanelRef = useRef(null);
  const [enemyPredictions, setEnemyPredictions] = useState([]);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [longRangeThreats, setLongRangeThreats] = useState([]);
  const [longRangeLoading, setLongRangeLoading] = useState(false);

  // HUD animation state for GPS/NavIC switch
  const [showNavSwitchHUD, setShowNavSwitchHUD] = useState(false);
  const [hudCoords, setHudCoords] = useState({ lat: 28.6139, lon: 77.2090 });

  // Show HUD animation on navigation system switch
  useEffect(() => {
    if (navSwitchAlert) {
      setShowNavSwitchHUD(true);
      // Simulate updated coordinates (randomize slightly for demo)
      setHudCoords({
        lat: 28.6139 + (Math.random() - 0.5) * 0.01,
        lon: 77.2090 + (Math.random() - 0.5) * 0.01
      });
      setTimeout(() => setShowNavSwitchHUD(false), 3200);
    }
  }, [navSwitchAlert]);

  // AI Prediction Data for heatmaps and paths
  const [aiPredictions, setAiPredictions] = useState([
    // Ambush zone heatmap
    { type: 'ambush', x: 0.32, y: 0.44, heatmap: true, radius: 8, color: '#ff4444', label: 'Predicted Ambush Zone' },
    // Minefield heatmap
    { type: 'minefield', x: 0.68, y: 0.62, heatmap: true, radius: 10, color: '#ffaa00', label: 'Predicted Minefield' },
    // Patrol route path
    { type: 'patrol', path: [ [0.15,0.2], [0.25,0.35], [0.4,0.5], [0.6,0.55], [0.8,0.7] ], color: '#00d4ff', label: 'Enemy Patrol Route' }
  ]);

  // Dynamically update AI predictions based on detections
  useEffect(() => {
    // Example: If tanks or soldiers detected, predict ambush/patrol nearby
    const tankZones = tanks.map(t => [t.x, t.y]);
    const soldierZones = drones.filter(d => d.type === 'Combat' && d.status === 'Active').map(d => [Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1]);
    const mineZones = landmines.map(l => [l.x, l.y]);
    // Ambush: cluster around tanks or soldiers
    const ambushPreds = tankZones.concat(soldierZones).slice(0, 2).map(([x, y], i) => ({
      type: 'ambush', x, y, heatmap: true, radius: 8, color: '#ff4444', label: `Predicted Ambush Zone ${i+1}`
    }));
    // Minefield: expand if more landmines detected
    const minefieldPreds = mineZones.slice(0, 2).map(([x, y], i) => ({
      type: 'minefield', x, y, heatmap: true, radius: 10 + landmines.length * 2, color: '#ffaa00', label: `Predicted Minefield ${i+1}`
    }));
    // Patrol: path through detected tanks/soldiers, fallback to default
    let patrolPath = tankZones.concat(soldierZones);
    if (patrolPath.length < 2) patrolPath = [[0.15,0.2],[0.25,0.35],[0.4,0.5],[0.6,0.55],[0.8,0.7]];
    const patrolPred = { type: 'patrol', path: patrolPath, color: '#00d4ff', label: 'Enemy Patrol Route' };
    setAiPredictions([...ambushPreds, ...minefieldPreds, patrolPred]);
  }, [tanks, landmines, drones]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setDetectionResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      const response = await fetch(`${API_BASE_URL}/api/detect`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setDetectionResult(data);
    } catch (err) {
      setError('Failed to connect to AI detection API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prev => prev.map(drone => ({
        ...drone,
        battery: Math.max(0, drone.battery - Math.random() * 2),
        altitude: drone.altitude + (Math.random() - 0.5) * 50,
        speed: drone.speed + (Math.random() - 0.5) * 5
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-switch navigation system based on jamming
  useEffect(() => {
    if (systemStatus.jammingActive && navigationSystem !== 'NavIC') {
      setNavigationSystem('NavIC');
      setNavSwitchAlert('GPS access blocked. Switched to NavIC.');
      setLastNavSwitch(new Date());
      setTimeout(() => setNavSwitchAlert(null), 3500);
    } else if (!systemStatus.jammingActive && navigationSystem !== 'GPS') {
      setNavigationSystem('GPS');
      setNavSwitchAlert('GPS access restored. Switched back to GPS.');
      setLastNavSwitch(new Date());
      setTimeout(() => setNavSwitchAlert(null), 3500);
    }
  }, [systemStatus.jammingActive]);

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'High': return '#ff4444';
      case 'Medium': return '#ffaa00';
      case 'Low': return '#4CAF50';
      default: return '#ffffff';
    }
  };

  const getDroneStatusColor = (drone) => {
    if (drone.battery < 20) return '#ff4444';
    if (drone.battery < 50) return '#ffaa00';
    return '#4CAF50';
  };

  const destroyTarget = (targetId) => {
    console.log(`Target ${targetId} destroyed`);
    setAlerts(prev => prev.filter(alert => alert.id !== targetId));
  };

  // Helper for random landmine type
  const getRandomMineType = () => (Math.random() < 0.5 ? 'Human Mine' : 'Tank Mine');

  // Emergency AI Reflex Logic (with action selection)
  const triggerEmergencyReflex = (droneId, reason = 'Sudden Threat', actionOverride = null) => {
    setDrones(prev => prev.map(drone => {
      if (drone.id !== droneId) return drone;
      let action = actionOverride || (drone.battery > 30 ? 'RTB (Return To Base)' : 'Self-Destruct');
      let newStatus = action === 'RTB (Return To Base)' ? 'Returning' : action === 'Self-Destruct' ? 'Destroyed' : action === 'Hold Position' ? 'Holding' : 'Evasive Maneuver' ? 'Evasive' : drone.status;
      return {
        ...drone,
        emergencyActive: true,
        lastReflexAction: action,
        lastEmergencyTime: new Date(),
        status: newStatus,
        battery: action === 'Self-Destruct' ? 0 : drone.battery
      };
    }));
    const droneObj = drones.find(d => d.id === droneId);
    setAlerts(prev => [{
      id: Date.now(),
      type: 'Emergency Reflex',
      severity: 'High',
      location: droneObj?.location || 'Unknown',
      time: 'Just now',
      description: `Emergency AI Reflex triggered for drone ${droneObj?.name || droneId}: ${reason}`
    }, ...prev.slice(0, 19)]);
    setEmergencyHistory(prev => [{
      id: Date.now(),
      droneId,
      droneName: droneObj?.name || droneId,
      action: actionOverride || (droneObj?.battery > 30 ? 'RTB (Return To Base)' : 'Self-Destruct'),
      reason,
      time: new Date()
    }, ...prev]);
  };

  // Simulate Sudden Threat Button
  const simulateSuddenThreat = () => {
    const activeDrones = drones.filter(d => d.status === 'Active' && !d.emergencyActive);
    if (activeDrones.length > 0) {
      const randomDrone = activeDrones[Math.floor(Math.random() * activeDrones.length)];
      triggerEmergencyReflex(randomDrone.id, 'Simulated Sudden Threat');
    }
  };

  // Simulate sudden threat/comm failure randomly every 60s for demo
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance to trigger emergency for a random active drone
      if (Math.random() < 0.1) {
        const activeDrones = drones.filter(d => d.status === 'Active' && !d.emergencyActive);
        if (activeDrones.length > 0) {
          const randomDrone = activeDrones[Math.floor(Math.random() * activeDrones.length)];
          triggerEmergencyReflex(randomDrone.id, 'Sudden Threat/Comm Failure (Auto)');
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [drones]);

  // Floating Emergency Alert Icon
  const anyEmergency = drones.some(d => d.emergencyActive);

  // Enhanced generateEnemyPredictions with justAdded and investigated
  const generateEnemyPredictions = () => {
    setPredictionLoading(true);
    setTimeout(() => {
      const types = ['Patrol', 'Ambush', 'Minefield'];
      const newPredictions = Array.from({length: 3 + Math.floor(Math.random()*3)}, (_, i) => {
        const type = types[Math.floor(Math.random()*types.length)];
        const latitude = 28.60 + Math.random() * 0.5;
        const longitude = 77.20 + Math.random() * 0.5;
        const confidence = (70 + Math.random()*30).toFixed(1);
        return {
          id: Date.now() + i,
          type,
          latitude,
          longitude,
          confidence,
          time: new Date(),
          justAdded: true,
          investigated: false
        };
      });
      setEnemyPredictions(newPredictions);
      setPredictionLoading(false);
      setTimeout(() => {
        setEnemyPredictions(prev => prev.map(p => ({...p, justAdded: false})));
      }, 1800);
    }, 1200);
  };

  const scanLongRangeThreats = () => {
    setLongRangeLoading(true);
    setTimeout(() => {
      const types = ['Enemy Drone', 'Missile Launch', 'Armored Vehicle', 'Unknown'];
      const newThreats = Array.from({length: 2 + Math.floor(Math.random()*3)}, (_, i) => {
        const type = types[Math.floor(Math.random()*types.length)];
        const latitude = 28.60 + Math.random() * 2.5;
        const longitude = 77.20 + Math.random() * 2.5;
        const distance = (10 + Math.random() * 40).toFixed(1);
        const confidence = (60 + Math.random()*40).toFixed(1);
        return {
          id: Date.now() + i,
          type,
          latitude,
          longitude,
          distance,
          confidence,
          time: new Date()
        };
      });
      setLongRangeThreats(newThreats);
      setLongRangeLoading(false);
    }, 1500);
  };

  // HUD animation state for anti-jamming protocol
  const [showAntiJammingHUD, setShowAntiJammingHUD] = useState(false);

  // Show anti-jamming HUD when enemy jamming is activated
  useEffect(() => {
    if (enemyJammingActive) {
      setShowAntiJammingHUD(true);
      setTimeout(() => setShowAntiJammingHUD(false), 3500);
    }
  }, [enemyJammingActive]);

  // HUD animation state for heat-seeking/thermal targeting
  const [showThermalHUD, setShowThermalHUD] = useState(false);
  const [thermalTarget, setThermalTarget] = useState(null);

  // Show thermal targeting HUD when a missile or jet is detected
  useEffect(() => {
    // Find the most recent missile or jet detection
    const heatTargets = [
      ...missiles.map(m => ({ type: 'Missile', x: m.x, y: m.y })),
      ...aircraft.map(a => ({ type: 'Fighter Jet', x: a.x, y: a.y }))
    ];
    if (heatTargets.length > 0) {
      setThermalTarget(heatTargets[0]);
      setShowThermalHUD(true);
      setTimeout(() => setShowThermalHUD(false), 3500);
    }
  }, [missiles, aircraft]);

  const style = document.createElement('style');
  style.innerHTML += `\n@keyframes targetPulse { 0%{box-shadow:0 0 24px 6px #ff9800cc;} 100%{box-shadow:0 0 36px 12px #ffeb3bcc;} }\n@keyframes targetLock { 0%{background:#ffeb3b;} 100%{background:#ff9800;} }\n@keyframes tagPulseBlue { 0%{box-shadow:0 0 12px #00bcd4aa;} 100%{box-shadow:0 0 24px #00bcd4;} }\n@keyframes tagPulseRed { 0%{box-shadow:0 0 12px #ff4444aa;} 100%{box-shadow:0 0 24px #ff4444;} }\n@keyframes swarmPulse { 0%{box-shadow:0 0 12px #00bcd4aa;} 100%{box-shadow:0 0 24px #00e676;} }\n@keyframes kamikazeDive { 0%{left:100px;} 100%{left:160px;} }\n@keyframes kamikazeExplode { 0%{transform:scale(0.7);} 100%{transform:scale(1.2);} }\n@keyframes radarSweep { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }\n`;
  document.head.appendChild(style);

  // HUD animation state for radar smart tagging
  const [showRadarHUD, setShowRadarHUD] = useState(false);
  const [radarObjects, setRadarObjects] = useState([]);

  // Simulate friendly/enemy distinction for demo
  function classifyAirObject(obj) {
    // For demo: even id = friendly, odd id = enemy
    if (obj.id % 2 === 0) return 'friendly';
    return 'enemy';
  }

  // Show radar HUD when new aircraft or missile detected
  useEffect(() => {
    const allAir = [
      ...aircraft.map(a => ({ ...a, type: 'Aircraft', tag: classifyAirObject(a) })),
      ...missiles.map(m => ({ ...m, type: 'Missile', tag: classifyAirObject(m) }))
    ];
    if (allAir.length > 0) {
      setRadarObjects(allAir);
      setShowRadarHUD(true);
      setTimeout(() => setShowRadarHUD(false), 3500);
    }
  }, [aircraft, missiles]);

  // HUD animation state for emergency AI reflex
  const [showEmergencyHUD, setShowEmergencyHUD] = useState(false);
  const [emergencyAction, setEmergencyAction] = useState(null);
  const [emergencyDrone, setEmergencyDrone] = useState(null);

  // Show emergency HUD when a drone loses comm or triggers emergency
  useEffect(() => {
    // Find any drone with emergencyActive or status not 'Active'
    const emergencyD = drones.find(d => d.emergencyActive || (d.status !== 'Active' && d.status !== 'Returning'));
    if (emergencyD) {
      let action = emergencyD.lastReflexAction || (emergencyD.battery > 30 ? 'RTB (Return To Base)' : 'Emergency Landing');
      if (emergencyD.status === 'Destroyed') action = 'Self-Destruct';
      setEmergencyDrone(emergencyD);
      setEmergencyAction(action);
      setShowEmergencyHUD(true);
      setTimeout(() => setShowEmergencyHUD(false), 3500);
    }
  }, [drones]);

  // HUD animation state for swarm coordination
  const [showSwarmHUD, setShowSwarmHUD] = useState(false);
  const [swarmDrones, setSwarmDrones] = useState([]);
  const [swarmTarget, setSwarmTarget] = useState({ x: 0.5, y: 0.5 });

  // Simulate swarm attack trigger
  const simulateSwarmAttack = () => {
    // Pick 5 active drones for the swarm
    const activeSwarm = drones.filter(d => d.status === 'Active').slice(0, 5);
    setSwarmDrones(activeSwarm);
    setSwarmTarget({ x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.4 });
    setShowSwarmHUD(true);
    setTimeout(() => setShowSwarmHUD(false), 4000);
  };

  // HUD animation state for kamikaze strike
  const [showKamikazeHUD, setShowKamikazeHUD] = useState(false);
  const [kamikazeDrone, setKamikazeDrone] = useState(null);
  const [kamikazeTarget, setKamikazeTarget] = useState(null);
  const [kamikazePhase, setKamikazePhase] = useState('lock');

  // Simulate kamikaze strike trigger
  const simulateKamikazeStrike = () => {
    // Pick first active drone and first tank as target
    const drone = drones.find(d => d.status === 'Active');
    const target = tanks[0] || { x: 0.5, y: 0.5, id: 'T-1' };
    if (!drone) return;
    setKamikazeDrone(drone);
    setKamikazeTarget(target);
    setKamikazePhase('lock');
    setShowKamikazeHUD(true);
    setTimeout(() => setKamikazePhase('confirm'), 1200);
    setTimeout(() => setKamikazePhase('dive'), 2200);
    setTimeout(() => setKamikazePhase('impact'), 3200);
    setTimeout(() => setShowKamikazeHUD(false), 4200);
  };

  // HUD animation state for indoor SLAM mapping
  const [showIndoorSLAMHUD, setShowIndoorSLAMHUD] = useState(false);
  const [slamProgress, setSlamProgress] = useState(0);

  // Simulate indoor mapping trigger
  const simulateIndoorMapping = () => {
    setSlamProgress(0);
    setShowIndoorSLAMHUD(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 18 + 8;
      setSlamProgress(Math.min(100, prog));
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => setShowIndoorSLAMHUD(false), 1200);
      }
    }, 400);
  };

  // HUD animation state for 3D mesh/wireframe generation
  const [showMeshHUD, setShowMeshHUD] = useState(false);
  const [meshProgress, setMeshProgress] = useState(0);

  // Simulate 3D map generation trigger
  const simulateMeshGeneration = () => {
    setMeshProgress(0);
    setShowMeshHUD(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 15 + 10;
      setMeshProgress(Math.min(100, prog));
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => setShowMeshHUD(false), 1200);
      }
    }, 350);
  };

  // Operator/Command Log state
  const [commandLog, setCommandLog] = useState([
    { type: 'system', message: 'AI Command Center Initialized', time: new Date() }
  ]);

  // Add log entry helper
  const addLog = (type, message) => {
    setCommandLog(prev => [
      { type, message, time: new Date() },
      ...prev.slice(0, 49)
    ]);
  };

  // Log major events (examples, expand as needed)
  useEffect(() => {
    if (navSwitchAlert) addLog('system', navSwitchAlert);
  }, [navSwitchAlert]);
  useEffect(() => {
    if (showEmergencyHUD && emergencyDrone) addLog('ai', `Emergency: ${emergencyDrone.name} - ${emergencyAction}`);
  }, [showEmergencyHUD]);
  useEffect(() => {
    if (showSwarmHUD) addLog('ai', 'Swarm Coordination: Synchronized Attack');
  }, [showSwarmHUD]);
  useEffect(() => {
    if (showKamikazeHUD) addLog('ai', 'Kamikaze Strike Initiated');
  }, [showKamikazeHUD]);
  useEffect(() => {
    if (showIndoorSLAMHUD) addLog('ai', 'Indoor SLAM Mapping Started');
  }, [showIndoorSLAMHUD]);
  useEffect(() => {
    if (showMeshHUD) addLog('ai', '3D Map Generation Started');
  }, [showMeshHUD]);

  // Tactical Map: click-to-focus handler
  const handleMapMarkerClick = (marker) => {
    if (marker.type && marker.type.startsWith('drone')) {
      setSelectedDrone(dronesWithHierarchy.find(d => d.id === marker.id));
    } else {
      setFocusedDrone(marker);
    }
    addLog('operator', `Focused on ${marker.name || marker.type || 'marker'}`);
  };

  // Helper to get custom display name for first 50 drones
  const getCustomDroneName = (drone, idx) => {
    if (idx < 10) return `Pinaak ${idx + 1}`;
    if (idx < 20) return `Akash ${idx - 9}`;
    if (idx < 30) return `Prithvi ${idx - 19}`;
    if (idx < 40) return `Arjun ${idx - 29}`;
    if (idx < 50) return `Karna ${idx - 39}`;
    return drone.name;
  };

  const [telemetry, setTelemetry] = useState({});

  useEffect(() => {
    // WebSocket se real-time telemetry update (demo fallback)
    const ws = new WebSocket(WS_BASE_URL);
    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data.type === 'telemetry') {
        setTelemetry(prev => ({
          ...prev,
          [data.droneId]: data
        }));
      }
    };
    return () => ws.close();
  }, []);

  const [selectedControlDrone, setSelectedControlDrone] = useState(null);
  const wsControlRef = useRef(null);

  useEffect(() => {
    wsControlRef.current = new WebSocket(WS_BASE_URL);
    return () => wsControlRef.current && wsControlRef.current.close();
  }, []);

  const sendDroneCommand = (droneId, command, params = {}) => {
    if (wsControlRef.current && wsControlRef.current.readyState === 1) {
      wsControlRef.current.send(JSON.stringify({
        type: 'command',
        droneId,
        command,
        params
      }));
    } else {
      alert('WebSocket not connected.');
    }
  };

  const [selectedVideoDrone, setSelectedVideoDrone] = useState(null);
  const [videoMode, setVideoMode] = useState('normal'); // 'normal' or 'thermal'
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);

  const handleScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedVideoDrone?.name || 'drone'}_${videoMode}_screenshot.png`;
    a.click();
  };

  const handleRecord = () => {
    // Demo: Just toggle recording state
    setIsRecording(r => !r);
    // Real: Use MediaRecorder API for actual recording
  };

  const [swarmRoles, setSwarmRoles] = useState({});
  const [swarmMissionStatus, setSwarmMissionStatus] = useState('Idle');
  const [collisionStatus, setCollisionStatus] = useState('Clear');

  const handleRoleChange = (droneId, newRole) => {
    setSwarmRoles(r => ({ ...r, [droneId]: newRole }));
  };

  const handleAssignRole = (droneId) => {
    // Demo: Just update local state
    setSwarmRoles(r => ({ ...r, [droneId]: r[droneId] || 'Scout' }));
  };

  const handleSwarmMission = () => {
    setSwarmMissionStatus('Executing...');
    setTimeout(() => setSwarmMissionStatus('Idle'), 2000);
  };

  useEffect(() => {
    // Demo: Random collision status
    const interval = setInterval(() => {
      setCollisionStatus(Math.random() < 0.9 ? 'Clear' : 'Warning: Potential Collision!');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      {/* Futuristic animated background grid */}
      <div style={{
        position:'fixed',
        top:0,
        left:0,
        width:'100vw',
        height:'100vh',
        zIndex:0,
        pointerEvents:'none',
        background:'linear-gradient(135deg, #0a192f 60%, #003c3c 100%)',
        overflow:'hidden',
      }}>
        {/* Moving grid */}
        <svg width="100%" height="100%" style={{position:'absolute',top:0,left:0,opacity:0.13}}>
          {[...Array(32)].map((_,i) => (
            <line key={i} x1={i*60} y1={0} x2={i*60} y2={2000} stroke="#00bcd4" strokeWidth="1" />
          ))}
          {[...Array(18)].map((_,i) => (
            <line key={i} x1={0} y1={i*60} x2={2000} y2={i*60} stroke="#00bcd4" strokeWidth="1" />
          ))}
        </svg>
        {/* Radar sweep overlay */}
        <svg width="100%" height="100%" style={{position:'absolute',top:0,left:0,opacity:0.09,animation:'radarSweep 8s linear infinite'}}>
          <circle cx="50%" cy="50%" r="600" fill="none" stroke="#00e676" strokeWidth="8" />
          <path d="M1000,540 A600,600 0 0,1 1400,940" fill="none" stroke="#00e676" strokeWidth="32" strokeLinecap="round" />
        </svg>
      </div>
      {/* Main dashboard grid with glassmorphism effect */}
      <div className="dashboard-grid" style={{
        position:'relative',
        zIndex:1,
        background:'rgba(20,32,44,0.72)',
        borderRadius:24,
        boxShadow:'0 8px 48px #00bcd455',
        backdropFilter:'blur(8px)',
        padding:'12px 0 0 0',
      }}>
        {/* System Status Panel */}
        <div className="dashboard-panel system-status-panel">
          <h3>System Status</h3>
          <div className="status-grid">
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
              <span className="status-label">Threat Level:</span>
              <span className="status-value" style={{ color: getThreatLevelColor(systemStatus.threatLevel) }}>
                {systemStatus.threatLevel}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Jamming:</span>
              <span className="status-value" style={{ color: systemStatus.jammingActive ? '#ff4444' : '#4CAF50' }}>
                {systemStatus.jammingActive ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Navigation:</span>
              <span className="status-value" style={{ color: navigationSystem === 'NavIC' ? '#00bcd4' : '#1976d2', fontWeight: 700 }}>
                {navigationSystem}
              </span>
            </div>
          </div>
          {navSwitchAlert && (
            <div style={{marginTop:12, background:'#fffde7', color:'#222', padding:'10px 18px', borderRadius:8, fontWeight:700, boxShadow:'0 2px 8px #0002'}}>
              {navSwitchAlert}
            </div>
          )}
          <button
            onClick={() => destroyDrone(1)}
            style={{marginTop:12, padding:'8px 16px', background:'#ff4444', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:12}}
          >
            Test: Destroy Prithvi-1
          </button>
        </div>

        {/* Navigation System Status Panel */}
        <div className="dashboard-panel navigation-panel" style={{ minWidth: 260, position: 'relative' }}>
          <h3>Navigation System Status</h3>
          {/* HUD Animation for GPS/NavIC Switch */}
          {showNavSwitchHUD && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(25, 118, 210, 0.92)',
              color: '#fff',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 16px #1976d2cc',
              animation: 'fadeInOut 3.2s',
              textAlign: 'center',
              pointerEvents: 'none',
              transition: 'all 0.3s',
            }}>
              <div style={{fontSize: 32, marginBottom: 12}}>🛰️</div>
              <div style={{fontSize: 22, marginBottom: 8}}>GPS Lost – Switching to <span style={{color:'#00bcd4'}}>NavIC</span></div>
              <div style={{fontSize: 15, marginBottom: 8, color:'#fffde7'}}>AI System: Battlefield jamming detected.<br/>Auto-switching to India's NavIC satellite navigation.</div>
              <div style={{fontSize: 15, marginTop: 10, color:'#fffde7', background:'#2228', padding:'6px 18px', borderRadius:8, letterSpacing:1}}>
                Updated Coordinates:<br/>
                <span style={{fontWeight:800, color:'#00e676'}}>Lat: {hudCoords.lat.toFixed(5)}, Lon: {hudCoords.lon.toFixed(5)}</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <span style={{ fontSize: 32 }}>
              {navigationSystem === 'NavIC' ? '🛰️' : '📡'}
            </span>
            <span style={{ fontWeight: 700, fontSize: 22, color: navigationSystem === 'NavIC' ? '#00bcd4' : '#1976d2' }}>
              {navigationSystem}
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Status:</b> {systemStatus.jammingActive ? 'GPS Blocked (Jamming Active)' : 'Active'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Last Switch:</b> {lastNavSwitch ? lastNavSwitch.toLocaleTimeString() : '—'}
          </div>
          <button
            onClick={() => setSystemStatus(s => ({ ...s, jammingActive: !s.jammingActive }))}
            style={{ marginTop: 10, padding: '8px 16px', background: systemStatus.jammingActive ? '#ff4444' : '#00bcd4', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
          >
            {systemStatus.jammingActive ? 'Simulate GPS Restored' : 'Simulate GPS Blocked'}
          </button>
        </div>

        {/* Drone Fleet Status */}
        <div className="dashboard-panel fleet-panel" style={{ position: 'relative' }}>
          <h3>Drone Fleet Status</h3>
          {/* Swarm Coordination HUD Animation */}
          {showSwarmHUD && swarmDrones.length > 1 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,44,44,0.92)',
              color: '#fff',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 16px #00bcd4cc',
              animation: 'fadeInOut 4s',
              textAlign: 'center',
              pointerEvents: 'none',
              transition: 'all 0.3s',
              overflow: 'hidden',
            }}>
              <div style={{fontSize: 32, marginBottom: 12, color:'#00bcd4', textShadow:'0 0 8px #00bcd4'}}>🛸🛸🛸</div>
              <div style={{fontSize: 22, marginBottom: 8, letterSpacing:1}}>AI Swarm Coordination: Synchronized Attack</div>
              {/* Birds-eye formation visualization */}
              <div style={{position:'relative', width:220, height:220, margin:'18px 0', background:'#003c3c', borderRadius:'50%', boxShadow:'0 0 24px #00bcd4aa', zIndex:2}}>
                {/* Target zone */}
                <div style={{position:'absolute', left:`${swarmTarget.x*180}px`, top:`${swarmTarget.y*180}px`, width:36, height:36, borderRadius:'50%', background:'rgba(255,68,68,0.18)', border:'3px solid #ff4444', boxShadow:'0 0 16px #ff4444aa', zIndex:3, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{fontSize:24, color:'#ff4444'}}>🎯</span>
                </div>
                {/* Drones and beams */}
                {swarmDrones.map((d, i) => {
                  const angle = (2 * Math.PI * i) / swarmDrones.length;
                  const cx = 110 + 80 * Math.cos(angle);
                  const cy = 110 + 80 * Math.sin(angle);
                  // Beam to target
                  return (
                    <React.Fragment key={d.id}>
                      <svg style={{position:'absolute', left:0, top:0, pointerEvents:'none', zIndex:2}} width={220} height={220}>
                        <line x1={cx} y1={cy} x2={swarmTarget.x*180+18} y2={swarmTarget.y*180+18} stroke="#00e676" strokeWidth="3" strokeDasharray="8 6" style={{filter:'drop-shadow(0 0 6px #00e676)'}} />
                      </svg>
                      <div style={{position:'absolute', left:cx-18, top:cy-18, width:36, height:36, borderRadius:'50%', background:'#00bcd4', border:'2.5px solid #fff', boxShadow:'0 0 12px #00bcd4aa', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:20, color:'#fff', zIndex:4, animation:'swarmPulse 1.2s infinite alternate'}}>
                        🛸
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <div style={{fontSize: 15, marginTop: 10, color:'#fffde7', background:'#2228', padding:'6px 18px', borderRadius:8, letterSpacing:1}}>
                Drones share intel, encircle the target, and execute a synchronized strike.
              </div>
            </div>
          )}
          <button onClick={simulateSwarmAttack} style={{marginBottom:8, background:'#00bcd4', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontWeight:700, cursor:'pointer', fontSize:15, position:'absolute', top:10, right:10, zIndex:10}}>Simulate Swarm Attack</button>
          {/* Kamikaze Strike HUD Animation */}
          {showKamikazeHUD && kamikazeDrone && kamikazeTarget && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(44,0,0,0.92)',
              color: '#fff',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 24px #ff4444cc',
              animation: 'fadeInOut 4.2s',
              textAlign: 'center',
              pointerEvents: 'none',
              transition: 'all 0.3s',
              overflow: 'hidden',
            }}>
              <div style={{fontSize: 32, marginBottom: 12, color:'#ff4444', textShadow:'0 0 8px #ff4444'}}>💥</div>
              <div style={{fontSize: 22, marginBottom: 8, letterSpacing:1}}>
                {kamikazePhase === 'lock' && `Locking High-Value Target...`}
                {kamikazePhase === 'confirm' && `Command Confirmed: Kamikaze Strike`}
                {kamikazePhase === 'dive' && `Diving at High Speed!`}
                {kamikazePhase === 'impact' && `IMPACT! Target Destroyed`}
              </div>
              {/* Kamikaze strike cam visualization */}
              <div style={{position:'relative', width:220, height:120, margin:'18px 0', background:'#220', borderRadius:18, boxShadow:'0 0 24px #ff4444aa', zIndex:2, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {/* Target tank */}
                <div style={{position:'absolute', left:160, top:40, width:44, height:44, borderRadius:'50%', background:'rgba(255,68,68,0.18)', border:'3px solid #ff4444', boxShadow:'0 0 16px #ff4444aa', zIndex:3, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{fontSize:28, color:'#ff4444'}}>🛡️</span>
                </div>
                {/* Drone icon, animates left to right */}
                <div style={{
                  position:'absolute',
                  left: kamikazePhase === 'lock' ? 20 : kamikazePhase === 'confirm' ? 40 : kamikazePhase === 'dive' ? 100 : 160,
                  top: 50,
                  width:36,
                  height:36,
                  borderRadius:'50%',
                  background:'#ff4444',
                  border:'2.5px solid #fff',
                  boxShadow:'0 0 12px #ff4444aa',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  fontWeight:900,
                  fontSize:20,
                  color:'#fff',
                  zIndex:4,
                  animation: kamikazePhase === 'dive' ? 'kamikazeDive 1s linear' : undefined,
                  transition:'left 0.7s cubic-bezier(.77,0,.18,1)',
                }}>
                  🛸
                </div>
                {/* Explosion effect on impact */}
                {kamikazePhase === 'impact' && (
                  <div style={{position:'absolute', left:160, top:40, width:44, height:44, borderRadius:'50%', background:'radial-gradient(circle, #fff 0%, #ff4444 60%, #220 100%)', boxShadow:'0 0 32px 12px #ff4444cc', zIndex:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, color:'#fff', animation:'kamikazeExplode 0.7s'}}>💥</div>
                )}
              </div>
              <div style={{fontSize: 15, marginTop: 10, color:'#fffde7', background:'#2228', padding:'6px 18px', borderRadius:8, letterSpacing:1}}>
                {kamikazePhase === 'lock' && `Drone ${kamikazeDrone.name} has locked onto enemy tank #${kamikazeTarget.id}.`}
                {kamikazePhase === 'confirm' && `Awaiting final command confirmation...`}
                {kamikazePhase === 'dive' && `Executing self-sacrificial strike at maximum velocity.`}
                {kamikazePhase === 'impact' && `Target zone neutralized. Drone lost in action.`}
              </div>
            </div>
          )}
          <button onClick={simulateKamikazeStrike} style={{marginBottom:8, background:'#ff4444', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontWeight:700, cursor:'pointer', fontSize:15, position:'absolute', top:54, right:10, zIndex:10}}>Simulate Kamikaze Strike</button>
          <div className="fleet-grid">
            {dronesWithHierarchy.map((drone, idx) => (
              <div 
                key={drone.id} 
                className={`fleet-item ${selectedDrone?.id === drone.id ? 'selected' : ''} ${drone.isHead ? 'head-drone' : ''} ${drone.isSuperHead ? 'super-head-drone' : ''} ${drone.isUltimateHead ? 'ultimate-head-drone' : ''}`}
                onClick={() => setSelectedDrone(drone)}
              >
                <div className="fleet-header">
                  <span className="fleet-name">{getCustomDroneName(drone, idx)}</span>
                  <span className="fleet-type">{drone.type}</span>
                  {drone.isSuperHead && <span style={{marginLeft:8, color:'#ffd600', fontWeight:700}} title="Super Head">★ Super Head</span>}
                  {!drone.isSuperHead && drone.isHead && <span style={{marginLeft:8, color:'#00bcd4', fontWeight:700}} title="Group Head">● Head</span>}
                  {drone.isUltimateHead && <span style={{marginLeft:8, color:'#ff4444', fontWeight:700}} title="Ultimate Head">★ Ultimate Head</span>}
                  {drone.isFriend && <span style={{marginLeft:8, color:'#2196f3', fontWeight:700}} title="Friend"><span style={{fontSize:18,marginRight:2}}>🛡️</span>Friend</span>}
                </div>
                <div style={{fontSize:12, color:'#90caf9', marginBottom:2}}>
                  Lat: {drone.latitude ? drone.latitude.toFixed(5) : '—'}, Lon: {drone.longitude ? drone.longitude.toFixed(5) : '—'}
                </div>
                <div className="fleet-stats">
                  <div className="fleet-stat">
                    <span className="stat-label">Battery:</span>
                    <span className="stat-value" style={{ color: getDroneStatusColor(drone) }}>
                      {drone.battery.toFixed(1)}%
                    </span>
                  </div>
                  <div className="fleet-stat">
                    <span className="stat-label">Altitude:</span>
                    <span className="stat-value">{drone.altitude.toFixed(0)}m</span>
                  </div>
                  <div className="fleet-stat">
                    <span className="stat-label">Speed:</span>
                    <span className="stat-value">{drone.speed.toFixed(1)} km/h</span>
                  </div>
                  <div className="fleet-stat">
                    <span className="stat-label">Threat:</span>
                    <span className="stat-value" style={{ color: getThreatLevelColor(drone.threatLevel) }}>
                      {drone.threatLevel}
                    </span>
                  </div>
                </div>
                <div className="fleet-location">{drone.location} | Group {drone.group}</div>
                <div style={{fontSize:13, color:'#2196f3', fontWeight:600, marginTop:2}}>IFF: {drone.iffCode}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drone Details Side Panel */}
        {selectedDrone && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 340,
            height: '100vh',
            background: '#222',
            color: '#fff',
            boxShadow: '-2px 0 16px #000a',
            zIndex: 100,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <button onClick={() => setSelectedDrone(null)} style={{position:'absolute',top:10,right:10,background:'none',color:'#fff',fontSize:22,border:'none',cursor:'pointer'}}>×</button>
            <h2 style={{marginBottom:0}}>{selectedDrone.name}</h2>
            <div style={{fontWeight:600, color:'#90caf9'}}>{selectedDrone.type}</div>
            <div>Group: <b>{selectedDrone.group}</b> {selectedDrone.isSuperHead ? <span style={{color:'#ffd600'}}>★ Super Head</span> : selectedDrone.isHead ? <span style={{color:'#00bcd4'}}>● Head</span> : null} {selectedDrone.isUltimateHead && <span style={{color:'#ff4444', marginLeft:8}}>★ Ultimate Head</span>} {selectedDrone.isFriend && <span style={{color:'#2196f3',marginLeft:8}}><span style={{fontSize:18,marginRight:2}}>🛡️</span>Friend</span>}</div>
            <div>IFF Code: <b style={{color:'#2196f3'}}>{selectedDrone.iffCode}</b></div>
            <div>Status: <b>{selectedDrone.status}</b></div>
            <div>Location: <b>{selectedDrone.location}</b></div>
            <div>Battery: <b>{selectedDrone.battery.toFixed(1)}%</b></div>
            <div>Altitude: <b>{selectedDrone.altitude.toFixed(0)} m</b></div>
            <div>Speed: <b>{selectedDrone.speed.toFixed(1)} km/h</b></div>
            <div>Threat Level: <b style={{color:getThreatLevelColor(selectedDrone.threatLevel)}}>{selectedDrone.threatLevel}</b></div>
            <button onClick={() => setFocusedDrone(selectedDrone)} style={{marginTop:18,padding:'10px 18px',background:'#1976d2',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,cursor:'pointer'}}>Focus on Map</button>
            {selectedDrone.status === 'Active' && (
              <button 
                onClick={() => destroyDrone(selectedDrone.id)} 
                style={{marginTop:8,padding:'10px 18px',background:'#ff4444',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,cursor:'pointer'}}
              >
                Destroy Drone
              </button>
            )}
          </div>
        )}

        {/* Active Alerts */}
        <div className="dashboard-panel alerts-panel">
          <h3>Active Alerts ({alerts.length})</h3>
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.severity.toLowerCase()}`}>
                <div className="alert-header">
                  <span className="alert-type">{alert.type}</span>
                  <span className="alert-severity">{alert.severity}</span>
                </div>
                <div className="alert-location">{alert.location}</div>
                <div className="alert-description">{alert.description}</div>
                <div className="alert-time">{alert.time}</div>
                <button 
                  className="destroy-button"
                  onClick={() => destroyTarget(alert.id)}
                >
                  Destroy Target
                </button>
              </div>
            ))}
          </div>
          {/* Threat Portal */}
          <ThreatPortal detections={detections} />
        </div>

        {/* Landmine Detection */}
        <div className="dashboard-panel landmine-panel">
          <h3>Landmine Detection</h3>
          <div className="landmine-status">
            <div className="landmine-count">
              Detected: {landmines.length} landmines
            </div>
            <button className="detect-button" onClick={() => setLandmines(prev => [...prev, { id: Date.now(), x: 65 + Math.random() * 35, y: 5 + Math.random() * 35, type: getRandomMineType() }])}>
              Scan for Landmines
            </button>
            <div style={{marginTop: '1rem', width: '100%'}}>
              {landmines.map(mine => (
                <div key={mine.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#222',borderRadius:6,padding:'0.5rem 1rem',marginBottom:8}}>
                  <span>
                    <b>Mine:</b> {mine.type}
                  </span>
                  <button style={{background:'#ff4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 0.8rem',fontWeight:700,cursor:'pointer'}} onClick={() => setLandmines(prev => prev.filter(l => l.id !== mine.id))}>
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Tank Detection */}
        <div className="dashboard-panel tank-panel">
          <h3>Tank Detection</h3>
          <div className="tank-status">
            <div className="tank-count">
              Detected: {tanks.length} tanks
            </div>
            <button className="detect-button" onClick={() => setTanks(prev => [...prev, { id: Date.now(), x: 65 + Math.random() * 35, y: 5 + Math.random() * 35 }])}>
              Scan for Tanks
            </button>
            <div style={{marginTop: '1rem', width: '100%'}}>
              {tanks.map(tank => (
                <div key={tank.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#222',borderRadius:6,padding:'0.5rem 1rem',marginBottom:8}}>
                  <span>Tank #{tank.id}</span>
                  <button style={{background:'#ff4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 0.8rem',fontWeight:700,cursor:'pointer'}} onClick={() => setTanks(prev => prev.filter(t => t.id !== tank.id))}>
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Aircraft Detection */}
        <div className="dashboard-panel aircraft-panel" style={{ position: 'relative' }}>
          <h3>Aircraft Detection</h3>
          {/* Thermal Targeting HUD Animation */}
          {showThermalHUD && thermalTarget && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.82)',
              color: '#fff',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 16px #ff9800cc',
              animation: 'fadeInOut 3.2s',
              textAlign: 'center',
              pointerEvents: 'none',
              transition: 'all 0.3s',
              overflow: 'hidden',
            }}>
              {/* Thermal vision effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 60%, #ff9800 0%, #ff5722 40%, #222 100%)',
                opacity: 0.45,
                zIndex: 1,
                pointerEvents: 'none',
              }} />
              {/* Targeting reticle */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                width: 120,
                height: 120,
                border: '3px solid #ffeb3b',
                borderRadius: '50%',
                boxShadow: '0 0 24px 6px #ff9800cc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                animation: 'targetPulse 1.2s infinite alternate',
              }}>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#ffeb3b',
                  boxShadow: '0 0 16px 4px #ff9800cc',
                  animation: 'targetLock 0.8s infinite alternate',
                }} />
              </div>
              <div style={{fontSize: 22, marginBottom: 8, color:'#ffeb3b', letterSpacing:1}}>HEAT SIGNATURE LOCKED</div>
              <div style={{fontSize: 15, marginBottom: 8, color:'#fffde7'}}>AI: {thermalTarget.type} engine detected.<br/>Pursuing and neutralizing target.</div>
              <div style={{fontSize: 15, marginTop: 10, color:'#00e676', background:'#2228', padding:'6px 18px', borderRadius:8, letterSpacing:1}}>
                Target Neutralized with Precision.
              </div>
            </div>
          )}
          <div className="aircraft-status">
            <div className="aircraft-count">
              Detected: {aircraft.length} aircraft
            </div>
            <button className="detect-button" onClick={() => setAircraft(prev => [...prev, { id: Date.now(), x: 65 + Math.random() * 35, y: 5 + Math.random() * 35 }])}>
              Scan for Aircraft
            </button>
            <div style={{marginTop: '1rem', width: '100%'}}>
              {aircraft.map(ac => (
                <div key={ac.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#222',borderRadius:6,padding:'0.5rem 1rem',marginBottom:8}}>
                  <span>Aircraft #{ac.id}</span>
                  <button style={{background:'#ff4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 0.8rem',fontWeight:700,cursor:'pointer'}} onClick={() => setAircraft(prev => prev.filter(a => a.id !== ac.id))}>
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Air Defense System Detection */}
        <div className="dashboard-panel airdefense-panel">
          <h3>Air Defense System Detection</h3>
          <div className="airdefense-status">
            <div className="airdefense-count">
              Detected: {airDefenses.length} systems
            </div>
            <button className="detect-button" onClick={detectAirDefense}>
              Scan for Air Defense
            </button>
            <div style={{marginTop: '1rem', width: '100%'}}>
              {airDefenses.map(ad => (
                <div key={ad.id || ad.x} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#222',borderRadius:6,padding:'0.5rem 1rem',marginBottom:8}}>
                  <span>Air Defense #{ad.id || ad.x}</span>
                  <button style={{background:'#ff4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 0.8rem',fontWeight:700,cursor:'pointer'}} onClick={() => setAirDefenses && setAirDefenses(prev => prev.filter(a => (a.id || a.x) !== (ad.id || ad.x)))}>
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Radar Detection */}
        <div className="dashboard-panel radar-panel" style={{ position: 'relative' }}>
          <h3>Radar Detection</h3>
          {/* Radar Smart Tagging HUD Animation */}
          {showRadarHUD && radarObjects.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,20,44,0.92)',
              color: '#fff',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 16px #00bcd4cc',
              animation: 'fadeInOut 3.2s',
              textAlign: 'center',
              pointerEvents: 'none',
              transition: 'all 0.3s',
              overflow: 'hidden',
            }}>
              <div style={{fontSize: 32, marginBottom: 12, color:'#00bcd4', textShadow:'0 0 8px #00bcd4'}}>📡</div>
              <div style={{fontSize: 22, marginBottom: 8, letterSpacing:1}}>AI Radar Scan: Tagging Airborne Objects</div>
              <div style={{
                display:'flex', flexWrap:'wrap', justifyContent:'center', gap:18, margin:'18px 0', width:'100%', zIndex:2
              }}>
                {radarObjects.map((obj, i) => (
                  <div key={obj.id || i} style={{
                    minWidth: 120,
                    minHeight: 60,
                    background: obj.tag === 'friendly' ? 'rgba(0,188,212,0.18)' : 'rgba(255,68,68,0.18)',
                    border: `2.5px solid ${obj.tag === 'friendly' ? '#00bcd4' : '#ff4444'}`,
                    borderRadius: 10,
                    padding: '10px 18px',
                    color: obj.tag === 'friendly' ? '#00bcd4' : '#ff4444',
                    fontWeight: 800,
                    fontSize: 18,
                    boxShadow: obj.tag === 'friendly' ? '0 0 12px #00bcd4aa' : '0 0 12px #ff4444aa',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    animation: obj.tag === 'friendly' ? 'tagPulseBlue 1.2s infinite alternate' : 'tagPulseRed 1.2s infinite alternate',
                    transition:'all 0.3s',
                  }}>
                    <span style={{fontSize:28}}>{obj.type === 'Missile' ? '🚀' : '✈️'}</span>
                    <span style={{marginTop:2}}>{obj.type} #{obj.id}</span>
                    <span style={{fontSize:13, marginTop:2, color:'#fffde7', fontWeight:600}}>
                      {obj.tag === 'friendly' ? 'FRIENDLY' : 'ENEMY'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{fontSize: 15, marginTop: 10, color:'#fffde7', background:'#2228', padding:'6px 18px', borderRadius:8, letterSpacing:1}}>
                Drone avoids friendly units and targets only confirmed enemies.
              </div>
            </div>
          )}
          <div className="radar-status">
            <div className="radar-count">
              Detected: {radars.length} radars
            </div>
            <button className="detect-button" onClick={detectRadar}>
              Scan for Radars
            </button>
            <div style={{marginTop: '1rem', width: '100%'}}>
              {radars.map(radar => (
                <div key={radar.id || radar.x} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#222',borderRadius:6,padding:'0.5rem 1rem',marginBottom:8}}>
                  <span>Radar #{radar.id || radar.x}</span>
                  <button style={{background:'#ff4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 0.8rem',fontWeight:700,cursor:'pointer'}} onClick={() => setRadars && setRadars(prev => prev.filter(r => (r.id || r.x) !== (radar.id || radar.x)))}>
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Missile Detection */}
        <div className="dashboard-panel missile-panel">
          <h3>Missile Detection</h3>
          <div className="missile-status">
            <div className="missile-count">
              Detected: {missiles.length} missiles
            </div>
            <button className="detect-button" onClick={detectMissile}>
              Scan for Missiles
            </button>
            <div style={{marginTop: '1rem', width: '100%'}}>
              {missiles.map(missile => (
                <div key={missile.id || missile.x} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#222',borderRadius:6,padding:'0.5rem 1rem',marginBottom:8}}>
                  <span>Missile #{missile.id || missile.x}</span>
                  <button style={{background:'#ff4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 0.8rem',fontWeight:700,cursor:'pointer'}} onClick={() => setMissiles && setMissiles(prev => prev.filter(m => (m.id || m.x) !== (missile.id || missile.x)))}>
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enemy Assets Jamming Portal */}
        <div className={`dashboard-panel enemy-jamming-panel${enemyJammingActive ? ' active' : ''}`} style={{ position: 'relative' }}>
          <h3>Enemy Assets Jamming</h3>
          {/* Anti-Jamming Protocol HUD Animation */}
          {showAntiJammingHUD && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(44,0,44,0.92)',
              color: '#fff',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 16px #d32f2fcc',
              animation: 'fadeInOut 3.2s',
              textAlign: 'center',
              pointerEvents: 'none',
              transition: 'all 0.3s',
            }}>
              <div style={{fontSize: 32, marginBottom: 12, color:'#ff4444', textShadow:'0 0 8px #ff4444'}}>⚠️</div>
              <div style={{fontSize: 22, marginBottom: 8, letterSpacing:1}}>Jamming Detected – Activating Anti-Jamming Protocol</div>
              <div style={{fontSize: 15, marginBottom: 8, color:'#fffde7'}}>AI: Enemy signal interference detected.<br/>Switching to encrypted fallback channels.</div>
              {/* Hacking/Encryption Visuals */}
              <div style={{margin:'16px 0', width:'90%', maxWidth:340, minHeight:38, background:'#111a', borderRadius:8, padding:'8px 0', display:'flex', justifyContent:'center', alignItems:'center', gap:8, overflow:'hidden'}}>
                <span style={{fontFamily:'monospace', color:'#00e676', fontSize:18, letterSpacing:2, animation:'flicker 1.2s infinite alternate'}}>ENCRYPTING...</span>
                <span style={{fontFamily:'monospace', color:'#00bcd4', fontSize:18, letterSpacing:2, animation:'flicker2 1.2s infinite alternate'}}>010101110101</span>
                <span style={{fontFamily:'monospace', color:'#ffd600', fontSize:18, letterSpacing:2, animation:'flicker3 1.2s infinite alternate'}}>SECURE LINK</span>
              </div>
              <div style={{fontSize: 15, marginTop: 10, color:'#00e676', background:'#2228', padding:'6px 18px', borderRadius:8, letterSpacing:1}}>
                Data rerouted through encrypted alternate channels.
              </div>
            </div>
          )}
          <div className="enemy-jamming-status" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', marginTop: '1.5rem'
          }}>
            <div className="enemy-jamming-indicator" style={{
              fontWeight: 700,
              color: enemyJammingActive ? '#ff4444' : '#00d4ff',
              fontSize: '1.2rem',
              background: enemyJammingActive ? '#2a1a1a' : '#181c24',
              borderRadius: 8,
              padding: '1rem 0.5rem',
              textAlign: 'center',
              marginBottom: '0.5rem',
              boxShadow: '0 2px 8px #0002',
              width: '100%'
            }}>
              {enemyJammingActive ? 'Jamming ACTIVE 🚨' : 'Jamming INACTIVE'}
            </div>
            <button
              className="jamming-toggle-button"
              style={{
                width: '100%',
                background: enemyJammingActive ? 'linear-gradient(90deg, #ff4444 0%, #ff8888 100%)' : 'linear-gradient(90deg, #00d4ff 0%, #009fff 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.1rem',
                border: 'none',
                borderRadius: 10,
                padding: '0.9rem 0',
                marginTop: '0.2rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002',
                transition: 'background 0.2s, transform 0.2s',
                outline: 'none',
              }}
              onClick={() => setEnemyJammingActive(j => !j)}
            >
              {enemyJammingActive ? 'Deactivate Jamming' : 'Activate Jamming'}
            </button>
            {enemyJammingActive && (
              <div style={{color:'#ff4444', fontWeight:600, marginTop:8, fontSize:15, textAlign:'center'}}>
                Enemy jamming is disrupting communications and navigation!
              </div>
            )}
            <div style={{width:'100%',marginTop:'1.5rem',borderTop:'1px solid #222',paddingTop:'1.2rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.7rem'}}>
                <span style={{fontWeight:600}}>Signal Jamming Near Enemy Zones</span>
                <span style={{color:zoneJammingActive ? '#ff4444' : '#00d4ff',fontWeight:700}}>
                  {zoneJammingActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <button
                className="jamming-toggle-button"
                style={{
                  width: '100%',
                  background: zoneJammingActive ? 'linear-gradient(90deg, #ff4444 0%, #ff8888 100%)' : 'linear-gradient(90deg, #00d4ff 0%, #009fff 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0.9rem 0',
                  marginTop: '0.2rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #0002',
                  transition: 'background 0.2s, transform 0.2s',
                  outline: 'none',
                }}
                onClick={() => setZoneJammingActive(z => !z)}
              >
                {zoneJammingActive ? 'Deactivate Zone Jamming' : 'Jam All Enemy Zones'}
              </button>
              {zoneJammingActive && (
                <div style={{color:'#ff4444', fontWeight:600, marginTop:8, fontSize:15, textAlign:'center'}}>
                  All wireless signals are being jammed near enemy bases!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leadership History Panel */}
        <div className="dashboard-panel leadership-panel">
          <h3>Leadership History</h3>
          <div style={{marginBottom: 12, padding: '8px 12px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: 6}}>
            <div style={{fontWeight: 700, color: '#ff4444', marginBottom: 4}}>
              Current Ultimate Head: {dronesWithHierarchy.find(d => d.isUltimateHead)?.name || 'None'}
            </div>
            <div style={{fontSize: 12, color: '#ccc'}}>
              Total Transfers: {leadershipHistory.length - 1}
            </div>
          </div>
          <div style={{maxHeight: 200, overflowY: 'auto'}}>
            {leadershipHistory.slice().reverse().map((entry, index) => (
              <div key={index} style={{
                padding: '8px 12px',
                marginBottom: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                fontSize: 12
              }}>
                <div style={{fontWeight: 600, color: '#fff', marginBottom: 2}}>
                  {entry.droneName}
                </div>
                <div style={{color: '#ccc', marginBottom: 2}}>
                  {entry.reason}
                </div>
                <div style={{color: '#888', fontSize: 10}}>
                  {entry.timestamp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency AI Reflex System Panel */}
        <div className="dashboard-panel emergency-reflex-panel" ref={emergencyPanelRef} style={{ position: 'relative' }}>
          <h3>Emergency AI Reflex System</h3>
          {/* Emergency Reflex HUD Animation */}
          {showEmergencyHUD && emergencyDrone && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(44,0,0,0.92)',
              color: '#fff',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 16px #ff4444cc',
              animation: 'fadeInOut 3.2s',
              textAlign: 'center',
              pointerEvents: 'none',
              transition: 'all 0.3s',
              overflow: 'hidden',
            }}>
              <div style={{fontSize: 32, marginBottom: 12, color:'#ff4444', textShadow:'0 0 8px #ff4444'}}>⚡</div>
              <div style={{fontSize: 22, marginBottom: 8, letterSpacing:1}}>EMERGENCY: Communication Lost</div>
              <div style={{fontSize: 15, marginBottom: 8, color:'#fffde7'}}>AI instantly assesses danger and executes protocol.</div>
              <div style={{margin:'16px 0', width:'90%', maxWidth:340, minHeight:38, background:'#111a', borderRadius:8, padding:'8px 0', display:'flex', justifyContent:'center', alignItems:'center', gap:8, overflow:'hidden'}}>
                <span style={{fontFamily:'monospace', color:'#ff4444', fontSize:18, letterSpacing:2, animation:'flicker 1.2s infinite alternate'}}>ACTION:</span>
                <span style={{fontFamily:'monospace', color:'#fffde7', fontSize:18, letterSpacing:2, animation:'flicker2 1.2s infinite alternate'}}>{emergencyAction}</span>
              </div>
              <div style={{fontSize: 15, marginTop: 10, color:'#00e676', background:'#2228', padding:'6px 18px', borderRadius:8, letterSpacing:1}}>
                Drone {emergencyDrone.name} autonomously {emergencyAction === 'RTB (Return To Base)' ? 'retreats to base' : emergencyAction === 'Emergency Landing' ? 'lands in a safe zone' : emergencyAction === 'Self-Destruct' ? 'self-destructs to avoid capture' : 'executes evasive maneuvers'}.
              </div>
            </div>
          )}
          <button onClick={simulateSuddenThreat} style={{marginBottom:8, background:'#ff4444', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontWeight:700, cursor:'pointer'}}>Simulate Sudden Threat</button>
          <div style={{maxHeight: 220, overflowY: 'auto', marginBottom: 10}}>
            {dronesWithHierarchy.map(drone => (
              <div key={drone.id} style={{
                background: drone.emergencyActive ? '#ff444420' : '#23272f',
                border: drone.emergencyActive ? '2px solid #ff4444' : '1px solid #333',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                animation: drone.emergencyActive ? 'pulse 1.2s infinite' : 'none',
                boxShadow: drone.emergencyActive ? '0 0 12px 2px #ff4444aa' : 'none'
              }}>
                <div style={{fontWeight:700, color: drone.emergencyActive ? '#ff4444' : '#fff'}}>{drone.name}</div>
                <div style={{fontSize:12, color:'#90caf9', marginBottom:2}}>
                  Lat: {drone.latitude ? drone.latitude.toFixed(5) : '—'}, Lon: {drone.longitude ? drone.longitude.toFixed(5) : '—'}
                </div>
                <div style={{fontSize:13, color:'#90caf9'}}>Status: {drone.status}</div>
                <div style={{fontSize:13}}>Emergency: <b style={{color:drone.emergencyActive?'#ff4444':'#4CAF50'}}>{drone.emergencyActive ? 'ACTIVE' : '—'}</b></div>
                <div style={{fontSize:13}}>Last Reflex: <b>{drone.lastReflexAction || '—'}</b></div>
                <div style={{fontSize:12, color:'#ccc'}}>Last Emergency: {drone.lastEmergencyTime ? new Date(drone.lastEmergencyTime).toLocaleString() : '—'}</div>
                <div style={{marginTop:4, display:'flex', alignItems:'center', gap:8}}>
                  <select disabled={drone.emergencyActive || drone.status !== 'Active'} style={{padding:'2px 6px', borderRadius:4}} id={`action-select-${drone.id}`}
                    defaultValue={drone.battery > 30 ? 'RTB (Return To Base)' : 'Self-Destruct'}>
                    <option>RTB (Return To Base)</option>
                    <option>Self-Destruct</option>
                    <option>Hold Position</option>
                    <option>Evasive Maneuver</option>
                  </select>
                  <button 
                    style={{padding:'4px 10px', background:'#ff4444', color:'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:13, cursor:'pointer', alignSelf:'flex-start'}}
                    onClick={() => triggerEmergencyReflex(drone.id, 'Manual Trigger', document.getElementById(`action-select-${drone.id}`).value)}
                    disabled={drone.emergencyActive || drone.status !== 'Active'}
                  >
                    Trigger Emergency
                  </button>
                </div>
              </div>
            ))}
          </div>
          <details style={{marginBottom:8}}>
            <summary style={{fontWeight:700, color:'#ff4444', cursor:'pointer'}}>Emergency History Log</summary>
            <div style={{maxHeight:120, overflowY:'auto', marginTop:6}}>
              {emergencyHistory.length === 0 && <div style={{color:'#888'}}>No emergencies yet.</div>}
              {emergencyHistory.map(ev => (
                <div key={ev.id} style={{fontSize:13, marginBottom:4, borderBottom:'1px solid #333', paddingBottom:2}}>
                  <b style={{color:'#ff4444'}}>{ev.droneName}</b> | <span>{ev.action}</span> | <span style={{color:'#90caf9'}}>{ev.reason}</span> <span style={{color:'#ccc', fontSize:11}}>({ev.time.toLocaleString()})</span>
                </div>
              ))}
            </div>
          </details>
          <div style={{fontSize:12, color:'#888'}}>If a sudden threat or comm failure occurs, drones will RTB, self-destruct, hold, or evade automatically or as selected.</div>
        </div>
        {/* Floating Emergency Alert Icon */}
        {anyEmergency && (
          <div onClick={() => emergencyPanelRef.current?.scrollIntoView({behavior:'smooth'})} style={{position:'fixed', bottom:100, right:36, zIndex:2000, background:'#ff4444', color:'#fff', borderRadius:'50%', width:56, height:56, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 24px #ff4444aa', cursor:'pointer', animation:'pulse 1.2s infinite'}} title="Emergency Active! Click to view">
            <span style={{fontSize:32, fontWeight:900}}>!</span>
          </div>
        )}

        {/* 3D Drone Simulation */}
        <div className="dashboard-panel simulation-panel">
          <h3>3D Drone Simulation</h3>
          <DroneSimulation3D />
        </div>
        {/* AI Detection Panel */}
        <div className="dashboard-panel ai-detection-panel">
          <h3>AI Detection</h3>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={loading || !selectedFile} style={{width:'100%'}}>
            {loading ? 'Detecting...' : 'Upload & Detect'}
          </button>
          {error && <div className="ai-error">{error}</div>}
          {detectionResult && (
            <div className="ai-result">
              <h4 style={{marginTop:0, color:'#00d4ff'}}>Detection Result:</h4>
              <pre style={{fontSize:13, background:'none', color:'#fff', padding:0, borderRadius:0, overflowX:'auto', margin:0}}>{JSON.stringify(detectionResult, null, 2)}</pre>
            </div>
          )}
        </div>
        {/* AI Predictive Enemy Behavior Panel */}
        <div className="dashboard-panel ai-predictive-enemy-panel">
          <h3>AI Predictive Enemy Behavior</h3>
          <button
            onClick={generateEnemyPredictions}
            disabled={predictionLoading}
            style={{
              marginBottom: 8,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontWeight: 700,
              cursor: predictionLoading ? 'not-allowed' : 'pointer',
              minWidth: 160
            }}>
            {predictionLoading ? (
              <span>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: 18,
                  height: 18,
                  border: '3px solid #fff',
                  borderTop: '3px solid #1976d2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: 8,
                  verticalAlign: 'middle'
                }} /> Predicting...
              </span>
            ) : 'Request New Prediction'}
          </button>
          <div style={{maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8}}>
            {enemyPredictions.length === 0 && <div style={{color:'#888'}}>No predictions yet.</div>}
            {enemyPredictions.map(pred => (
              <div key={pred.id}
                style={{
                  background: pred.investigated ? '#263238' : '#23272f',
                  border: pred.investigated ? '1.5px solid #4caf50' : '1.5px solid #1976d2',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: pred.justAdded ? '0 0 12px 2px #1976d2aa' : 'none',
                  animation: pred.justAdded ? 'pulse 1.2s 2' : 'none',
                  opacity: pred.investigated ? 0.7 : 1
                }}
                onMouseEnter={() => setFocusedDrone({latitude: pred.latitude, longitude: pred.longitude, name: pred.type})}
                onMouseLeave={() => setFocusedDrone(null)}
              >
                <span style={{fontSize: 24}}>
                  {pred.type === 'Patrol' && '🚶'}
                  {pred.type === 'Ambush' && '⚠️'}
                  {pred.type === 'Minefield' && '💣'}
                </span>
                <div style={{flex: 1}}>
                  <div style={{fontWeight:700, color:'#1976d2', fontSize: 16}}>{pred.type}</div>
                  <div style={{fontSize:13, color:'#90caf9'}}>Lat: {pred.latitude.toFixed(5)}, Lon: {pred.longitude.toFixed(5)}</div>
                  <div style={{fontSize:13, display:'flex', alignItems:'center', gap:6}}>
                    Confidence:
                    <div style={{
                      width: 60, height: 8, background: '#222', borderRadius: 4, overflow: 'hidden', display: 'inline-block'
                    }}>
                      <div style={{
                        width: `${pred.confidence}%`,
                        height: '100%',
                        background: pred.confidence > 85 ? '#4caf50' : pred.confidence > 75 ? '#ffaa00' : '#ff4444'
                      }} />
                    </div>
                    <b style={{color:'#ffaa00'}}>{pred.confidence}%</b>
                  </div>
                  <div style={{fontSize:12, color:'#ccc'}}>Predicted: {pred.time.toLocaleTimeString()}</div>
                </div>
                <button
                  style={{
                    background: pred.investigated ? '#4caf50' : '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    marginRight: 4
                  }}
                  onClick={() => {
                    setEnemyPredictions(prev => prev.map(p =>
                      p.id === pred.id ? {...p, investigated: !p.investigated} : p
                    ));
                  }}
                >
                  {pred.investigated ? 'Investigated' : 'Mark Investigated'}
                </button>
                <button
                  style={{
                    background: '#ff4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                  onClick={() => setEnemyPredictions(prev => prev.filter(p => p.id !== pred.id))}
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
          <div style={{fontSize:12, color:'#888', marginTop: 6}}>AI predicts likely enemy patrols, ambushes, or minefields using simulation data.</div>
        </div>
        {/* AI Long-Range Threat Detection Panel */}
        <div className="dashboard-panel long-range-threat-panel">
          <h3>AI Long-Range Threat Detection</h3>
          <button
            onClick={scanLongRangeThreats}
            disabled={longRangeLoading}
            style={{
              marginBottom: 8,
              background: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontWeight: 700,
              cursor: longRangeLoading ? 'not-allowed' : 'pointer',
              minWidth: 160
            }}>
            {longRangeLoading ? 'Scanning...' : 'Scan Wide Area'}
          </button>
          <div style={{maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8}}>
            {longRangeThreats.length === 0 && <div style={{color:'#888'}}>No threats detected yet.</div>}
            {longRangeThreats.map(threat => (
              <div key={threat.id}
                style={{
                  background: '#2d2323',
                  border: '1.5px solid #d32f2f',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
                onMouseEnter={() => setFocusedDrone({latitude: threat.latitude, longitude: threat.longitude, name: threat.type})}
                onMouseLeave={() => setFocusedDrone(null)}
              >
                <span style={{fontSize: 24}}>
                  {threat.type === 'Enemy Drone' && '🛸'}
                  {threat.type === 'Missile Launch' && '🚀'}
                  {threat.type === 'Armored Vehicle' && '🚚'}
                  {threat.type === 'Unknown' && '❓'}
                </span>
                <div style={{flex: 1}}>
                  <div style={{fontWeight:700, color:'#d32f2f', fontSize: 16}}>{threat.type}</div>
                  <div style={{fontSize:13, color:'#90caf9'}}>Lat: {threat.latitude.toFixed(5)}, Lon: {threat.longitude.toFixed(5)}</div>
                  <div style={{fontSize:13}}>Distance: <b style={{color:'#fffde7'}}>{threat.distance} km</b></div>
                  <div style={{fontSize:13, display:'flex', alignItems:'center', gap:6}}>
                    Confidence:
                    <div style={{
                      width: 60, height: 8, background: '#222', borderRadius: 4, overflow: 'hidden', display: 'inline-block'
                    }}>
                      <div style={{
                        width: `${threat.confidence}%`,
                        height: '100%',
                        background: threat.confidence > 85 ? '#4caf50' : threat.confidence > 75 ? '#ffaa00' : '#ff4444'
                      }} />
                    </div>
                    <b style={{color:'#ffaa00'}}>{threat.confidence}%</b>
                  </div>
                  <div style={{fontSize:12, color:'#ccc'}}>Detected: {threat.time.toLocaleTimeString()}</div>
                </div>
                <button
                  style={{
                    background: '#d32f2f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                  onClick={() => setFocusedDrone({latitude: threat.latitude, longitude: threat.longitude, name: threat.type})}
                >
                  Focus on Map
                </button>
              </div>
            ))}
          </div>
          <div style={{fontSize:12, color:'#888', marginTop: 6}}>AI scans a wide area and predicts distant threats with confidence and location.</div>
        </div>
      </div>
      {/* 3D Terrain Mapping Panel (replaced with global map) */}
      <div style={{ marginTop: 32, position: 'relative' }}>
        <h2 style={{ color: '#6cbb3c', marginBottom: 8 }}>Global Drone Map</h2>
        <ThreeDGlobePanel
          drones={dronesWithHierarchy}
          threats={[
            // Real threats from alerts (convert to lat/lon if possible, else use demo)
            ...((alerts || []).filter(alert => ['Threat', 'Intrusion', 'System', 'illegal', 'unauthorized'].includes(alert.type)).map((alert, i) => ({
              type: alert.type === 'Threat' ? 'Vehicle' : alert.type === 'Intrusion' ? 'Personnel' : 'Equipment',
              x: 77.2 + (i * 0.2), // Demo: spread out in longitude
              y: 28.6 + (i * 0.2), // Demo: spread out in latitude
              severity: alert.severity || 'Medium',
              description: alert.description || '',
            }))),
            ...landmines.map(l => ({ type: 'landmine', x: l.location?.lng || l.x, y: l.location?.lat || l.y })),
            ...tanks.map(t => ({ type: 'tank', x: t.x, y: t.y })),
            ...aircraft.map(a => ({ type: 'aircraft', x: a.x, y: a.y })),
            ...airDefenses.map(a => ({ type: 'airdefense', x: a.x, y: a.y })),
            ...radars.map(r => ({ type: 'radar', x: r.x, y: r.y })),
            ...missiles.map(m => ({ type: 'missile', x: m.x, y: m.y })),
            ...enemyPredictions.map(p => ({
              type: `predicted-${p.type.toLowerCase()}`,
              y: p.latitude,
              confidence: p.confidence
            })),
            ...longRangeThreats.map(t => ({
              type: `longrange-${t.type.toLowerCase().replace(/ /g, '-')}`,
              x: t.longitude,
              y: t.latitude,
              confidence: t.confidence,
              distance: t.distance
            }))
          ]}
          focusedDrone={focusedDrone}
          onMarkerClick={handleMapMarkerClick}
        />
      </div>
      {/* Operator/Command Log Panel */}
      <div className="dashboard-panel command-log-panel" style={{
        position:'fixed',
        bottom:24,
        left:24,
        width:340,
        maxHeight:320,
        background:'rgba(20,32,44,0.82)',
        borderRadius:16,
        boxShadow:'0 4px 24px #00bcd455',
        backdropFilter:'blur(8px)',
        zIndex:1001,
        overflow:'auto',
        padding:'12px 0 0 0',
        fontSize:14,
        color:'#fff',
        display:'flex',
        flexDirection:'column',
        gap:0
      }}>
        <div style={{fontWeight:800, color:'#00bcd4', fontSize:17, padding:'0 18px 6px 18px'}}>Operator / Command Log</div>
        <div style={{overflowY:'auto', maxHeight:260, padding:'0 18px'}}>
          {commandLog.map((log, i) => (
            <div key={i} style={{marginBottom:6, color:log.type==='system'?'#ffd600':log.type==='ai'?'#00e676':'#fff', fontWeight:log.type==='system'?700:log.type==='ai'?600:500}}>
              <span style={{fontSize:12, color:'#888', marginRight:8}}>[{log.time.toLocaleTimeString()}]</span>
              <span>{log.type==='operator'?<b>OP:</b>:log.type==='ai'?<b>AI:</b>:<b>SYSTEM:</b>} </span>
              {log.message}
            </div>
          ))}
        </div>
      </div>
      <div className="telemetry-dashboard" style={{marginBottom: 32}}>
        <h3>Live Drone Telemetry</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
        {props.drones.map(drone => {
          const t = telemetry[drone.name] || drone.telemetry || {};
          return (
            <div key={drone.id} className="telemetry-card" style={{border:'1px solid #00d4ff',borderRadius:8,padding:12,minWidth:220,background:'#101c28'}}>
              <div><b>{drone.name}</b></div>
              <div>GPS: {drone.location?.lat}, {drone.location?.lng}</div>
              <div>Altitude: {t.altitude} m</div>
              <div>Speed: {t.speed} km/h</div>
              <div>Battery: {t.battery}%</div>
              <div>Signal: {t.signal}%</div>
              <div>Heading: {t.heading}°</div>
              <div>Orientation: {t.orientation}</div>
              <div>Flight Mode: {t.mode}</div>
            </div>
          );
        })}
        </div>
      </div>
      {/* Drone Control & Command Panel */}
      <div className="drone-control-panel" style={{marginBottom: 32, background:'#181c24', borderRadius:12, padding:20, boxShadow:'0 2px 12px #00d4ff22'}}>
        <h3>Drone Control & Command Panel</h3>
        <div style={{marginBottom:12}}>
          <label>Select Drone: </label>
          <select value={selectedControlDrone?.id || ''} onChange={e => setSelectedControlDrone(props.drones.find(d => d.id === Number(e.target.value)))}>
            <option value="">-- Select --</option>
            {props.drones.map(drone => (
              <option key={drone.id} value={drone.id}>{drone.name}</option>
            ))}
          </select>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'takeoff')} disabled={!selectedControlDrone}>Takeoff</button>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'land')} disabled={!selectedControlDrone}>Land</button>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'hover')} disabled={!selectedControlDrone}>Hover</button>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'rth')} disabled={!selectedControlDrone}>Return to Home</button>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'arm')} disabled={!selectedControlDrone}>Arm</button>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'disarm')} disabled={!selectedControlDrone}>Disarm</button>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'override')} disabled={!selectedControlDrone}>Manual Override</button>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'kamikaze')} disabled={!selectedControlDrone}>Kamikaze Activation</button>
          <button onClick={() => sendDroneCommand(selectedControlDrone?.name, 'emergency_land')} disabled={!selectedControlDrone}>Emergency Land</button>
        </div>
      </div>
      {/* Live Video + Thermal Feed Viewer */}
      <div className="video-feed-panel" style={{marginBottom: 32, background:'#181c24', borderRadius:12, padding:20, boxShadow:'0 2px 12px #00d4ff22'}}>
        <h3>Live Video + Thermal Feed Viewer</h3>
        <div style={{marginBottom:12}}>
          <label>Select Drone: </label>
          <select value={selectedVideoDrone?.id || ''} onChange={e => setSelectedVideoDrone(props.drones.find(d => d.id === Number(e.target.value)))}>
            <option value="">-- Select --</option>
            {props.drones.map(drone => (
              <option key={drone.id} value={drone.id}>{drone.name}</option>
            ))}
          </select>
          <button style={{marginLeft:16}} onClick={() => setVideoMode('normal')} disabled={videoMode==='normal'}>Normal</button>
          <button style={{marginLeft:4}} onClick={() => setVideoMode('thermal')} disabled={videoMode==='thermal'}>Thermal</button>
        </div>
        {selectedVideoDrone ? (
          <div style={{display:'flex',alignItems:'center',gap:24}}>
            <video
              ref={videoRef}
              src={videoMode==='thermal' ? '/thermal_demo.mp4' : '/drone_video.mp4'}
              width={420}
              height={240}
              autoPlay
              loop
              muted
              style={{borderRadius:8,background:'#222',filter:videoMode==='thermal'?'grayscale(1) contrast(1.5) brightness(1.2) sepia(0.7) hue-rotate(180deg)':'none'}}
            />
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button onClick={handleScreenshot}>Screenshot</button>
              <button onClick={handleRecord}>{isRecording ? 'Stop Recording' : 'Record'}</button>
              <div style={{fontSize:13,color:'#00d4ff',marginTop:8}}>{isRecording ? 'Recording...' : ''}</div>
            </div>
          </div>
        ) : (
          <div style={{color:'#888',marginTop:12}}>Select a drone to view its live video feed.</div>
        )}
      </div>
      {/* Swarm Management Interface */}
      <div className="swarm-management-panel" style={{marginBottom: 32, background:'#181c24', borderRadius:12, padding:20, boxShadow:'0 2px 12px #00d4ff22'}}>
        <h3>Swarm Management Interface</h3>
        <div style={{marginBottom:12}}>
          <b>Collision Avoidance Status:</b> <span style={{color:collisionStatus==='Clear'?'#4CAF50':'#ff4444'}}>{collisionStatus}</span>
        </div>
        <table style={{width:'100%',marginBottom:16,background:'#101c28',borderRadius:8}}>
          <thead>
            <tr style={{color:'#00d4ff'}}>
              <th>Drone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Assign</th>
            </tr>
          </thead>
          <tbody>
            {props.drones.map(drone => (
              <tr key={drone.id} style={{color:'#fff'}}>
                <td>{drone.name}</td>
                <td>
                  <select value={swarmRoles[drone.id] || drone.role || 'Scout'} onChange={e => handleRoleChange(drone.id, e.target.value)}>
                    <option value="Leader">Leader</option>
                    <option value="Scout">Scout</option>
                    <option value="Attacker">Attacker</option>
                    <option value="Defender">Defender</option>
                    <option value="Support">Support</option>
                  </select>
                </td>
                <td>{drone.status}</td>
                <td><button onClick={() => handleAssignRole(drone.id)}>Assign</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleSwarmMission} style={{marginBottom:12}}>Send Synchronized Mission Command</button>
        <div style={{color:'#00d4ff',marginBottom:12}}>{swarmMissionStatus}</div>
        {/* Simple 2D Map (demo) -- REMOVED as per user request */}
        {/*
        <div style={{width:420,height:220,background:'#222',borderRadius:8,position:'relative',margin:'0 auto'}}>
          {props.drones.map((drone,i) => (
            <div key={drone.id} style={{position:'absolute',left:`${30+Math.sin(i/props.drones.length*2*Math.PI)*160}px`,top:`${100+Math.cos(i/props.drones.length*2*Math.PI)*80}px`,width:32,height:32,background:'#00d4ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,border:'2px solid #fff'}} title={drone.name}>
              {drone.name[0]}
            </div>
          ))}
        </div>
        */}
      </div>
    </div>
  );
};

export default DroneDashboard; 