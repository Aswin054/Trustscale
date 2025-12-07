import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Cylinder, Sphere } from '@react-three/drei';
import { X, Activity, Play, RotateCcw, AlertTriangle, Volume2 } from 'lucide-react';
import * as THREE from 'three';

// LED Segment Display Component for showing fuel amount
const LEDDigit = ({ value, position }) => {
  const segments = {
    0: [1, 1, 1, 1, 1, 1, 0],
    1: [0, 1, 1, 0, 0, 0, 0],
    2: [1, 1, 0, 1, 1, 0, 1],
    3: [1, 1, 1, 1, 0, 0, 1],
    4: [0, 1, 1, 0, 0, 1, 1],
    5: [1, 0, 1, 1, 0, 1, 1],
    6: [1, 0, 1, 1, 1, 1, 1],
    7: [1, 1, 1, 0, 0, 0, 0],
    8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1],
  };

  const digit = Math.floor(value) % 10;
  const pattern = segments[digit];

  const segmentPositions = [
    [0, 0.15, 0], // top
    [0.08, 0.08, 0], // top-right
    [0.08, -0.08, 0], // bottom-right
    [0, -0.15, 0], // bottom
    [-0.08, -0.08, 0], // bottom-left
    [-0.08, 0.08, 0], // top-left
    [0, 0, 0], // middle
  ];

  const segmentRotations = [
    [0, 0, 0], // top horizontal
    [0, 0, Math.PI / 2], // top-right vertical
    [0, 0, Math.PI / 2], // bottom-right vertical
    [0, 0, 0], // bottom horizontal
    [0, 0, Math.PI / 2], // bottom-left vertical
    [0, 0, Math.PI / 2], // top-left vertical
    [0, 0, 0], // middle horizontal
  ];

  return (
    <group position={position}>
      {pattern.map((isOn, i) => (
        <Box
          key={i}
          args={i % 3 === 1 || i % 3 === 2 ? [0.02, 0.12, 0.01] : [0.12, 0.02, 0.01]}
          position={segmentPositions[i]}
          rotation={segmentRotations[i]}
        >
          <meshStandardMaterial
            color={isOn ? '#FF0000' : '#1a0000'}
            emissive={isOn ? '#FF0000' : '#000000'}
            emissiveIntensity={isOn ? 1.5 : 0}
          />
        </Box>
      ))}
    </group>
  );
};

// LED Display Panel
const LEDDisplay = ({ value }) => {
  const liters = Math.floor(value * 10) / 10;
  const digits = liters.toFixed(1).replace('.', '').split('').map(Number);
  
  return (
    <group position={[0, 0.8, 0.53]}>
      {/* Display Background */}
      <Box args={[1.4, 0.6, 0.02]} position={[0, 0, -0.01]}>
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} />
      </Box>
      
      {/* LED Digits */}
      <LEDDigit value={digits[0] || 0} position={[-0.35, 0, 0]} />
      <LEDDigit value={digits[1] || 0} position={[-0.15, 0, 0]} />
      
      {/* Decimal Point */}
      <Sphere args={[0.02, 16, 16]} position={[0, -0.1, 0]}>
        <meshStandardMaterial
          color="#FF0000"
          emissive="#FF0000"
          emissiveIntensity={1.5}
        />
      </Sphere>
      
      <LEDDigit value={digits[2] || 0} position={[0.15, 0, 0]} />
      
      {/* Unit Label */}
      <Text
        position={[0.45, 0, 0]}
        fontSize={0.08}
        color="#00FF00"
        anchorX="center"
        anchorY="middle"
      >
        L
      </Text>
    </group>
  );
};

// Enhanced Dispenser Body with more realistic details
const DispenserBody = ({ fuelAmount, isDispensing, alertActive }) => {
  const groupRef = useRef();
  const alertLightRef = useRef();

  useFrame((state) => {
    if (alertLightRef.current && alertActive) {
      alertLightRef.current.intensity = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Body - Premium Green with Chrome accents */}
      <Box args={[2, 4, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2E7D32"
          metalness={0.7}
          roughness={0.2}
          emissive={isDispensing ? "#1B5E20" : "#000000"}
          emissiveIntensity={isDispensing ? 0.2 : 0}
        />
      </Box>

      {/* Chrome Top Cap with beveled edges */}
      <Box args={[2.2, 0.4, 1.1]} position={[0, 2.2, 0]}>
        <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.05} />
      </Box>
      
      {/* Top Cap Accent Strip */}
      <Box args={[2.3, 0.1, 1.15]} position={[0, 2.35, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </Box>

      {/* Display Housing with Bezel */}
      <Box args={[1.6, 1.4, 0.15]} position={[0, 0.8, 0.51]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
      </Box>

      {/* Display Glass Effect */}
      <Box args={[1.5, 1.3, 0.05]} position={[0, 0.8, 0.52]}>
        <meshPhysicalMaterial
          color="#000033"
          metalness={0.1}
          roughness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </Box>

      {/* LED Display */}
      <LEDDisplay value={fuelAmount} />

      {/* Company Logo Plate */}
      <Box args={[1.2, 0.5, 0.05]} position={[0, 1.8, 0.51]}>
        <meshStandardMaterial color="#1976D2" metalness={0.7} roughness={0.3} />
      </Box>

      {/* Logo Text */}
      <Text
        position={[0, 1.8, 0.54]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        FUEL-TECH
      </Text>

      {/* Status Indicator Lights with Chrome Housing */}
      <group position={[0, 2.05, 0.52]}>
        <Cylinder args={[0.12, 0.12, 0.08, 16]} position={[-0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#4a4a4a" metalness={0.8} />
        </Cylinder>
        <Sphere args={[0.09, 16, 16]} position={[-0.5, 0, 0.02]}>
          <meshStandardMaterial
            color={isDispensing ? "#00E676" : "#1B5E20"}
            emissive={isDispensing ? "#00E676" : "#000000"}
            emissiveIntensity={isDispensing ? 1.5 : 0}
          />
        </Sphere>

        <Cylinder args={[0.12, 0.12, 0.08, 16]} position={[-0.15, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#4a4a4a" metalness={0.8} />
        </Cylinder>
        <Sphere args={[0.09, 16, 16]} position={[-0.15, 0, 0.02]}>
          <meshStandardMaterial
            color="#FFC107"
            emissive="#FFC107"
            emissiveIntensity={0.8}
          />
        </Sphere>

        <Cylinder args={[0.12, 0.12, 0.08, 16]} position={[0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#4a4a4a" metalness={0.8} />
        </Cylinder>
        <Sphere args={[0.09, 16, 16]} position={[0.2, 0, 0.02]} ref={alertLightRef}>
          <meshStandardMaterial
            color={alertActive ? "#FF0000" : "#4a0000"}
            emissive={alertActive ? "#FF0000" : "#000000"}
            emissiveIntensity={alertActive ? 2 : 0}
          />
        </Sphere>
      </group>

      {/* Premium Nozzle Holder with Chrome Details */}
      <Box args={[0.5, 1.8, 0.5]} position={[-1.3, -0.4, 0.4]} rotation={[0, 0, 0.25]}>
        <meshStandardMaterial color="#D32F2F" metalness={0.7} roughness={0.3} />
      </Box>

      {/* Nozzle Holder Chrome Trim */}
      <Box args={[0.52, 0.15, 0.52]} position={[-1.3, -1.25, 0.4]} rotation={[0, 0, 0.25]}>
        <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.05} />
      </Box>

      {/* Nozzle Hook */}
      <mesh position={[-1.5, -0.3, 0.4]}>
        <torusGeometry args={[0.15, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#757575" metalness={0.9} />
      </mesh>

      {/* Base Platform with Non-slip Surface */}
      <Box args={[2.5, 0.35, 1.4]} position={[0, -2.2, 0]}>
        <meshStandardMaterial color="#424242" metalness={0.6} roughness={0.7} />
      </Box>

      {/* Base Trim */}
      <Box args={[2.6, 0.1, 1.5]} position={[0, -2.4, 0]}>
        <meshStandardMaterial color="#212121" metalness={0.8} roughness={0.3} />
      </Box>

      {/* Side Panel with Ventilation */}
      <Box args={[0.2, 4, 1]} position={[1.1, 0, 0]}>
        <meshStandardMaterial color="#1B5E20" metalness={0.6} roughness={0.4} />
      </Box>

      {/* Ventilation Grilles */}
      {[-1, -0.5, 0, 0.5, 1].map((y, i) => (
        <Box key={`vent-${i}`} args={[0.05, 0.25, 0.9]} position={[1.15, y, 0]}>
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} />
        </Box>
      ))}

      {/* Professional Keypad with Backlight */}
      {Array.from({ length: 12 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <group key={`keypad-${i}`}>
            <Box
              args={[0.32, 0.28, 0.1]}
              position={[-0.45 + col * 0.45, -0.4 - row * 0.38, 0.51]}
            >
              <meshStandardMaterial
                color="#263238"
                metalness={0.7}
                roughness={0.4}
                emissive="#0D47A1"
                emissiveIntensity={0.1}
              />
            </Box>
            {/* Button Label */}
            <Text
              position={[-0.45 + col * 0.45, -0.4 - row * 0.38, 0.57]}
              fontSize={0.12}
              color="#00BCD4"
              anchorX="center"
              anchorY="middle"
            >
              {i === 9 ? '*' : i === 10 ? '0' : i === 11 ? '#' : (i + 1).toString()}
            </Text>
          </group>
        );
      })}

      {/* Circular Gauge with Glass Cover */}
      <Cylinder args={[0.4, 0.4, 0.08, 32]} position={[0.6, 0.1, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Gauge Glass */}
      <Cylinder args={[0.38, 0.38, 0.05, 32]} position={[0.6, 0.1, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0}
          roughness={0.1}
          transmission={0.95}
          thickness={0.5}
        />
      </Cylinder>

      {/* Price Display */}
      <Box args={[1.4, 0.4, 0.08]} position={[0, 0.1, 0.51]}>
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} />
      </Box>
      
      <Text
        position={[0, 0.1, 0.56]}
        fontSize={0.08}
        color="#00FF00"
        anchorX="center"
        anchorY="middle"
      >
        ₹{(fuelAmount * 95.5).toFixed(2)}
      </Text>

      {/* Emergency Stop Button */}
      <Cylinder args={[0.15, 0.15, 0.1, 32]} position={[0.8, -1.5, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#D32F2F" metalness={0.6} emissive="#B71C1C" emissiveIntensity={0.3} />
      </Cylinder>
      
      <Text
        position={[0.8, -1.7, 0.52]}
        fontSize={0.06}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        E-STOP
      </Text>

      {/* Warning Labels */}
      <Box args={[0.6, 0.2, 0.02]} position={[-0.6, -1.6, 0.51]}>
        <meshStandardMaterial color="#FFC107" metalness={0.5} />
      </Box>
      
      <Text
        position={[-0.6, -1.6, 0.53]}
        fontSize={0.05}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        FLAMMABLE
      </Text>

      {/* Alert Light if active */}
      {alertActive && (
        <pointLight
          position={[0.2, 2.05, 0.6]}
          color="#FF0000"
          intensity={2}
          distance={5}
        />
      )}
    </group>
  );
};

// Enhanced Hose and Nozzle
const HoseAndNozzle = ({ isDispensing }) => {
  const nozzleRef = useRef();

  useFrame((state) => {
    if (nozzleRef.current && isDispensing) {
      nozzleRef.current.rotation.z = -0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.02;
    }
  });

  const hosePoints = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const x = -1.3 - t * 2.2;
    const y = -0.4 - Math.sin(t * Math.PI * 1.8) * 0.7 - t * 1.3;
    const z = 0.4 - t * 0.35;
    hosePoints.push(new THREE.Vector3(x, y, z));
  }

  const hoseCurve = new THREE.CatmullRomCurve3(hosePoints);

  return (
    <group ref={nozzleRef}>
      {/* Main Hose with Ribbed Texture Effect */}
      <mesh>
        <tubeGeometry args={[hoseCurve, 100, 0.14, 20, false]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Hose Reinforcement Rings */}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = (i + 1) / 9;
        const point = hoseCurve.getPoint(t);
        return (
          <mesh key={`ring-${i}`} position={[point.x, point.y, point.z]}>
            <torusGeometry args={[0.15, 0.02, 8, 16]} />
            <meshStandardMaterial color="#424242" metalness={0.8} />
          </mesh>
        );
      })}

      {/* Nozzle Handle with Ergonomic Design */}
      <Box args={[0.35, 0.85, 0.25]} position={[-3.5, -1.8, 0.1]} rotation={[0, 0, -0.6]}>
        <meshStandardMaterial color="#2c2c2c" metalness={0.7} roughness={0.4} />
      </Box>

      {/* Handle Grip Texture */}
      <Box args={[0.37, 0.6, 0.27]} position={[-3.5, -1.8, 0.1]} rotation={[0, 0, -0.6]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.9} />
      </Box>

      {/* Nozzle Body */}
      <Cylinder args={[0.14, 0.18, 0.7, 20]} position={[-3.85, -2.1, 0.1]} rotation={[0, 0, -0.8]}>
        <meshStandardMaterial color="#616161" metalness={0.9} roughness={0.2} />
      </Cylinder>

      {/* Nozzle Spout */}
      <mesh position={[-4.15, -2.35, 0.1]} rotation={[0, 0, -0.8]}>
        <coneGeometry args={[0.14, 0.35, 20]} />
        <meshStandardMaterial color="#757575" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Nozzle Tip */}
      <mesh position={[-4.35, -2.52, 0.1]} rotation={[0, 0, -0.8]}>
        <coneGeometry args={[0.1, 0.15, 20]} />
        <meshStandardMaterial color="#9E9E9E" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Trigger */}
      <Box
        args={[0.25, 0.5, 0.18]}
        position={[-3.55, -1.6, 0.1]}
        rotation={[0, 0, isDispensing ? -0.4 : -0.2]}
      >
        <meshStandardMaterial
          color={isDispensing ? "#F44336" : "#D32F2F"}
          metalness={0.6}
          roughness={0.4}
        />
      </Box>

      {/* Safety Guard */}
      <mesh position={[-3.85, -2.1, 0.1]} rotation={[0, 0, -0.8]}>
        <torusGeometry args={[0.22, 0.03, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#FF5722" metalness={0.7} />
      </mesh>

      {/* Flow indicator light on nozzle */}
      {isDispensing && (
        <>
          <Sphere args={[0.05, 16, 16]} position={[-3.5, -2.05, 0.15]}>
            <meshStandardMaterial
              color="#00FF00"
              emissive="#00FF00"
              emissiveIntensity={2}
            />
          </Sphere>
          <pointLight
            position={[-3.5, -2.05, 0.15]}
            color="#00FF00"
            intensity={1}
            distance={2}
          />
        </>
      )}
    </group>
  );
};

// Complete Scene
const DispenserScene = ({ fuelAmount, isDispensing, alertActive }) => {
  return (
    <>
      {/* Enhanced Lighting for Realism */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.6} />
      <pointLight position={[0, 4, 4]} intensity={1.2} color="#ffffff" castShadow />
      <pointLight position={[-3, 0, 2]} intensity={0.5} color="#4CAF50" />
      <spotLight
        position={[0, 8, 3]}
        angle={0.6}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <DispenserBody fuelAmount={fuelAmount} isDispensing={isDispensing} alertActive={alertActive} />
      <HoseAndNozzle isDispensing={isDispensing} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={18}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={false}
      />

      {/* Realistic Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Grid Helper */}
      <gridHelper args={[40, 40, '#404040', '#252525']} position={[0, -2.59, 0]} />

      {/* Ambient Fog for Depth */}
      <fog attach="fog" args={['#0a0a0a', 10, 30]} />
    </>
  );
};

// Main Component
const FuelDispenser3D = ({ isOpen, onClose }) => {
  const [systemState, setSystemState] = useState('IDLE');
  const [fuelDispensed, setFuelDispensed] = useState(0);
  const [isDispensing, setIsDispensing] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const audioContextRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  const sensors = [
    {
      id: 1,
      name: 'FLOW SENSOR',
      value: isDispensing ? '58.7 L/min' : '0.0 L/min',
      status: isDispensing && fuelDispensed > 30 ? 'ANOMALY' : 'NORMAL',
      color: isDispensing && fuelDispensed > 30 ? '#F59E0B' : '#4CAF50'
    },
    {
      id: 2,
      name: 'PRESSURE',
      value: isDispensing ? '4.8 bar' : '2.58 bar',
      status: isDispensing && fuelDispensed > 35 ? 'CRITICAL' : 'NORMAL',
      color: isDispensing && fuelDispensed > 35 ? '#EF4444' : '#2196F3'
    },
    {
      id: 3,
      name: 'TEMPERATURE',
      value: isDispensing ? `${32 + Math.floor(fuelDispensed / 2)}°C` : '32°C',
      status: fuelDispensed > 40 ? 'WARNING' : 'NORMAL',
      color: fuelDispensed > 40 ? '#FF9800' : '#4CAF50'
    },
    {
      id: 4,
      name: 'VIBRATION',
      value: isDispensing ? `${(0.08 + fuelDispensed / 20).toFixed(2)}g` : '0.08g',
      status: fuelDispensed > 38 ? 'ALERT' : 'NORMAL',
      color: fuelDispensed > 38 ? '#F97316' : '#9C27B0'
    }
  ];

  // Alert Sound Function
  const playAlertSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const beep = (freq, dur, delay) => {
        setTimeout(() => {
          const osc = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();

          osc.connect(gain);
          gain.connect(audioContextRef.current.destination);

          osc.frequency.value = freq;
          osc.type = 'square';

          gain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + dur);

          osc.start(audioContextRef.current.currentTime);
          osc.stop(audioContextRef.current.currentTime + dur);
        }, delay);
      };

      // Triple beep alert pattern
      beep(900, 0.15, 0);
      beep(900, 0.15, 200);
      beep(900, 0.15, 400);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  // Check for anomalies and trigger alerts
  useEffect(() => {
    if (fuelDispensed > 35 && isDispensing) {
      setAlertActive(true);
      setAlertMessage('⚠️ CRITICAL: Pressure spike detected! Possible tampering.');
      
      // Play alert sound repeatedly
      if (!alarmIntervalRef.current) {
        playAlertSound();
        alarmIntervalRef.current = setInterval(() => {
          playAlertSound();
        }, 2000);
      }
    } else if (fuelDispensed > 30 && isDispensing) {
      setAlertActive(true);
      setAlertMessage('⚠️ WARNING: Flow rate anomaly detected.');
    } else {
      setAlertActive(false);
      setAlertMessage('');
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    }
  }, [fuelDispensed, isDispensing]);

  const handleStartDispensing = () => {
    setIsDispensing(true);
    setSystemState('DISPENSING');
    setFuelDispensed(0);

    // Simulate fuel dispensing
    const interval = setInterval(() => {
      setFuelDispensed((prev) => {
        const newValue = prev + 0.8;
        if (newValue >= 50) {
          clearInterval(interval);
          setIsDispensing(false);
          setSystemState('COMPLETE');
          return 50;
        }
        return newValue;
      });
    }, 100);
  };

  const handleReset = () => {
    setSystemState('IDLE');
    setFuelDispensed(0);
    setIsDispensing(false);
    setAlertActive(false);
    setAlertMessage('');
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '98vw',
          height: '95vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ background: 'white', borderBottom: '2px solid #E5E7EB' }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                padding: '0.75rem',
                background: '#DCFCE7',
                borderRadius: '0.75rem',
                border: '2px solid #4CAF50',
              }}
            >
              <Activity style={{ width: '1.75rem', height: '1.75rem', color: '#16A34A' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">3D Fuel Dispenser Model - FUEL-TECH Pro</h2>
              <p className="text-sm text-gray-500">
                Real-time monitoring • LED Display • Tamper Detection System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              background: '#F3F4F6',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>
        </div>

        {/* Alert Banner */}
        {alertActive && (
          <div
            style={{
              background: fuelDispensed > 35 ? '#FEE2E2' : '#FEF3C7',
              borderBottom: `3px solid ${fuelDispensed > 35 ? '#DC2626' : '#F59E0B'}`,
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              animation: 'pulse 1.5s infinite',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  color: fuelDispensed > 35 ? '#DC2626' : '#F59E0B',
                }}
              />
              <Volume2
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color: fuelDispensed > 35 ? '#DC2626' : '#F59E0B',
                }}
              />
            </div>
            <span
              style={{
                fontWeight: 'bold',
                fontSize: '1rem',
                color: fuelDispensed > 35 ? '#991B1B' : '#92400E',
              }}
            >
              {alertMessage}
            </span>
          </div>
        )}

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            background: '#0a0a0a',
            overflow: 'hidden',
          }}
        >
          {/* Left Sidebar - System Control */}
          <div
            style={{
              width: '300px',
              background: 'rgba(0, 0, 0, 0.95)',
              borderRight: '2px solid #333',
              padding: '1.5rem',
              overflowY: 'auto',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity style={{ width: '1.25rem', height: '1.25rem', color: '#4CAF50' }} />
                <h3
                  style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  System Control
                </h3>
              </div>

              <button
                onClick={handleStartDispensing}
                disabled={isDispensing || systemState === 'COMPLETE'}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: isDispensing ? '#666' : 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: isDispensing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: isDispensing ? 'none' : '0 4px 6px rgba(76, 175, 80, 0.3)',
                  transition: 'all 0.3s',
                }}
              >
                <Play style={{ width: '1.1rem', height: '1.1rem' }} />
                {isDispensing ? 'Dispensing...' : 'Start Dispensing'}
              </button>

              <button
                onClick={handleReset}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 6px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s',
                }}
              >
                <RotateCcw style={{ width: '1.1rem', height: '1.1rem' }} />
                Reset System
              </button>

              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: '0 0 0.35rem 0' }}>
                    System State:
                  </p>
                  <p
                    style={{
                      color:
                        systemState === 'DISPENSING'
                          ? '#4CAF50'
                          : systemState === 'COMPLETE'
                          ? '#2196F3'
                          : '#FFC107',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      margin: 0,
                    }}
                  >
                    {systemState}
                  </p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: '0 0 0.35rem 0' }}>
                    Fuel Dispensed:
                  </p>
                  <p
                    style={{
                      color: '#00BCD4',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      margin: 0,
                      fontFamily: 'monospace',
                    }}
                  >
                    {fuelDispensed.toFixed(1)} L
                  </p>
                </div>
                <div>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: '0 0 0.35rem 0' }}>
                    Total Amount:
                  </p>
                  <p
                    style={{
                      color: '#00FF00',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      margin: 0,
                      fontFamily: 'monospace',
                    }}
                  >
                    ₹{(fuelDispensed * 95.5).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sensor Readings */}
            <div>
              <h4
                style={{
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem',
                }}
              >
                Live Sensor Data
              </h4>

              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    border: `2px solid ${sensor.color}40`,
                    marginBottom: '0.6rem',
                    transition: 'all 0.3s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <p
                      style={{
                        color: '#9CA3AF',
                        fontSize: '0.7rem',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {sensor.name}
                    </p>
                    <span
                      style={{
                        background: `${sensor.color}30`,
                        color: sensor.color,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '0.3rem',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {sensor.status}
                    </span>
                  </div>
                  <p
                    style={{
                      color: sensor.color,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      margin: 0,
                      fontFamily: 'monospace',
                    }}
                  >
                    {sensor.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Center - 3D Canvas */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              background: 'linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%)',
            }}
          >
            <Canvas camera={{ position: [7, 4, 7], fov: 50 }} shadows style={{ width: '100%', height: '100%' }}>
              <Suspense fallback={null}>
                <DispenserScene
                  fuelAmount={fuelDispensed}
                  isDispensing={isDispensing}
                  alertActive={alertActive}
                />
              </Suspense>
            </Canvas>

            {/* Controls Info */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(0, 0, 0, 0.85)',
                color: 'white',
                padding: '1rem 1.25rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity style={{ width: '1rem', height: '1rem', color: '#4ADE80' }} />
                <strong style={{ color: '#4ADE80' }}>Controls:</strong>
              </div>
              <div style={{ fontSize: '0.8rem', lineHeight: '1.7', color: '#D1D5DB' }}>
                • Left Click + Drag: Rotate view
                <br />
                • Right Click + Drag: Pan view
                <br />
                • Scroll: Zoom in/out
                <br />• LED Display shows fuel amount
              </div>
            </div>

            {/* Alert Indicator */}
            {alertActive && (
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: fuelDispensed > 35 ? 'rgba(220, 38, 38, 0.95)' : 'rgba(245, 158, 11, 0.95)',
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  border: `2px solid ${fuelDispensed > 35 ? '#DC2626' : '#F59E0B'}`,
                  animation: 'pulse 1s infinite',
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 0 20px ${fuelDispensed > 35 ? 'rgba(220, 38, 38, 0.6)' : 'rgba(245, 158, 11, 0.6)'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle style={{ width: '1.5rem', height: '1.5rem' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>RISK LEVEL</div>
                    <div style={{ fontSize: '1.1rem' }}>{fuelDispensed > 35 ? 'CRITICAL' : 'WARNING'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - System Info */}
          <div
            style={{
              width: '300px',
              background: 'rgba(0, 0, 0, 0.95)',
              borderLeft: '2px solid #333',
              padding: '1.5rem',
              overflowY: 'auto',
            }}
          >
            <h3
              style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
              }}
            >
              Device Information
            </h3>

            <div
              style={{
                padding: '1rem',
                background: 'rgba(33, 150, 243, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                marginBottom: '1rem',
              }}
            >
              <p style={{ color: '#9CA3AF', fontSize: '0.7rem', margin: '0 0 0.25rem 0' }}>Model Number</p>
              <p style={{ color: '#2196F3', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                FUEL-TECH FD-3000 Pro
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                marginBottom: '1rem',
              }}
            >
              <p style={{ color: '#9CA3AF', fontSize: '0.7rem', margin: '0 0 0.25rem 0' }}>Connection Status</p>
              <p style={{ color: '#4CAF50', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>ONLINE</p>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'rgba(255, 152, 0, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                marginBottom: '1rem',
              }}
            >
              <p style={{ color: '#9CA3AF', fontSize: '0.7rem', margin: '0 0 0.25rem 0' }}>Location</p>
              <p style={{ color: '#FF9800', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>
                Station-A, Pump-03
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'rgba(156, 39, 176, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                marginBottom: '1rem',
              }}
            >
              <p style={{ color: '#9CA3AF', fontSize: '0.7rem', margin: '0 0 0.25rem 0' }}>Last Calibration</p>
              <p style={{ color: '#9C27B0', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>2025-11-15</p>
            </div>

            <div
              style={{
                padding: '1rem',
                background: alertActive ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.1)',
                borderRadius: '0.5rem',
                border: `2px solid ${alertActive ? '#DC2626' : 'rgba(76, 175, 80, 0.3)'}`,
              }}
            >
              <p style={{ color: '#9CA3AF', fontSize: '0.7rem', margin: '0 0 0.25rem 0' }}>Active Alerts</p>
              <p
                style={{
                  color: alertActive ? '#EF4444' : '#4CAF50',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {alertActive ? (fuelDispensed > 35 ? '3 Critical' : '2 Warnings') : '0 Issues'}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h4
                style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem',
                }}
              >
                System Specifications
              </h4>

              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', lineHeight: '2' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#fff' }}>Flow Rate:</strong> 0-80 L/min
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#fff' }}>Accuracy:</strong> ±0.3%
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#fff' }}>Pressure Range:</strong> 0-10 bar
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#fff' }}>Operating Temp:</strong> -20°C to 60°C
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#fff' }}>Display Type:</strong> LED 7-Segment
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Certification:</strong> OIML R117, ISO 9001
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};

export default FuelDispenser3D;
