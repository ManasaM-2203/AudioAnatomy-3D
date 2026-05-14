import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SoundWaves({ decibelLevel }) {
  const wavesRef = useRef([]);
  // Generate 6 animated waves
  const waveIndexes = [0, 1, 2, 3, 4, 5];
  
  // Convert dB to a 0-1 intensity scale. 
  // Sounds below 20dB have zero wave visibility.
  const isAudible = decibelLevel > 20;
  const intensity = Math.max(0, (decibelLevel - 20) / 110); 
  
  // Set wave color to light grey for clear visibility against the dark background
  const waveColor = new THREE.Color('#e2e8f0');
  
  useFrame((state, delta) => {
    if (!isAudible) return;
    
    // Halt speed by half based on user request
    const speed = 0.5 + intensity * 2.5;
    const spawnX = -4.2;
    const killX = -2.0; // disappear as they enter ear canal funnel
    
    wavesRef.current.forEach((wave, i) => {
      if (!wave) return;
      
      wave.position.x += speed * delta;
      
      const progress = (wave.position.x - spawnX) / (killX - spawnX);
      
      if (progress >= 1.0) {
        wave.position.x = spawnX;
        wave.scale.setScalar(0.1); 
      } else {
        // Expand wave to simulate funneling field
        const scaleVal = 0.5 + progress * 2.0;
        wave.scale.setScalar(scaleVal);
        
        // Dynamically fade based on X position to make it seamless
        if (wave.material) {
           const maxOp = 0.5 + intensity * 0.5; 
           const fade = Math.sin(progress * Math.PI); // Parabola from 0 to 1 to 0
           wave.material.opacity = fade * maxOp;
        }
      }
    });
  });

  if (!isAudible) return null;

  return (
    <group>
      {waveIndexes.map((i) => {
        // Evenly space out initial positions
        const initX = -4.2 + (i / waveIndexes.length) * 2.2;
        return (
          <mesh 
            key={i} 
            ref={el => wavesRef.current[i] = el}
            position={[initX, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[0.5, 0.02 + intensity * 0.08, 16, 64]} />
            <meshStandardMaterial 
              color={waveColor} 
              transparent 
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
