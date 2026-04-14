import React from 'react';
import { EAR_PARTS } from '../constants';
import { Activity, Beaker, Ear } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ mode, setMode, activePart, setActivePart }) {
  const activePartData = EAR_PARTS.find(p => p.id === activePart);

  return (
    <div className="sidebar glass-panel">
      <div className="app-title">AudioAnatomy 3D</div>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${mode === 'explore' ? 'active' : ''}`}
          onClick={() => setMode('explore')}
        >
          Explore
        </button>
        <button 
          className={`tab-btn ${mode === 'simulation' ? 'active' : ''}`}
          onClick={() => {
            setMode('simulation');
            setActivePart('none');
          }}
        >
          Simulation
        </button>
      </div>

      {mode === 'explore' && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="parts-list">
            {EAR_PARTS.map((part) => (
              <button
                key={part.id}
                className={`part-btn ${activePart === part.id ? 'active' : ''}`}
                onClick={() => setActivePart(part.id)}
              >
                <Ear size={18} className="part-icon" />
                {part.name}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {activePartData && (
              <motion.div 
                className="part-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key={activePartData.id}
              >
                <h3>{activePartData.name}</h3>
                <p>{activePartData.description}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {mode === 'simulation' && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7 }}
        >
          <Activity size={48} style={{ color: 'var(--accent)', marginBottom: 16 }} />
          <h3 style={{ textAlign: 'center', marginBottom: 8 }}>Guided Tour Active</h3>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Use the controls at the bottom of the screen to step through the hearing process.
          </p>
        </motion.div>
      )}
    </div>
  );
}
