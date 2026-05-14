import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import SimulationControls from './components/SimulationControls';
import SimulationDashboard from './components/SimulationDashboard';
import EarCanvas from './components/EarCanvas';
import { INITIAL_HEALTH, PARTS } from './components/HealthEngine';
import './index.css';

function App() {
  const [mode, setMode] = useState('explore'); // 'explore', 'simulation', or 'decibel'
  const [activePart, setActivePart] = useState('none');
  const [simulationStep, setSimulationStep] = useState(0);
  const [decibelLevel, setDecibelLevel] = useState(40);
  
  // Health Tracking Ref to avoid React re-render choke loop
  const healthStatsRef = useRef(JSON.parse(JSON.stringify(INITIAL_HEALTH)));

  const handleRecover = () => {
    // Recovers temporary fatigue up to the permanent floor
    PARTS.forEach(p => {
       const stat = healthStatsRef.current[p];
       stat.current = Math.min(100, Math.max(stat.current + 20, stat.permFloor));
    });
  };

  const handleReset = () => {
    // Complete biological reset
    healthStatsRef.current = JSON.parse(JSON.stringify(INITIAL_HEALTH));
  };

  return (
    <>
      <Sidebar 
        mode={mode} 
        setMode={setMode} 
        activePart={activePart} 
        setActivePart={setActivePart}
        decibelLevel={decibelLevel}
        setDecibelLevel={setDecibelLevel}
      />
      
      <main className="main-content">
        <EarCanvas 
          activePart={activePart} 
          simulationStep={simulationStep} 
          mode={mode}
          decibelLevel={decibelLevel}
          healthStatsRef={healthStatsRef}
        />
        
        {mode === 'simulation' && (
          <SimulationControls 
            simulationStep={simulationStep}
            setSimulationStep={setSimulationStep}
          />
        )}

        {mode === 'decibel' && (
          <SimulationDashboard 
            decibelLevel={decibelLevel}
            healthStatsRef={healthStatsRef}
            onRecover={handleRecover}
            onReset={handleReset}
          />
        )}
      </main>
    </>
  );
}

export default App;
