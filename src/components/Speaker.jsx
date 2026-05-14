import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Speaker({ position = [-5, 0, 0], decibelLevel, ...props }) {
  const innerConeRef = useRef();
  
  useFrame((state) => {
    // Speaker cone vibration based on decibel Level
    if (innerConeRef.current && decibelLevel > 0) {
      const time = state.clock.getElapsedTime();
      // map db to vibration intensity (0 to ~0.2)
      const intensity = Math.max(0, (decibelLevel - 20) / 110) * 0.15;
      const speed = 20 + decibelLevel * 0.5;
      innerConeRef.current.position.x = Math.sin(time * speed) * intensity;
    }
  });

  return (
    <group position={position} {...props}>
      {/* Box */}
      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={[1, 1.8, 1.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Outer Ring */}
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Vibrating Inner Cone */}
      <group position={[-0.22, 0, 0]}>
        <mesh ref={innerConeRef} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.5, 0.4, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
