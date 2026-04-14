import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SimulationControls from './components/SimulationControls';
import EarCanvas from './components/EarCanvas';
import './index.css';

function App() {
  const [mode, setMode] = useState('explore'); // 'explore' or 'simulation'
  const [activePart, setActivePart] = useState('none');
  const [simulationStep, setSimulationStep] = useState(0);

  const isSimulationMode = mode === 'simulation';

  return (
    <>
      <Sidebar 
        mode={mode} 
        setMode={setMode} 
        activePart={activePart} 
        setActivePart={setActivePart} 
      />
      
      <main className="main-content">
        <EarCanvas 
          activePart={activePart} 
          simulationStep={simulationStep} 
          isSimulationMode={isSimulationMode}
        />
        
        {isSimulationMode && (
          <SimulationControls 
            simulationStep={simulationStep}
            setSimulationStep={setSimulationStep}
          />
        )}
      </main>
    </>
  );
}

export default App;
