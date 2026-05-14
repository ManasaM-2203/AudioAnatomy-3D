import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getColorForHealth } from './HealthEngine';

const COUNT = 120;
const dummy = new THREE.Object3D();

export default function HairCells({ healthStatsRef }) {
  const meshRef = useRef();
  const geoRef = useRef();
  
  // Shift pivot point to the bottom of the cylinder
  useEffect(() => {
    if (geoRef.current) {
      geoRef.current.translate(0, 0.015, 0);
    }
  }, []);

  // Compute curved basal turn positions
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < COUNT; i++) {
       const t = i / COUNT;
       const angle = t * Math.PI * 1.5;
       const radius = 0.12 - t * 0.05;
       const x = 3.65 + Math.cos(angle) * radius;
       const y = -1.05 - Math.sin(t * Math.PI) * 0.05;
       const z = 0.45 + Math.sin(angle) * radius;
       pos.push(new THREE.Vector3(x, y, z));
    }
    return pos;
  }, []);

  useFrame((state) => {
     if (!meshRef.current) return;
     const time = state.clock.getElapsedTime();
     const health = healthStatsRef.current.cochlea.current;
     
     // Damage factor 0.0 (healthy) -> 1.0 (dead)
     const damageFactor = 1.0 - (health / 100); 
     const currentColor = new THREE.Color(getColorForHealth(health));
     
     for (let i = 0; i < COUNT; i++) {
       const t = i / COUNT; // 0 = outer basal turn, 1 = apical turn
       
       // Hair cell stress logic:
       // The base of the cochlea (lower index) is more susceptible to high frequency damage
       const susceptibility = 1.2 - t * 0.5;
       const cellDamage = Math.max(0, Math.min(1, damageFactor * susceptibility));
       
       // Healthy angle = straight up (0). Dead angle = flattened (-PI/2)
       const targetAngleZ = THREE.MathUtils.lerp(0, -Math.PI / 2.2, cellDamage);
       
       // Halved waving speed
       const wave = Math.sin(time * 1.5 + i * 0.2) * 0.06 * (1.0 - cellDamage);
       
       dummy.position.copy(positions[i]);
       dummy.rotation.set(0, 0, targetAngleZ + wave);
       dummy.scale.set(1, 1 - cellDamage * 0.4, 1); // Shrink slightly when dead
       dummy.updateMatrix();
       
       meshRef.current.setMatrixAt(i, dummy.matrix);
     }
     
     meshRef.current.instanceMatrix.needsUpdate = true;
     if (meshRef.current.material) {
        meshRef.current.material.color.lerp(currentColor, 0.1);
        meshRef.current.material.emissive.lerp(currentColor, 0.1);
        // Dim emission when heavily damaged
        meshRef.current.material.emissiveIntensity = 0.1 + (health/100) * 0.5;
     }
  });

  return (
     <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
        <cylinderGeometry ref={geoRef} args={[0.003, 0.003, 0.03, 4]} />
        <meshStandardMaterial transparent opacity={0.9} />
     </instancedMesh>
  );
}
