import React from 'react';
import { SIMULATION_STEPS } from '../constants';
import { ChevronLeft, ChevronRight, Play, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SimulationControls({ simulationStep, setSimulationStep }) {
  const stepData = SIMULATION_STEPS.find(s => s.step === simulationStep);
  const isFirst = simulationStep === 0;
  const isLast = simulationStep === SIMULATION_STEPS.length - 1;

  const handlePrev = () => setSimulationStep(Math.max(0, simulationStep - 1));
  const handleNext = () => {
    if (isLast) {
      setSimulationStep(0);
    } else {
      setSimulationStep(simulationStep + 1);
    }
  };

  return (
    <div className="sim-controls-wrapper">
      <motion.div 
        className="sim-panel glass-panel"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={simulationStep}
            className="sim-header"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="sim-title">{stepData.title}</div>
            <div className="sim-desc">{stepData.description}</div>
          </motion.div>
        </AnimatePresence>

        <div className="sim-actions">
          <button 
            className="sim-btn" 
            onClick={handlePrev} 
            disabled={isFirst}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          
          <button 
            className="sim-btn" 
            onClick={handleNext} 
            style={isFirst ? { background: 'var(--accent)', color: 'white' } : {}}
          >
            {isFirst ? (
              <><Play size={20} /> Start Simulation</>
            ) : isLast ? (
              <><RefreshCcw size={20} /> Reset Tour</>
            ) : (
              <>Next <ChevronRight size={20} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
