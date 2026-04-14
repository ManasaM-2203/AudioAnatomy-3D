import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function EarModel({ activePart, simulationStep, isSimulationMode, ...props }) {
  const { nodes, materials } = useGLTF('/Telinga.glb');
  
  const eardrumRef = useRef();
  const ossiclesRef = useRef();
  const cochleaRef = useRef();
  
  const highlightColor = new THREE.Color('#38bdf8'); // Sky 400
  
  const isPartActive = (partId) => {
    if (isSimulationMode) {
      const stepPartMap = {
        1: 'pinna',
        2: 'canal',
        3: 'eardrum',
        4: 'ossicles',
        5: 'cochlea',
        6: 'nerve'
      };
      return stepPartMap[simulationStep] === partId;
    }
    return activePart === partId;
  };

  const getMaterialFor = (partIdentifiers, baseColorStr, origMat) => {
    const mat = origMat ? origMat.clone() : new THREE.MeshStandardMaterial();
    const active = partIdentifiers.some(id => isPartActive(id));
    
    // We override color to fulfill user's request for skin color and distinct inner colors,
    // but keep the original material properties (normals, roughness) from the loaded GLTF.
    mat.color = active ? highlightColor : new THREE.Color(baseColorStr);
    mat.emissive = active ? highlightColor : new THREE.Color('#000000');
    mat.emissiveIntensity = active ? 0.5 : 0;
    
    // Add some transparency to the skin so inner parts are partially visible
    // if the camera doesn't cleanly enter the ear canal.
    if (partIdentifiers.includes('pinna') || partIdentifiers.includes('canal')) {
       mat.transparent = true;
       mat.opacity = 0.85;
    }

    mat.side = THREE.DoubleSide;
    return mat;
  };

  // Memoize materials based on interaction state
  const customMaterials = useMemo(() => ({
    // Plane001 is mapped to Pinna/Canal (skin colored).
    skin: getMaterialFor(['pinna', 'canal'], '#ffcdb2', materials['Material.001']),
    
    // Eardrum
    eardrum1: getMaterialFor(['eardrum'], '#fecaca', materials['Material.007']),
    eardrum2: getMaterialFor(['eardrum'], '#fecaca', materials['Material.005']),
    
    // Ossicles and unidentified inner parts
    ossicles: getMaterialFor(['ossicles'], '#f1f5f9', materials['Material.008']),
    inner1: getMaterialFor(['ossicles'], '#e2e8f0', materials['Material.003']),
    inner2: getMaterialFor(['ossicles'], '#e2e8f0', materials['Material.002']),
    inner3: getMaterialFor(['ossicles'], '#e2e8f0', materials['Material.004']),
    inner4: getMaterialFor(['ossicles'], '#e2e8f0', materials['Material']),
    
    // Cochlea
    cochlea: getMaterialFor(['cochlea'], '#c084fc', materials['Material.006']),
    
    // Nerve
    nerve: getMaterialFor(['nerve'], '#fbbf24', materials['Material.009'])
  }), [activePart, simulationStep, isSimulationMode, materials]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (eardrumRef.current) {
      if (isSimulationMode && simulationStep === 3) {
        eardrumRef.current.position.x = Math.sin(time * 30) * 0.05;
      } else {
        eardrumRef.current.position.x = 0;
      }
    }

    if (ossiclesRef.current) {
      if (isSimulationMode && Math.round(simulationStep) === 4) {
        ossiclesRef.current.rotation.z = Math.sin(time * 20) * 0.1;
      } else {
        ossiclesRef.current.rotation.z = 0;
      }
    }

    if (cochleaRef.current) {
      if (isSimulationMode && simulationStep === 5) {
        cochleaRef.current.scale.setScalar(1 + Math.sin(time * 5) * 0.05);
      } else {
        cochleaRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group {...props} dispose={null} position={[-1.5, 0, 0]} scale={[1.2, 1.2, 1.2]}>
      
      {/* Pinna & Canal (Outer Skin) */}
      <mesh geometry={nodes.Plane001.geometry} material={customMaterials.skin} position={[0, 0, 0.084]} rotation={[0, 0, -Math.PI / 2]} scale={[2.489, 1, 0.633]} />
      
      {/* Eardrum */}
      <group ref={eardrumRef}>
        <mesh geometry={nodes.Sphere.geometry} material={customMaterials.eardrum1} position={[2.164, -1.002, 0.311]} rotation={[0.774, 0.077, -1.053]} scale={[0.517, 0.517, 0.342]} />
        <mesh geometry={nodes.Sphere001.geometry} material={customMaterials.eardrum2} position={[2.164, -1.002, 0.311]} rotation={[0.774, 0.077, -1.053]} scale={[0.517, 0.517, 0.342]} />
      </group>
      
      {/* Ossicles */}
      <group ref={ossiclesRef}>
        <mesh geometry={nodes.Torus002.geometry} material={customMaterials.ossicles} position={[3.692, -1.136, 0.48]} rotation={[-2.879, -1.378, 2.008]} scale={0.315} />
        <mesh geometry={nodes.Cylinder.geometry} material={customMaterials.ossicles} position={[3.591, -1.031, 0.408]} rotation={[-0.896, -0.122, -3.044]} scale={[0.093, 0.095, 0.095]} />
        <mesh geometry={nodes.BezierCurve.geometry} material={customMaterials.ossicles} position={[2.867, 0, 0]} />
        
        {/* Assumed other inner ear components mapped to ossicles area */}
        <mesh geometry={nodes.Plane.geometry} material={customMaterials.inner1} position={[0.322, 1.718, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.138, 0.619, 0.144]} />
        <mesh geometry={nodes.Plane003.geometry} material={customMaterials.inner2} position={[0.541, 1.452, 0.153]} rotation={[Math.PI / 2, 0, 0]} scale={0.123} />
        <mesh geometry={nodes.Cube.geometry} material={customMaterials.inner3} position={[0.799, 1.357, 0.065]} scale={[0.185, 0.185, 0.163]} />
        <mesh geometry={nodes.Cube001.geometry} material={customMaterials.inner4} position={[0.799, 1.357, 0.065]} scale={[0.185, 0.185, 0.163]} />
      </group>

      {/* Nerve */}
      <group>
        <mesh geometry={nodes.BezierCurve001.geometry} material={customMaterials.nerve} position={[3.601, -1.516, 0.252]} />
        <mesh geometry={nodes.BezierCurve002.geometry} material={customMaterials.nerve} position={[4.464, -1.499, 0.314]} />
      </group>

      {/* Cochlea */}
      <group ref={cochleaRef}>
        <mesh geometry={nodes.Sphere003.geometry} material={customMaterials.cochlea} position={[3.015, -0.788, 0.266]} rotation={[0, 0, 0.136]} scale={0.547} />
        <mesh geometry={nodes.Sphere004.geometry} material={customMaterials.cochlea} position={[3.015, -0.788, 0.266]} rotation={[0, 0, 0.136]} scale={0.547} />
        <mesh geometry={nodes.Sphere005.geometry} material={customMaterials.cochlea} position={[3.015, -0.788, 0.266]} rotation={[0, 0, 0.136]} scale={0.547} />
      </group>
    </group>
  );
}

useGLTF.preload('/Telinga.glb');
