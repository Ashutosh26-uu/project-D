import React, { useState, useEffect, useRef, useCallback } from 'react';

const SwarmVisualizerPortal = () => {
  // Enhanced state management
  const [swarmData, setSwarmData] = useState([]);
  const [activeTab, setActiveTab] = useState('visualization');
  const [swarmStrategy, setSwarmStrategy] = useState('Aggressive Search & Destroy');
  const [formations, setFormations] = useState('Diamond Formation');
  const [missionStatus, setMissionStatus] = useState('Active');
  const [isConnected, setIsConnected] = useState(true);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Interactive features
  const [selectedDrones, setSelectedDrones] = useState([]);
  const [draggedDrone, setDraggedDrone] = useState(null);
  const [hoveredDrone, setHoveredDrone] = useState(null);
  const [filterRole, setFilterRole] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map

  // Coordination controls
  const [selectedDrone, setSelectedDrone] = useState('');
  const [newRole, setNewRole] = useState('');
  const [swarmBehavior, setSwarmBehavior] = useState('');
  const [coordinationMessage, setCoordinationMessage] = useState('');
  const [quickActions, setQuickActions] = useState([]);

  // Real-time data with enhanced features
  const [decisions, setDecisions] = useState([]);
  const [communicationLog, setCommunicationLog] = useState([]);
  const [missionPlans, setMissionPlans] = useState([]);
  const [threatAnalysis, setThreatAnalysis] = useState({ level: 'Low', threats: [] });
  const [systemStats, setSystemStats] = useState({
    activeDrones: 8,
    batteryAverage: 85,
    missionProgress: 67,
    networkHealth: 92,
    responseTime: 45,
    dataTransfer: 2.3
  });

  // Enhanced responsive state
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [orientation, setOrientation] = useState('portrait');

  // Animation and interaction refs
  const updateIntervalRef = useRef(null);
  const autonomousIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const touchStartRef = useRef(null);

  // Enhanced responsive design handler with orientation detection
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setScreenSize({ width: newWidth, height: newHeight });
      setIsMobile(newWidth < 768);
      setIsTablet(newWidth >= 768 && newWidth < 1024);
      setOrientation(newWidth > newHeight ? 'landscape' : 'portrait');
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Enhanced swarm data initialization with more properties
  useEffect(() => {
    const initialSwarm = Array.from({ length: 8 }, (_, i) => ({
      id: `drone-${i + 1}`,
      name: `Prithvi-${i + 1}`,
      role: i === 0 ? 'Leader' : i < 3 ? 'Scout' : i < 6 ? 'Combat' : 'Support',
      status: Math.random() > 0.1 ? 'Active' : 'Standby',
      battery: Math.floor(Math.random() * 40) + 60,
      position: {
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 50 + 10
      },
      target: i < 2 ? `Target-${i + 1}` : null,
      lastDecision: generateRandomDecision(),
      communicationStrength: Math.floor(Math.random() * 30) + 70,
      missionProgress: Math.floor(Math.random() * 100),
      autonomousCapability: Math.random() > 0.3,
      threatLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      lastUpdate: new Date().toISOString(),
      speed: Math.floor(Math.random() * 50) + 20,
      altitude: Math.floor(Math.random() * 500) + 100,
      fuel: Math.floor(Math.random() * 30) + 70,
      temperature: Math.floor(Math.random() * 20) + 25,
      isSelected: false,
      animationPhase: Math.random() * Math.PI * 2
    }));

    setSwarmData(initialSwarm);

    // Enhanced sample decisions with more variety
    setDecisions([
      { id: 1, drone: 'Prithvi-1', decision: 'Engage target at coordinates (28.61, 77.20)', timestamp: new Date().toLocaleTimeString(), priority: 'High', autonomous: false, type: 'combat' },
      { id: 2, drone: 'Prithvi-2', decision: 'Patrol perimeter sector Alpha', timestamp: new Date().toLocaleTimeString(), priority: 'Medium', autonomous: false, type: 'patrol' },
      { id: 3, drone: 'Prithvi-3', decision: 'Establishing communication relay', timestamp: new Date().toLocaleTimeString(), priority: 'Low', autonomous: true, type: 'support' }
    ]);

    // Enhanced mission plans
    setMissionPlans([
      {
        id: 1,
        name: 'Perimeter Sweep Alpha',
        status: 'Active',
        priority: 'High',
        assignedDrones: ['Prithvi-1', 'Prithvi-2'],
        progress: 75,
        estimatedCompletion: new Date(Date.now() + 900000).toLocaleTimeString(),
        autonomous: false,
        type: 'reconnaissance'
      },
      {
        id: 2,
        name: 'Threat Assessment Beta',
        status: 'Planning',
        priority: 'Medium',
        assignedDrones: ['Prithvi-3', 'Prithvi-4'],
        progress: 25,
        estimatedCompletion: new Date(Date.now() + 1800000).toLocaleTimeString(),
        autonomous: false,
        type: 'analysis'
      }
    ]);

    // Initialize quick actions
    setQuickActions([
      { id: 1, name: 'Emergency RTB', icon: '🏠', action: 'return_to_base' },
      { id: 2, name: 'Formation Lock', icon: '🔒', action: 'lock_formation' },
      { id: 3, name: 'Silent Mode', icon: '🔇', action: 'silent_mode' },
      { id: 4, name: 'Boost Signal', icon: '📡', action: 'boost_signal' }
    ]);
  }, []);

  // Enhanced real-time updates with smooth animations
  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      // Smooth animation updates
      setSwarmData(prev => prev.map(drone => ({
        ...drone,
        position: {
          x: Math.max(0, Math.min(100, drone.position.x + (Math.random() - 0.5) * 2 * animationSpeed)),
          y: Math.max(0, Math.min(100, drone.position.y + (Math.random() - 0.5) * 2 * animationSpeed)),
          z: Math.max(10, Math.min(60, drone.position.z + (Math.random() - 0.5) * 1 * animationSpeed))
        },
        battery: Math.max(10, drone.battery - (Math.random() * 0.2)),
        missionProgress: Math.min(100, drone.missionProgress + Math.random() * 1),
        communicationStrength: Math.max(50, Math.min(100, drone.communicationStrength + (Math.random() - 0.5) * 5)),
        fuel: Math.max(20, drone.fuel - (Math.random() * 0.1)),
        temperature: Math.max(20, Math.min(50, drone.temperature + (Math.random() - 0.5) * 2)),
        lastUpdate: new Date().toISOString(),
        animationPhase: (drone.animationPhase + 0.1) % (Math.PI * 2)
      })));

      // Enhanced system stats with more metrics
      setSystemStats(prev => ({
        activeDrones: Math.floor(Math.random() * 2) + 7,
        batteryAverage: Math.max(70, Math.min(95, prev.batteryAverage + (Math.random() - 0.5) * 3)),
        missionProgress: Math.min(100, prev.missionProgress + Math.random() * 0.5),
        networkHealth: Math.max(80, Math.min(100, prev.networkHealth + (Math.random() - 0.5) * 2)),
        responseTime: Math.max(20, Math.min(100, prev.responseTime + (Math.random() - 0.5) * 10)),
        dataTransfer: Math.max(1, Math.min(5, prev.dataTransfer + (Math.random() - 0.5) * 0.5))
      }));

      // Add new decisions with enhanced variety
      if (Math.random() > 0.7) {
        const decisionTypes = ['combat', 'patrol', 'support', 'reconnaissance', 'emergency'];
        const newDecision = {
          id: Date.now(),
          drone: `Prithvi-${Math.floor(Math.random() * 8) + 1}`,
          decision: generateRandomDecision(),
          timestamp: new Date().toLocaleTimeString(),
          priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          autonomous: autonomousMode,
          type: decisionTypes[Math.floor(Math.random() * decisionTypes.length)]
        };

        setDecisions(prev => [newDecision, ...prev.slice(0, 19)]);
      }

      // Update mission progress with animations
      setMissionPlans(prev => prev.map(mission => ({
        ...mission,
        progress: Math.min(100, mission.progress + Math.random() * 2)
      })));

    }, autonomousMode ? 1000 : 2000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [autonomousMode, animationSpeed]);

  // Autonomous mode enhanced functionality with smoother transitions
  useEffect(() => {
    if (autonomousMode) {
      autonomousIntervalRef.current = setInterval(() => {
        // Auto-generate missions with enhanced logic
        if (Math.random() > 0.8) {
          generateMissionPlan();
        }

        // Auto-adjust formations based on threat level with smooth transitions
        if (Math.random() > 0.9) {
          const formations = ['Diamond Formation', 'V Formation', 'Line Formation', 'Circle Formation', 'Wedge Formation', 'Box Formation'];
          const newFormation = formations[Math.floor(Math.random() * formations.length)];
          executeFormationChange(newFormation);
        }

        // Enhanced threat analysis with real-time updates
        if (Math.random() > 0.85) {
          const threats = [
            'Enemy UAV detected at sector 7',
            'Signal jamming detected - switching to backup comms',
            'Unknown aircraft approaching from northeast',
            'Ground threat identified - hostile movement',
            'Radar lock detected - evasive maneuvers initiated',
            'Communication interference - boosting signal strength'
          ];
          setThreatAnalysis({
            level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            threats: [threats[Math.floor(Math.random() * threats.length)]],
            timestamp: new Date().toISOString(),
            severity: Math.floor(Math.random() * 10) + 1
          });
        }

        // Auto-optimize swarm behavior based on mission progress
        if (Math.random() > 0.95) {
          const behaviors = ['Aggressive Search & Destroy', 'Defensive Patrol', 'Stealth Reconnaissance', 'Area Denial'];
          const optimalBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
          setSwarmStrategy(optimalBehavior);

          const logEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            action: `AI optimized behavior: ${optimalBehavior}`,
            type: 'ai_optimization'
          };
          setCommunicationLog(prev => [logEntry, ...prev.slice(0, 19)]);
        }
      }, 3000);
    } else {
      if (autonomousIntervalRef.current) {
        clearInterval(autonomousIntervalRef.current);
      }
    }

    return () => {
      if (autonomousIntervalRef.current) {
        clearInterval(autonomousIntervalRef.current);
      }
    };
  }, [autonomousMode]);

  // Enhanced decision generation with more variety and context
  const generateRandomDecision = () => {
    const decisionCategories = {
      combat: [
        'Engage target at coordinates',
        'Execute flanking maneuver',
        'Provide cover support',
        'Deploy countermeasures',
        'Target acquired - requesting permission to engage'
      ],
      navigation: [
        'Patrol assigned sector',
        'Return to formation',
        'Switch to backup navigation',
        'Maintain overwatch position',
        'Adjusting altitude for optimal coverage'
      ],
      reconnaissance: [
        'Investigate anomaly',
        'Conduct reconnaissance sweep',
        'Scanning for threats',
        'Gathering intelligence data',
        'Visual confirmation required'
      ],
      support: [
        'Establish communication relay',
        'Initiate emergency protocol',
        'Providing tactical support',
        'Coordinating with ground units',
        'Monitoring allied positions'
      ]
    };

    const categories = Object.keys(decisionCategories);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const decisions = decisionCategories[selectedCategory];
    return decisions[Math.floor(Math.random() * decisions.length)];
  };

  // Enhanced drag and drop functionality
  const handleDragStart = useCallback((e, drone) => {
    setDraggedDrone(drone);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', drone.id);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, targetRole) => {
    e.preventDefault();
    if (draggedDrone) {
      setSwarmData(prev => prev.map(drone =>
        drone.id === draggedDrone.id ? { ...drone, role: targetRole } : drone
      ));

      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        action: `Drag & Drop: ${draggedDrone.name} → ${targetRole}`,
        type: 'drag_drop_assignment'
      };
      setCommunicationLog(prev => [logEntry, ...prev.slice(0, 19)]);
      setDraggedDrone(null);
    }
  }, [draggedDrone]);

  // Touch gesture handling for mobile devices
  const handleTouchStart = useCallback((e, drone) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      drone: drone,
      timestamp: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartRef.current) {
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };

      const distance = Math.sqrt(
        Math.pow(touchEnd.x - touchStartRef.current.x, 2) +
        Math.pow(touchEnd.y - touchStartRef.current.y, 2)
      );

      const duration = Date.now() - touchStartRef.current.timestamp;

      // Detect swipe gestures
      if (distance > 50 && duration < 500) {
        const deltaX = touchEnd.x - touchStartRef.current.x;
        const deltaY = touchEnd.y - touchStartRef.current.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            // Swipe right - next tab
            const tabs = ['visualization', 'coordination', 'planning', 'network'];
            const currentIndex = tabs.indexOf(activeTab);
            const nextIndex = (currentIndex + 1) % tabs.length;
            setActiveTab(tabs[nextIndex]);
          } else {
            // Swipe left - previous tab
            const tabs = ['visualization', 'coordination', 'planning', 'network'];
            const currentIndex = tabs.indexOf(activeTab);
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            setActiveTab(tabs[prevIndex]);
          }
        }
      }

      touchStartRef.current = null;
    }
  }, [activeTab]);

  // Enhanced role assignment with loading states and animations
  const handleRoleAssignment = async (e) => {
    e.preventDefault();
    if (!selectedDrone || !newRole) return;

    setIsLoading(true);

    // Simulate API call with realistic delay and progress
    const loadingSteps = ['Validating drone status...', 'Updating role assignment...', 'Synchronizing with swarm...', 'Complete!'];
    let stepIndex = 0;

    const loadingInterval = setInterval(() => {
      if (stepIndex < loadingSteps.length - 1) {
        setCoordinationMessage(loadingSteps[stepIndex]);
        stepIndex++;
      }
    }, 200);

    setTimeout(() => {
      clearInterval(loadingInterval);

      setSwarmData(prev => prev.map(drone =>
        drone.id === selectedDrone ? { ...drone, role: newRole, lastUpdate: new Date().toISOString() } : drone
      ));

      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        action: `Role changed: ${selectedDrone} → ${newRole}`,
        type: 'role_assignment',
        success: true
      };

      setCommunicationLog(prev => [logEntry, ...prev.slice(0, 19)]);
      setCoordinationMessage('✅ Role assigned successfully!');
      setTimeout(() => setCoordinationMessage(''), 3000);

      setSelectedDrone('');
      setNewRole('');
      setIsLoading(false);
    }, 800);
  };

  // Enhanced behavior change with smooth transitions
  const handleBehaviorChange = async (e) => {
    e.preventDefault();
    if (!swarmBehavior) return;

    setIsLoading(true);

    // Animate behavior transition
    setTimeout(() => {
      setSwarmStrategy(swarmBehavior);

      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        action: `Swarm behavior updated: ${swarmBehavior}`,
        type: 'behavior_change',
        impact: 'All active drones'
      };

      setCommunicationLog(prev => [logEntry, ...prev.slice(0, 19)]);
      setCoordinationMessage('🎯 Swarm behavior updated successfully!');
      setTimeout(() => setCoordinationMessage(''), 3000);

      setSwarmBehavior('');
      setIsLoading(false);
    }, 600);
  };

  // Enhanced formation change with visual feedback
  const executeFormationChange = (formation) => {
    setFormations(formation);

    // Update drone positions based on formation
    setSwarmData(prev => prev.map((drone, index) => {
      let newPosition = { ...drone.position };

      switch (formation) {
        case 'Diamond Formation':
          newPosition = {
            x: 50 + (index % 2 === 0 ? 20 : -20),
            y: 50 + (index * 10 - 35),
            z: drone.position.z
          };
          break;
        case 'V Formation':
          newPosition = {
            x: 50 + (index % 2 === 0 ? index * 5 : -index * 5),
            y: 30 + index * 8,
            z: drone.position.z
          };
          break;
        case 'Line Formation':
          newPosition = {
            x: 20 + index * 10,
            y: 50,
            z: drone.position.z
          };
          break;
        case 'Circle Formation':
          const angle = (index / prev.length) * 2 * Math.PI;
          newPosition = {
            x: 50 + 25 * Math.cos(angle),
            y: 50 + 25 * Math.sin(angle),
            z: drone.position.z
          };
          break;
        default:
          break;
      }

      return { ...drone, position: newPosition, lastUpdate: new Date().toISOString() };
    }));

    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      action: `Formation changed to: ${formation}`,
      type: 'formation_change',
      participants: swarmData.length
    };
    setCommunicationLog(prev => [logEntry, ...prev.slice(0, 19)]);
  };

  // Enhanced autonomous mode toggle with system-wide effects
  const toggleAutonomousMode = () => {
    const newMode = !autonomousMode;
    setAutonomousMode(newMode);

    // Update all drones to reflect autonomous capability
    setSwarmData(prev => prev.map(drone => ({
      ...drone,
      autonomousCapability: newMode ? true : drone.autonomousCapability,
      lastUpdate: new Date().toISOString()
    })));

    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      action: `Autonomous mode ${newMode ? 'ENABLED' : 'DISABLED'}`,
      type: 'autonomous_toggle',
      impact: 'System-wide'
    };
    setCommunicationLog(prev => [logEntry, ...prev.slice(0, 19)]);
    setCoordinationMessage(`🤖 Autonomous mode ${newMode ? 'enabled' : 'disabled'}!`);
    setTimeout(() => setCoordinationMessage(''), 3000);
  };

  // Enhanced mission generation with AI-driven logic
  const generateMissionPlan = () => {
    const missionTypes = [
      { name: 'Reconnaissance', priority: 'Medium', duration: 1800000, complexity: 'Low' },
      { name: 'Patrol', priority: 'Low', duration: 3600000, complexity: 'Low' },
      { name: 'Search & Destroy', priority: 'High', duration: 2400000, complexity: 'High' },
      { name: 'Escort', priority: 'Medium', duration: 1200000, complexity: 'Medium' },
      { name: 'Surveillance', priority: 'Medium', duration: 5400000, complexity: 'Medium' },
      { name: 'Area Denial', priority: 'High', duration: 1800000, complexity: 'High' },
      { name: 'Emergency Response', priority: 'High', duration: 900000, complexity: 'High' },
      { name: 'Supply Drop', priority: 'Low', duration: 600000, complexity: 'Low' }
    ];

    const selectedMission = missionTypes[Math.floor(Math.random() * missionTypes.length)];
    const availableDrones = swarmData.filter(d => d.status === 'Active' && d.battery > 30);
    const requiredDrones = Math.min(availableDrones.length, Math.floor(Math.random() * 4) + 2);
    const assignedDrones = availableDrones.slice(0, requiredDrones);

    const newPlan = {
      id: Date.now(),
      name: `${selectedMission.name} Mission ${Math.floor(Math.random() * 1000)}`,
      status: autonomousMode ? 'Active' : 'Planning',
      priority: selectedMission.priority,
      assignedDrones: assignedDrones.map(d => d.name),
      progress: autonomousMode ? Math.floor(Math.random() * 20) : 0,
      estimatedCompletion: new Date(Date.now() + selectedMission.duration).toLocaleTimeString(),
      autonomous: autonomousMode,
      type: selectedMission.name.toLowerCase().replace(' ', '_'),
      complexity: selectedMission.complexity,
      resourcesRequired: requiredDrones
    };

    setMissionPlans(prev => [newPlan, ...prev.slice(0, 9)]);

    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      action: `New mission planned: ${newPlan.name}`,
      type: 'mission_planning',
      drones: assignedDrones.length,
      priority: selectedMission.priority
    };
    setCommunicationLog(prev => [logEntry, ...prev.slice(0, 19)]);
  };

  // Enhanced quick action handler
  const handleQuickAction = useCallback((action) => {
    setIsLoading(true);

    const actionMap = {
      'return_to_base': () => {
        setSwarmData(prev => prev.map(drone => ({
          ...drone,
          status: 'Returning',
          target: 'Base',
          lastUpdate: new Date().toISOString()
        })));
        return 'All drones returning to base';
      },
      'lock_formation': () => {
        setSwarmData(prev => prev.map(drone => ({
          ...drone,
          formationLocked: true,
          lastUpdate: new Date().toISOString()
        })));
        return 'Formation locked - maintaining positions';
      },
      'silent_mode': () => {
        setSwarmData(prev => prev.map(drone => ({
          ...drone,
          communicationStrength: Math.max(10, drone.communicationStrength - 50),
          silentMode: true,
          lastUpdate: new Date().toISOString()
        })));
        return 'Silent mode activated - reduced emissions';
      },
      'boost_signal': () => {
        setSwarmData(prev => prev.map(drone => ({
          ...drone,
          communicationStrength: Math.min(100, drone.communicationStrength + 30),
          lastUpdate: new Date().toISOString()
        })));
        return 'Signal strength boosted - enhanced communication';
      }
    };

    setTimeout(() => {
      const result = actionMap[action]?.() || 'Action completed';

      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        action: result,
        type: 'quick_action'
      };
      setCommunicationLog(prev => [logEntry, ...prev.slice(0, 19)]);
      setCoordinationMessage(`⚡ ${result}`);
      setTimeout(() => setCoordinationMessage(''), 3000);
      setIsLoading(false);
    }, 500);
  }, []);

  // Enhanced filtering and sorting
  const getFilteredAndSortedDrones = useCallback(() => {
    let filtered = swarmData;

    if (filterRole !== 'All') {
      filtered = filtered.filter(drone => drone.role === filterRole);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'battery':
          return b.battery - a.battery;
        case 'role':
          return a.role.localeCompare(b.role);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [swarmData, filterRole, sortBy]);

  // Utility functions with enhanced features
  const getRoleColor = (role) => {
    const colors = {
      'Leader': '#ffd700',
      'Scout': '#00ff88',
      'Combat': '#ff4444',
      'Support': '#00aaff',
      'Stealth': '#aa44ff',
      'Reconnaissance': '#ff8800',
      'Guardian': '#44ff44'
    };
    return colors[role] || '#ffffff';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#00aa44',
      'Standby': '#aa6600',
      'Returning': '#0088cc',
      'Emergency': '#ff4444',
      'Maintenance': '#aa44aa',
      'Offline': '#666666'
    };
    return colors[status] || '#666';
  };

  const getThreatColor = (level) => {
    const colors = {
      'Low': '#00aa44',
      'Medium': '#ffaa00',
      'High': '#ff4444',
      'Critical': '#ff0000'
    };
    return colors[level] || '#666';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#00aa44',
      'Medium': '#ffaa00',
      'High': '#ff4444',
      'Critical': '#ff0000',
      'Emergency': '#ff0066'
    };
    return colors[priority] || '#666';
  };

  const getBatteryColor = (battery) => {
    if (battery > 70) return '#00aa44';
    if (battery > 40) return '#ffaa00';
    if (battery > 20) return '#ff6600';
    return '#ff4444';
  };

  const getSignalStrengthBars = (strength) => {
    const bars = Math.ceil(strength / 25);
    return '📶'.repeat(Math.max(1, Math.min(4, bars)));
  };

  // Enhanced responsive grid calculations
  const getGridColumns = () => {
    if (isMobile && orientation === 'portrait') return '1fr';
    if (isMobile && orientation === 'landscape') return '1fr 1fr';
    if (isTablet) return 'repeat(auto-fit, minmax(200px, 1fr))';
    if (screenSize.width < 1200) return 'repeat(auto-fit, minmax(250px, 1fr))';
    return 'repeat(auto-fit, minmax(300px, 1fr))';
  };

  const getTabGridColumns = () => {
    if (isMobile) return '1fr';
    if (isTablet) return '1fr 1fr';
    return '1fr 1fr 1fr';
  };

  const getDroneGridColumns = () => {
    if (isMobile && orientation === 'portrait') return '1fr';
    if (isMobile && orientation === 'landscape') return '1fr 1fr';
    if (isTablet) return 'repeat(auto-fit, minmax(150px, 1fr))';
    return 'repeat(auto-fit, minmax(180px, 1fr))';
  };

  // Advanced animation utilities
  const getAnimatedStyle = (drone) => {
    const pulse = Math.sin(drone.animationPhase) * 0.1 + 1;
    const glow = drone.status === 'Active' ? `0 0 ${10 * pulse}px ${getRoleColor(drone.role)}40` : 'none';

    return {
      transform: `scale(${pulse})`,
      boxShadow: glow,
      transition: 'all 0.3s ease-in-out'
    };
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      'Active': '🟢',
      'Standby': '🟡',
      'Returning': '🔵',
      'Emergency': '🔴',
      'Maintenance': '🟣',
      'Offline': '⚫'
    };
    return indicators[status] || '⚪';
  };

  const getMissionTypeIcon = (type) => {
    const icons = {
      'reconnaissance': '🔍',
      'patrol': '👁️',
      'search_destroy': '🎯',
      'escort': '🛡️',
      'surveillance': '📡',
      'area_denial': '🚫',
      'emergency_response': '🚨',
      'supply_drop': '📦'
    };
    return icons[type] || '📋';
  };

  return (
    <div
      style={{
        padding: isMobile ? '10px' : '20px',
        // backgroundColor: '#0a0a1a',
        // minHeight: '100vh',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Enhanced Header with System Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        
        <div>
          <h1 style={{
            color: '#00d4ff',
            margin: '10px 0px',
            fontSize: isMobile ? '20px' : '28px',
            textShadow: '0 0 10px #00d4ff40',
            alighnItems: 'center',
          }}>
            Swarm Coordination Portal
          </h1>
          <div style={{
            color: '#00ff88',
            fontSize: isMobile ? '12px' : '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <span>🔗 {isConnected ? 'Connected' : 'Disconnected'}</span>
            <span>🤖 {autonomousMode ? 'Autonomous' : 'Manual'}</span>
            {/* <span>📱 {screenSize.width}x{screenSize.height} ({orientation})</span> */}
            <span>⚡ Speed: {animationSpeed}x</span>
          </div>
        </div>

        {/* System Controls */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Animation Speed Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px', color: '#aaa' }}>Speed:</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              style={{
                width: '60px',
                accentColor: '#00aaff'
              }}
            />
          </div>

          {/* Autonomous Mode Toggle */}
          <button
            onClick={toggleAutonomousMode}
            style={{
              padding: isMobile ? '8px 12px' : '10px 15px',
              backgroundColor: autonomousMode ? '#00aa44' : '#aa4400',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold',
              boxShadow: autonomousMode ? '0 0 15px #00aa4460' : '0 0 15px #aa440060',
              transition: 'all 0.3s ease'
            }}
          >
            🤖 {autonomousMode ? 'AUTO ON' : 'AUTO OFF'}
          </button>

          {/* View Mode Toggle */}
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
            <option value="grid">📊 Grid</option>
            <option value="list">📋 List</option>
            <option value="map">🗺️ Map</option>
          </select>
        </div>
      </div>

      {/* Enhanced System Stats Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: getGridColumns(),
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          backgroundColor: '#16213e',
          padding: '15px',
          borderRadius: '12px',
          border: '2px solid #0f3460',
          background: 'linear-gradient(135deg, #16213e 0%, #1a2650 100%)',
          boxShadow: '0 4px 15px rgba(0, 212, 255, 0.1)'
        }}>
          <h3 style={{ color: '#00d4ff', margin: '0 0 10px 0', fontSize: '14px' }}>
            📊 System Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00ff88', fontSize: '18px', fontWeight: 'bold' }}>
                {systemStats.activeDrones}
              </div>
              <div style={{ color: '#aaa', fontSize: '10px' }}>Active Drones</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: getBatteryColor(systemStats.batteryAverage), fontSize: '18px', fontWeight: 'bold' }}>
                {systemStats.batteryAverage.toFixed(1)}%
              </div>
              <div style={{ color: '#aaa', fontSize: '10px' }}>Avg Battery</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00aaff', fontSize: '18px', fontWeight: 'bold' }}>
                {systemStats.missionProgress.toFixed(1)}%
              </div>
              <div style={{ color: '#aaa', fontSize: '10px' }}>Mission Progress</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ffaa00', fontSize: '18px', fontWeight: 'bold' }}>
                {systemStats.networkHealth.toFixed(0)}%
              </div>
              <div style={{ color: '#aaa', fontSize: '10px' }}>Network Health</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ff6600', fontSize: '18px', fontWeight: 'bold' }}>
                {systemStats.responseTime.toFixed(0)}ms
              </div>
              <div style={{ color: '#aaa', fontSize: '10px' }}>Response Time</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#aa44ff', fontSize: '18px', fontWeight: 'bold' }}>
                {systemStats.dataTransfer.toFixed(1)} MB/s
              </div>
              <div style={{ color: '#aaa', fontSize: '10px' }}>Data Transfer</div>
            </div>
          </div>
        </div>

        {/* Enhanced Threat Analysis */}
        <div style={{
          backgroundColor: '#16213e',
          padding: '15px',
          borderRadius: '12px',
          border: `2px solid ${getThreatColor(threatAnalysis.level)}`,
          background: `linear-gradient(135deg, #16213e 0%, ${getThreatColor(threatAnalysis.level)}20 100%)`,
          boxShadow: `0 4px 15px ${getThreatColor(threatAnalysis.level)}30`
        }}>
          <h3 style={{ color: '#00d4ff', margin: '0 0 10px 0', fontSize: '14px' }}>
            ⚠️ Threat Analysis
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{
              color: getThreatColor(threatAnalysis.level),
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {threatAnalysis.level} Risk
            </span>
            {threatAnalysis.level === 'High' && (
              <div style={{
                animation: 'blink 1s infinite',
                color: '#ff4444',
                fontSize: '20px'
              }}>
                🚨
              </div>
            )}
          </div>
          <div style={{ color: '#aaa', fontSize: '12px', lineHeight: '1.4' }}>
            {threatAnalysis.threats?.length > 0 ? (
              threatAnalysis.threats.map((threat, i) => (
                <div key={i} style={{ marginBottom: '5px' }}>
                  🔸 {threat}
                </div>
              ))
            ) : (
              <div>No active threats detected</div>
            )}
          </div>
          {threatAnalysis.severity && (
            <div style={{
              marginTop: '10px',
              backgroundColor: '#0a1a2a',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '11px'
            }}>
              Severity Level: {threatAnalysis.severity}/10
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div style={{
          backgroundColor: '#16213e',
          padding: '15px',
          borderRadius: '12px',
          border: '2px solid #0f3460',
          background: 'linear-gradient(135deg, #16213e 0%, #2a1650 100%)'
        }}>
          <h3 style={{ color: '#00d4ff', margin: '0 0 10px 0', fontSize: '14px' }}>
            ⚡ Quick Actions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
            gap: '8px'
          }}>
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.action)}
                disabled={isLoading}
                style={{
                  padding: '8px',
                  backgroundColor: isLoading ? '#333' : '#2a2a4e',
                  color: isLoading ? '#666' : '#eee',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  transform: isLoading ? 'scale(0.95)' : 'scale(1)'
                }}
              >
                <span style={{ fontSize: '12px' }}>{action.icon}</span>
                <span>{action.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation with Swipe Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: '#16213e',
        padding: '10px',
        borderRadius: '12px',
        border: '2px solid #0f3460',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Swipe Indicator for Mobile */}
        {isMobile && (
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#666',
            fontSize: '8px'
          }}>
            ← Swipe to navigate →
          </div>
        )}

        {['visualization', 'coordination', 'planning', 'network'].map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: isMobile ? '8px 12px' : '12px 20px',
              backgroundColor: activeTab === tab ? '#00aa44' : 'transparent',
              color: activeTab === tab ? '#ffffff' : '#aaa',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              transition: 'all 0.3s ease',
              position: 'relative',
              minWidth: isMobile ? '60px' : '80px',
              textAlign: 'center',
              boxShadow: activeTab === tab ? '0 0 15px #00aa4460' : 'none'
            }}
          >
            {isMobile ? (
              <>
                <div style={{ fontSize: '14px', marginBottom: '2px' }}>
                  {tab === 'visualization' && '📊'}
                  {tab === 'coordination' && '🎯'}
                  {tab === 'planning' && '📋'}
                  {tab === 'network' && '🔗'}
                </div>
                <div style={{ fontSize: '8px' }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1, 4)}
                </div>
              </>
            ) : (
              <>
                {tab === 'visualization' && '📊 Visualization'}
                {tab === 'coordination' && '🎯 Coordination'}
                {tab === 'planning' && '📋 Planning'}
                {tab === 'network' && '🔗 Network'}
              </>
            )}

            {/* Active Tab Indicator */}
            {activeTab === tab && (
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '3px',
                backgroundColor: '#00aa44',
                borderRadius: '2px'
              }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SwarmVisualizerPortal;