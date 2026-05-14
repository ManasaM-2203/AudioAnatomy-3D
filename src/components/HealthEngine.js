// Contains constants and threshold logic for the Decibel Health Simulation

export const PARTS = ['pinna', 'canal', 'eardrum', 'ossicles', 'cochlea', 'nerve'];

export const INITIAL_HEALTH = {
  pinna: { current: 100, permFloor: 100 },
  canal: { current: 100, permFloor: 100 },
  eardrum: { current: 100, permFloor: 100 },
  ossicles: { current: 100, permFloor: 100 },
  cochlea: { current: 100, permFloor: 100 },
  nerve: { current: 100, permFloor: 100 }
};

export function getDamageRates(db) {
  // Returns { decayRate: float, permFloorTargets: object }
  // decayRate is health lost per second
  if (db <= 60) return { r: 0, t: { eardrum: 100, ossicles: 100, cochlea: 100, nerve: 100 }};
  
  if (db <= 85) return { 
    r: 1.0, 
    t: { eardrum: 100, ossicles: 100, cochlea: 95, nerve: 98 }
  };
  
  if (db <= 100) return { 
    r: 2.5, 
    t: { eardrum: 97, ossicles: 100, cochlea: 80, nerve: 90 }
  };
  
  if (db <= 120) return { 
    r: 6.0, 
    t: { eardrum: 85, ossicles: 90, cochlea: 60, nerve: 75 }
  };
  
  // Trauma > 120 dB
  return { 
    r: 15.0, 
    t: { eardrum: 65, ossicles: 70, cochlea: 30, nerve: 40 }
  };
}

export function getColorForHealth(healthIdx) {
  if (healthIdx >= 90) return '#10b981'; // green
  if (healthIdx >= 70) return '#eab308'; // yellow
  if (healthIdx >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

export function getDashboardStatus(db) {
  if (db <= 60) return { level: 'Safe listening', type: 'safe' };
  if (db <= 85) return { level: 'Mild fatigue risk', type: 'caution' };
  if (db <= 100) return { level: 'Hair-cell stress', type: 'risk' };
  if (db <= 120) return { level: 'Early permanent damage', type: 'danger' };
  return { level: 'Acoustic trauma', type: 'trauma' };
}
