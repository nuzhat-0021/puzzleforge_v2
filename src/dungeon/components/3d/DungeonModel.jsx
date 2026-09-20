import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function DungeonModel({
  modelPath,
  scale = 1.2,
  isSelected = false,
  isHovered = false,
  opacity = 1.0
}) {
  const { scene } = useGLTF(modelPath);

  // Clone scene for multiple independent instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          // Clone material so color modifications don't leak
          child.material = child.material.clone();
          child.material.roughness = 0.65;
          child.material.metalness = 0.15;

          if (opacity < 1.0) {
            child.material.transparent = true;
            child.material.opacity = opacity;
          }
        }
      }
    });

    return clone;
  }, [scene, opacity]);

  return (
    <group>
      <primitive
        object={clonedScene}
        scale={isSelected ? [scale * 1.05, scale * 1.05, scale * 1.05] : [scale, scale, scale]}
      />

      {/* Cute Warm Selection Ring on Floor */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.7, 0.85, 32]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Subtle Hover Ring */}
      {isHovered && !isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[0.65, 0.75, 32]} />
          <meshBasicMaterial color="#FDE68A" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
