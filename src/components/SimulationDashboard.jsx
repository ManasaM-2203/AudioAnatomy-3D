import React, { useState, useEffect } from 'react';
import { getDashboardStatus, getColorForHealth, PARTS } from './HealthEngine';
import { Activity, ShieldAlert, HeartPulse, RefreshCw } from 'lucide-react';

export default function SimulationDashboard({ decibelLevel, healthStatsRef, onRecover, onReset }) {
  const [stats, setStats] = useState(() => JSON.parse(JSON.stringify(healthStatsRef.current)));

  useEffect(() => {
    // Poll the ref at 10fps to avoid React choking on 60fps frame updates from EarModel
    const interval = setInterval(() => {
      setStats(JSON.parse(JSON.stringify(healthStatsRef.current)));
    }, 100);
    return () => clearInterval(interval);
  }, [healthStatsRef]);

  const { level, type } = getDashboardStatus(decibelLevel);
  
  // Calc overall health
  let totalHealth = 0;
  let minPartHealth = 100;
  let minPartName = 'None';
  
  PARTS.forEach(p => {
     totalHealth += stats[p].current;
     if (stats[p].current < minPartHealth) {
       minPartHealth = stats[p].current;
       minPartName = p.charAt(0).toUpperCase() + p.slice(1);
     }
  });
  const overallHealth = Math.round(totalHealth / 6);
  const damageSeverity = 100 - overallHealth;

  return (
    <div className="sim-dashboard glass-panel">
      <div className="dashboard-header">
        <h3><Activity size={18}/> Live Metrics Dashboard</h3>
      </div>
      
      <div className={`status-banner status-${type}`}>
        <div style={{flex: 1}}>
           <h4 style={{margin:0, fontSize: '1.1rem'}}>{level}</h4>
           <div style={{fontSize: '0.8rem', opacity: 0.8}}>Exposure Risk</div>
        </div>
        <div className="status-db">{decibelLevel} <span style={{fontSize: '0.9rem'}}>dB</span></div>
      </div>

      <div className="metrics-grid">
        <div className="metric-box">
          <label>Overall Health</label>
          <div className="metric-val" style={{color: getColorForHealth(overallHealth)}}>{overallHealth}%</div>
        </div>
        <div className="metric-box">
          <label>Severity</label>
          <div className="metric-val" style={{color: getColorForHealth(100 - damageSeverity)}}>{damageSeverity}%</div>
        </div>
        <div className="metric-box" style={{gridColumn: 'span 2'}}>
          <label>Primary Affected Part</label>
          <div className="metric-val" style={{color: getColorForHealth(minPartHealth)}}>{minPartName}</div>
        </div>
      </div>

      <div className="parts-health">
        <h4 style={{marginBottom: '12px', color: 'var(--text-secondary)'}}>Structural Integrity</h4>
        {PARTS.map(p => {
          const val = Math.round(stats[p].current);
          const perm = Math.round(stats[p].permFloor);
          const color = getColorForHealth(val);
          return (
            <div key={p} className="part-row">
              <span className="part-name">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
              <div className="progress-bg">
                <div className="progress-fill" style={{width: `${val}%`, backgroundColor: color}}></div>
                {/* Visual marker for permanent damage floor */}
                {perm < 100 && (
                  <div className="progress-marker" style={{left: `${perm}%`}} title={`Permanent Base: ${perm}%`}></div>
                )}
              </div>
              <span className="part-percent" style={{color}}>{val}%</span>
            </div>
          );
        })}
      </div>

      <div className="dashboard-actions">
        <button className="action-btn recover-btn" onClick={onRecover}>
          <HeartPulse size={16} /> Recovery Mode
        </button>
      </div>
    </div>
  );
}
