import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import EarModel from './EarModel';

export default function EarCanvas({ activePart, simulationStep, isSimulationMode }) {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
        <color attach="background" args={['transparent']} />
        
        {/* Lighting to make it look premium */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
            <EarModel 
              activePart={activePart} 
              simulationStep={simulationStep} 
              isSimulationMode={isSimulationMode} 
            />
          </Float>

          {/* Aesthetic ground shadow */}
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        </Suspense>

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          autoRotate={!isSimulationMode && activePart === 'none'}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
