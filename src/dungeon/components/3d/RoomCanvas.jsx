import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { useRoom } from '../../context/RoomContext';
import { RoomEnvironment } from './RoomEnvironment';
import { PlacedItem } from './PlacedItem';
import { DragPreviewGhost } from './DragPreviewGhost';
import * as THREE from 'three';

export function RoomCanvas({ canvasRef }) {
  const {
    chambers,
    placedItems,
    setSelectedItemId,
    draggingCatalogItem,
    draggingSceneItemId
  } = useRoom();

  const isInteractingWithProp = Boolean(draggingCatalogItem || draggingSceneItemId);

  const handlePointerDownMissed = () => {
    if (!isInteractingWithProp) {
      setSelectedItemId(null);
    }
  };

  // Calculate dynamic bounding box and center of all chambers
  const dungeonBounds = useMemo(() => {
    if (!chambers || chambers.length === 0) {
      return { centerX: 0, centerZ: 0, maxSpan: 6 };
    }
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    chambers.forEach((c) => {
      const halfW = (c.width || 6) / 2;
      const halfD = (c.depth || 6) / 2;
      minX = Math.min(minX, c.x - halfW);
      maxX = Math.max(maxX, c.x + halfW);
      minZ = Math.min(minZ, c.z - halfD);
      maxZ = Math.max(maxZ, c.z + halfD);
    });
    return {
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
      maxSpan: Math.max(maxX - minX, maxZ - minZ)
    };
  }, [chambers]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [11, 12, 11], fov: 38 }}
        onPointerDownMissed={handlePointerDownMissed}
      >
        {/* Dynamic Camera & OrbitControls that automatically shifts as dungeon grows */}
        <DynamicOrbitControls
          dungeonBounds={dungeonBounds}
          chamberCount={chambers.length}
          isInteractingWithProp={isInteractingWithProp}
        />

        {/* Modular Dungeon Chambers & Hover-Reveal '+' Buttons */}
        <RoomEnvironment />

        {/* Dynamic Contact Shadows covering all chambers */}
        <ContactShadows
          position={[dungeonBounds.centerX, 0.001, dungeonBounds.centerZ]}
          opacity={0.65}
          scale={Math.max(30, dungeonBounds.maxSpan + 12)}
          blur={2}
          far={5}
          resolution={256}
          color="#1c1917"
        />

        {/* Real-Time Drag & Drop Ghost from Catalog */}
        <DragPreviewGhost />

        {/* Placed Props in the Dungeon */}
        {placedItems.map((item) => (
          <PlacedItem key={item.id} item={item} />
        ))}
      </Canvas>
    </div>
  );
}

// Smart OrbitControls that smoothly shifts center of focus as new chambers are built
function DynamicOrbitControls({ dungeonBounds, chamberCount, isInteractingWithProp }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const targetVec = useRef(new THREE.Vector3(dungeonBounds.centerX, 0.8, dungeonBounds.centerZ));
  const isAutoShifting = useRef(false);
  const prevCount = useRef(chamberCount);
  const prevCenter = useRef({ x: dungeonBounds.centerX, z: dungeonBounds.centerZ });

  // Whenever chamber layout changes, trigger a smooth camera glide to the new center
  useEffect(() => {
    if (!controlsRef.current) return;

    const deltaX = dungeonBounds.centerX - prevCenter.current.x;
    const deltaZ = dungeonBounds.centerZ - prevCenter.current.z;

    targetVec.current.set(dungeonBounds.centerX, 0.8, dungeonBounds.centerZ);
    isAutoShifting.current = true;

    // Shift camera position alongside the center shift so viewing perspective is preserved
    if (Math.abs(deltaX) > 0.01 || Math.abs(deltaZ) > 0.01) {
      camera.position.x += deltaX;
      camera.position.z += deltaZ;
    }

    prevCenter.current = { x: dungeonBounds.centerX, z: dungeonBounds.centerZ };
    prevCount.current = chamberCount;
  }, [dungeonBounds.centerX, dungeonBounds.centerZ, chamberCount, camera]);

  useFrame((_, delta) => {
    if (controlsRef.current && isAutoShifting.current && !isInteractingWithProp) {
      controlsRef.current.target.lerp(targetVec.current, Math.min(1, delta * 5));
      controlsRef.current.update();

      if (controlsRef.current.target.distanceTo(targetVec.current) < 0.05) {
        controlsRef.current.target.copy(targetVec.current);
        controlsRef.current.update();
        isAutoShifting.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!isInteractingWithProp}
      enableDamping
      dampingFactor={0.06}
      enablePan={true}
      screenSpacePanning={true}
      maxPolarAngle={Math.PI / 2 - 0.08}
      minDistance={3}
      maxDistance={80}
      onStart={() => {
        // User manually took control of camera (rotating or panning)
        isAutoShifting.current = false;
      }}
    />
  );
}
