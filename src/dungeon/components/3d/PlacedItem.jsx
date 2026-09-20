import React, { useState, useRef, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useRoom } from '../../context/RoomContext';
import { DungeonModel } from './DungeonModel';
import { RotateCw, ArrowUp, ArrowDown, Copy, Trash2, X } from 'lucide-react';
import * as THREE from 'three';

export function PlacedItem({ item }) {
  const {
    selectedItemId,
    setSelectedItemId,
    draggingSceneItemId,
    setDraggingSceneItemId,
    moveItem,
    rotateItem,
    adjustElevation,
    duplicateItem,
    deleteItem,
    gridSnap,
    gridSize,
    recordHistory
  } = useRoom();

  const isSelected = selectedItemId === item.id;
  const isDraggingThis = draggingSceneItemId === item.id;
  const [isHovered, setIsHovered] = useState(false);
  const hasRecordedDragRef = useRef(false);

  // Ground intersection plane at current elevation
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hitPointRef = useRef(new THREE.Vector3());
  const dragOffsetRef = useRef(new THREE.Vector3());

  // Start smooth drag on pointer down
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    hasRecordedDragRef.current = false;
    setSelectedItemId(item.id);
    setDraggingSceneItemId(item.id);

    // Calculate pointer offset relative to item position
    if (e.ray && e.ray.intersectPlane(floorPlane, hitPointRef.current)) {
      dragOffsetRef.current.set(
        hitPointRef.current.x - item.position[0],
        0,
        hitPointRef.current.z - item.position[2]
      );
    } else {
      dragOffsetRef.current.set(0, 0, 0);
    }

    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  // Track pointer smoothly across the whole screen plane
  const handlePointerMove = (e) => {
    if (draggingSceneItemId !== item.id) return;
    e.stopPropagation();

    if (!hasRecordedDragRef.current) {
      if (recordHistory) recordHistory();
      hasRecordedDragRef.current = true;
    }

    if (e.ray && e.ray.intersectPlane(floorPlane, hitPointRef.current)) {
      let targetX = hitPointRef.current.x - dragOffsetRef.current.x;
      let targetZ = hitPointRef.current.z - dragOffsetRef.current.z;

      if (gridSnap) {
        targetX = Math.round(targetX / gridSize) * gridSize;
        targetZ = Math.round(targetZ / gridSize) * gridSize;
      }

      moveItem(item.id, [targetX, item.position[1], targetZ]);
    }
  };

  // Finish drag on release
  const handlePointerUp = (e) => {
    e.stopPropagation();
    setDraggingSceneItemId(null);
    hasRecordedDragRef.current = false;
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  // Subtle elevation lift while dragging for tactile response
  const renderPos = [
    item.position[0],
    isDraggingThis ? item.position[1] + 0.15 : item.position[1],
    item.position[2]
  ];

  return (
    <group
      position={renderPos}
      rotation={item.rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItemId(item.id);
      }}
    >
      {/* 3D KayKit Model */}
      <React.Suspense fallback={null}>
        <DungeonModel
          modelPath={item.modelPath}
          scale={item.scale}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      </React.Suspense>

      {/* Tactile Shadow Disc when Dragging */}
      {isDraggingThis && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]}>
          <ringGeometry args={[0.35, 0.55, 32]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Floating In-Place Bubble Action Toolbar over Selected Item (Hidden during active drag) */}
      {isSelected && !isDraggingThis && (
        <Html position={[0, (item.scale || 1.2) * 1.4 + 0.3, 0]} center distanceFactor={10}>
          <div
            className="flex items-center gap-1.5 bg-stone-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-amber-500/40 shadow-2xl pointer-events-auto transform -translate-y-2 select-none"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Rotate 45 deg */}
            <button
              onClick={() => rotateItem(item.id, Math.PI / 4)}
              title="Rotate 45°"
              className="p-1.5 bg-amber-600/90 hover:bg-amber-500 text-white rounded-xl text-xs transition active:scale-95 shadow"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Raise (place on table) */}
            <button
              onClick={() => adjustElevation(item.id, 0.2)}
              title="Raise Height (Place on Table/Shelf)"
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs transition active:scale-95 border border-amber-500/20 shadow"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Lower */}
            <button
              onClick={() => adjustElevation(item.id, -0.2)}
              title="Lower Height"
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs transition active:scale-95 border border-amber-500/20 shadow"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate */}
            <button
              onClick={() => duplicateItem(item.id)}
              title="Duplicate Prop"
              className="p-1.5 bg-amber-700/90 hover:bg-amber-600 text-white rounded-xl text-xs transition active:scale-95 shadow"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => deleteItem(item.id)}
              title="Remove Prop"
              className="p-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-xl text-xs transition active:scale-95 shadow"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={() => setSelectedItemId(null)}
              title="Deselect"
              className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
