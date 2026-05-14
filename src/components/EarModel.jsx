import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import HairCells from './HairCells';
import { getDamageRates, getColorForHealth, PARTS } from './HealthEngine';

export default function EarModel({ activePart, simulationStep, mode, decibelLevel, healthStatsRef, ...props }) {
  const { nodes, materials } = useGLTF('/Telinga.glb');
  
  const eardrumRef = useRef();
  const ossiclesRef = useRef();
  const cochleaRef = useRef();
  
  const isPartActive = (partId) => {
    if (mode === 'simulation') {
      const stepPartMap = { 1: 'pinna', 2: 'canal', 3: 'eardrum', 4: 'ossicles', 5: 'cochlea', 6: 'nerve'};
      return stepPartMap[simulationStep] === partId;
    }
    if (mode === 'decibel') return decibelLevel > 20; 
    return activePart === partId;
  };

  const skinMaterial = useMemo(() => {
    nodes.Plane001.geometry.computeBoundingBox();
    const bbox = nodes.Plane001.geometry.boundingBox;
    
    const mat = new THREE.MeshStandardMaterial({ 
       color: '#f5d0b5', 
       transparent: true, 
       opacity: 0.95,
       side: THREE.DoubleSide
    });
    
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uPinnaActive = { value: 0 };
      shader.uniforms.uCanalActive = { value: 0 };
      shader.uniforms.uMinY = { value: bbox.min.y };
      shader.uniforms.uMaxY = { value: bbox.max.y };
      shader.uniforms.uHighlightColor = { value: new THREE.Color() };
      
      shader.vertexShader = `
        varying vec3 vLocalPos;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vLocalPos = position;
        `
      );

      shader.fragmentShader = `
        uniform float uPinnaActive;
        uniform float uCanalActive;
        uniform float uMinY;
        uniform float uMaxY;
        uniform vec3 uHighlightColor;
        varying vec3 vLocalPos;
        ${shader.fragmentShader}
      `.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `
        vec4 diffuseColor = vec4( diffuse, opacity );
        float t = clamp((vLocalPos.y - uMinY) / (uMaxY - uMinY), 0.0, 1.0);
        float pinnaMask = 1.0 - smoothstep(0.18, 0.22, t);
        float canalMask = smoothstep(0.18, 0.22, t) * (1.0 - smoothstep(0.50, 0.54, t));
        float finalMask = (uPinnaActive * pinnaMask) + (uCanalActive * canalMask);
        if (finalMask > 0.0) {
           diffuseColor.rgb = mix(diffuseColor.rgb, uHighlightColor, finalMask * 0.85); 
        }
        `
      ).replace(
        '#include <emissivemap_fragment>',
        `
        #include <emissivemap_fragment>
        totalEmissiveRadiance += uHighlightColor * finalMask * 0.6;
        `
      );
      
      mat.userData.shader = shader;
    };
    return mat;
  }, [nodes]);

  // Clone materials once so we can safely mutate them 60 times a second
  const customMaterials = useMemo(() => {
    const cloneMap = (mat) => {
       const c = mat ? mat.clone() : new THREE.MeshStandardMaterial();
       c.side = THREE.DoubleSide;
       return c;
    };
    return {
      eardrum1: cloneMap(materials['Material.007']),
      eardrum2: cloneMap(materials['Material.005']),
      ossicles: cloneMap(materials['Material.006']),
      cochlea: cloneMap(materials['Material.008']),
      nerve: cloneMap(materials['Material.009'])
    };
  }, [materials]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // --- DECIBEL STATE MUTATION ENGINE ---
    if (mode === 'decibel' && healthStatsRef && healthStatsRef.current) {
       const { r: decayRate, t: targets } = getDamageRates(decibelLevel);
       if (decayRate > 0) {
           PARTS.forEach(p => {
               const stat = healthStatsRef.current[p];
               // Decay current health down to the target threshold for this noise level
               if (stat.current > targets[p]) {
                   stat.current = Math.max(targets[p], stat.current - decayRate * delta);
               }
               // Erode permanent health floor slightly 
               if (stat.permFloor > targets[p]) {
                   stat.permFloor = Math.max(targets[p], stat.permFloor - (decayRate * 0.1) * delta);
               }
           });
       }
    }
    
    // --- MATERIAL UPDATER ---
    const applyHealthColor = (mat, partId, defaultColorStr) => {
       if (mode === 'decibel') {
          const h = (healthStatsRef && healthStatsRef.current) ? healthStatsRef.current[partId].current : 100;
          const c = new THREE.Color(getColorForHealth(h));
          mat.color.lerp(c, 0.1);
          mat.emissive.lerp(c, 0.1);
          mat.emissiveIntensity = 0.2 + (h/100) * 0.5;
       } else if ((mode === 'simulation' && isPartActive(partId)) || (mode === 'explore' && activePart === partId)) {
          mat.color.lerp(new THREE.Color('#38bdf8'), 0.1);
          mat.emissive.lerp(new THREE.Color('#38bdf8'), 0.1);
          mat.emissiveIntensity = 0.5;
       } else {
          mat.color.lerp(new THREE.Color(defaultColorStr), 0.1);
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
       }
    };
    
    applyHealthColor(customMaterials.eardrum1, 'eardrum', '#fca5a5');
    applyHealthColor(customMaterials.eardrum2, 'eardrum', '#fca5a5');
    applyHealthColor(customMaterials.ossicles, 'ossicles', '#f1f5f9');
    applyHealthColor(customMaterials.cochlea, 'cochlea', '#a78bfa');
    applyHealthColor(customMaterials.nerve, 'nerve', '#fbbf24');
    
    // Shader update for Skin
    if (skinMaterial.userData.shader) {
      const s = skinMaterial.userData.shader;
      const targetPinna = isPartActive('pinna') ? 1 : 0;
      const targetCanal = isPartActive('canal') ? 1 : 0;
      
      s.uniforms.uPinnaActive.value = THREE.MathUtils.lerp(s.uniforms.uPinnaActive.value, targetPinna, 0.1);
      s.uniforms.uCanalActive.value = THREE.MathUtils.lerp(s.uniforms.uCanalActive.value, targetCanal, 0.1);
      
      const pinnaColor = new THREE.Color(mode === 'decibel' && healthStatsRef ? getColorForHealth(healthStatsRef.current.pinna.current) : '#38bdf8');
      s.uniforms.uHighlightColor.value.lerp(pinnaColor, 0.1);
    }
    
    // --- PHYSCIAL ANIMATIONS ---
    let intensity = 1.0;
    let speed = 1.0;
    
    if (mode === 'decibel') {
       const dbIntensity = Math.max(0, (decibelLevel - 20) / 110);
       // Amplitude exponentially increases when reaching trauma levels
       intensity = 0.0 + dbIntensity * 5.0; 
       // Halved speed mapping vs old logic for visual clarity
       speed = 10 + decibelLevel * 0.25;
    } else if (mode === 'simulation') {
       intensity = 1.0;
       speed = 10;
    } else {
       intensity = 0;
       speed = 0;
    }
    
    if (eardrumRef.current) {
      if ((mode === 'simulation' && simulationStep === 3) || (mode === 'decibel' && decibelLevel > 20)) {
        eardrumRef.current.position.x = Math.sin(time * speed) * (0.05 * intensity);
      } else {
        eardrumRef.current.position.x = 0;
      }
    }

    if (ossiclesRef.current) {
      if ((mode === 'simulation' && Math.round(simulationStep) === 4) || (mode === 'decibel' && decibelLevel > 20)) {
        ossiclesRef.current.rotation.z = Math.sin(time * speed) * (0.1 * intensity);
      } else {
        ossiclesRef.current.rotation.z = 0;
      }
    }

    if (cochleaRef.current) {
      if ((mode === 'simulation' && simulationStep === 5) || (mode === 'decibel' && decibelLevel > 20)) {
        cochleaRef.current.scale.setScalar(1 + Math.sin(time * speed * 0.5) * (0.05 * intensity));
      } else {
        cochleaRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group {...props} dispose={null} position={[-2, 0, 0]} scale={[1.3, 1.3, 1.3]}>
      
      {/* Dynamic Unified Skin Mesh */}
      <mesh geometry={nodes.Plane001.geometry} material={skinMaterial} position={[0, 0, 0.084]} rotation={[0, 0, -Math.PI / 2]} scale={[2.489, 1, 0.633]} />
      
      <group ref={eardrumRef}>
        <mesh geometry={nodes.Sphere.geometry} material={customMaterials.eardrum1} position={[2.164, -1.002, 0.311]} rotation={[0.774, 0.077, -1.053]} scale={[0.517, 0.517, 0.342]} />
        <mesh geometry={nodes.Sphere001.geometry} material={customMaterials.eardrum2} position={[2.164, -1.002, 0.311]} rotation={[0.774, 0.077, -1.053]} scale={[0.517, 0.517, 0.342]} />
      </group>
      
      <group ref={ossiclesRef}>
        <mesh geometry={nodes.Sphere003.geometry} material={customMaterials.ossicles} position={[3.015, -0.788, 0.266]} rotation={[0, 0, 0.136]} scale={0.547} />
        <mesh geometry={nodes.Sphere004.geometry} material={customMaterials.ossicles} position={[3.015, -0.788, 0.266]} rotation={[0, 0, 0.136]} scale={0.547} />
        <mesh geometry={nodes.Sphere005.geometry} material={customMaterials.ossicles} position={[3.015, -0.788, 0.266]} rotation={[0, 0, 0.136]} scale={0.547} />
      </group>

      <group ref={cochleaRef}>
        <mesh geometry={nodes.Torus002.geometry} material={customMaterials.cochlea} position={[3.692, -1.136, 0.48]} rotation={[-2.879, -1.378, 2.008]} scale={0.315} />
        <mesh geometry={nodes.Cylinder.geometry} material={customMaterials.cochlea} position={[3.591, -1.031, 0.408]} rotation={[-0.896, -0.122, -3.044]} scale={[0.093, 0.095, 0.095]} />
        <mesh geometry={nodes.BezierCurve.geometry} material={customMaterials.cochlea} position={[2.867, 0, 0]} />
        
        {/* Procedurally Generated Instanced Hair Cells bounded inside the Cochlea volume */}
        {mode === 'decibel' && healthStatsRef && (
           <HairCells healthStatsRef={healthStatsRef} />
        )}
      </group>

      <group>
        <mesh geometry={nodes.BezierCurve001.geometry} material={customMaterials.nerve} position={[3.601, -1.516, 0.252]} />
        <mesh geometry={nodes.BezierCurve002.geometry} material={customMaterials.nerve} position={[4.464, -1.499, 0.314]} />
      </group>
    </group>
  );
}

useGLTF.preload('/Telinga.glb');
