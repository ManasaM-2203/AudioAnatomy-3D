import React from 'react';
import { EAR_PARTS } from '../constants';
import { Activity, Beaker, Ear, Volume2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getDecibelConfig(db) {
  if (db <= 20) return { status: 'Safe', icon: ShieldCheck, color: '#38bdf8', title: 'Near Silence', desc: 'No significant ear stimulation. Sound waves are barely perceptible.' };
  if (db <= 60) return { status: 'Safe', icon: ShieldCheck, color: '#10b981', title: 'Normal Range', desc: 'Safe listening range. Normal hearing transmission occurs flawlessly.' };
  if (db <= 85) return { status: 'Caution', icon: AlertTriangle, color: '#f59e0b', title: 'Loud', desc: 'Strong sound detected. Prolonged continuous exposure may cause hearing fatigue.' };
  if (db <= 100) return { status: 'Dangerous', icon: AlertTriangle, color: '#f97316', title: 'Risk Zone', desc: 'Intense mechanical pressure. Hair cells inside the cochlea are under physical stress.' };
  if (db <= 120) return { status: 'Dangerous', icon: AlertTriangle, color: '#ef4444', title: 'Harmful Intensity', desc: 'Dangerous exposure. Early mechanical trauma may be actively occurring in the inner ear.' };
  return { status: 'Trauma', icon: AlertTriangle, color: '#b91c1c', title: 'Acoustic Trauma', desc: 'Extreme amplitude! Ossicles over-transmitting force. Permanent tissue damage likely.' };
}

export default function Sidebar({ mode, setMode, activePart, setActivePart, decibelLevel, setDecibelLevel }) {
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
          Tour
        </button>
        <button 
          className={`tab-btn ${mode === 'decibel' ? 'active' : ''}`}
          onClick={() => {
            setMode('decibel');
            setActivePart('none');
          }}
        >
          Decibel
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

      {mode === 'decibel' && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="decibel-panel">
            <div className="db-value" style={{ color: getDecibelConfig(decibelLevel).color }}>
              {decibelLevel} <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>dB</span>
            </div>
            
            <input 
              type="range" 
              className="db-slider" 
              min="0" max="130" 
              value={decibelLevel} 
              onChange={(e) => setDecibelLevel(parseInt(e.target.value))}
            />
            
            {(() => {
              const cfg = getDecibelConfig(decibelLevel);
              const StatusIcon = cfg.icon;
              return (
                <div className="db-info-box" style={{ borderColor: cfg.color }}>
                  <div className="db-status-badge" style={{ backgroundColor: cfg.color + '22', color: cfg.color }}>
                    <StatusIcon size={16} /> <span>{cfg.status}</span>
                  </div>
                  <h4 style={{ color: cfg.color, marginBottom: '8px' }}>{cfg.title}</h4>
                  <p>{cfg.desc}</p>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}
    </div>
  );
}
