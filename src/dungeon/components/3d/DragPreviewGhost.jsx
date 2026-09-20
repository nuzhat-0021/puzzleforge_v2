import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { DungeonModel } from './DungeonModel';

export function DragPreviewGhost() {
  const { draggingCatalogItem, dragHoverPoint, gridSnap, gridSize } = useRoom();

  if (!draggingCatalogItem || !dragHoverPoint) return null;

  let [x, y, z] = dragHoverPoint;
  if (gridSnap) {
    x = Math.round(x / gridSize) * gridSize;
    z = Math.round(z / gridSize) * gridSize;
  }

  const isWall = draggingCatalogItem.isWallItem;
  const posY = isWall ? Math.max(1.8, y) : Math.max(0, y);

  return (
    <group position={[x, posY, z]}>
      {/* 3D Semi-Transparent Ghost */}
      <React.Suspense fallback={null}>
        <DungeonModel
          modelPath={draggingCatalogItem.modelPath}
          scale={draggingCatalogItem.scale || 1.2}
          opacity={0.65}
        />
      </React.Suspense>

      {/* Target Drop Circle with Pulsing Glow on Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.4, 0.65, 32]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#FEF3C7" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
