import React, { useMemo, useRef, useState } from 'react';
import { Html, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRoom } from '../../context/RoomContext';
import { Plus } from 'lucide-react';
import * as THREE from 'three';

export function RoomEnvironment() {
  const {
    chambers,
    addChamber,
    lightingMode,
    draggingCatalogItem,
    setDragHoverPoint,
    addItemAt,
    setDraggingCatalogItem,
    setSelectedItemId
  } = useRoom();

  // Global floor pointer event handlers for drag-and-drop from catalog
  const handleFloorPointerMove = (e) => {
    if (draggingCatalogItem && e.point) {
      setDragHoverPoint([e.point.x, e.point.y, e.point.z]);
    }
  };

  const handleFloorPointerUp = (e) => {
    if (draggingCatalogItem && e.point) {
      addItemAt(draggingCatalogItem, [e.point.x, 0, e.point.z]);
      setDraggingCatalogItem(null);
      setDragHoverPoint(null);
    }
  };

  const handleFloorClick = (e) => {
    if (!draggingCatalogItem) {
      setSelectedItemId(null);
    }
  };

  return (
    <group>
      {/* Warm Flickering Dungeon Lighting Rig */}
      <DungeonLightingRig mode={lightingMode} chambers={chambers} />

      {/* Render Each Modular 3D Dungeon Chamber with Hover-to-Reveal Expansion */}
      {chambers.map((chamber) => (
        <DungeonChamber
          key={chamber.id}
          chamber={chamber}
          allChambers={chambers}
          onAddChamber={addChamber}
        />
      ))}

      {/* Large Invisible Raycast Floor for Global Drag-and-Drop detection */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onPointerMove={handleFloorPointerMove}
        onPointerUp={handleFloorPointerUp}
        onClick={handleFloorClick}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}

// Single Dungeon Chamber: Modular 3D Stone Tiles, Castle Walls, and Hover-to-Reveal Expansion Buttons
function DungeonChamber({ chamber, allChambers, onAddChamber }) {
  const { x, z, width, depth } = chamber;

  // Check if adjacent chambers exist in each direction
  const hasLeft = allChambers.some((c) => c.gridX === chamber.gridX - 1 && c.gridZ === chamber.gridZ);
  const hasRight = allChambers.some((c) => c.gridX === chamber.gridX + 1 && c.gridZ === chamber.gridZ);
  const hasTop = allChambers.some((c) => c.gridX === chamber.gridX && c.gridZ === chamber.gridZ - 1);
  const hasBottom = allChambers.some((c) => c.gridX === chamber.gridX && c.gridZ === chamber.gridZ + 1);

  // 3x3 grid coordinates for modular 2x2 floor tiles (covering 6x6 chamber)
  const tileOffsets = [-2, 0, 2];

  return (
    <group position={[x, 0, z]}>
      {/* 1. AUTHENTIC KAYKIT 3D TEXTURED STONE FLOOR SLABS (3x3 grid of 2x2m tiles) */}
      <group position={[0, 0, 0]}>
        {tileOffsets.map((tx) =>
          tileOffsets.map((tz) => (
            <React.Suspense fallback={null} key={`tile-${tx}-${tz}`}>
              <ModularFloorTile position={[tx, 0, tz]} />
            </React.Suspense>
          ))
        )}
      </group>

      {/* Warm Stone Foundation Bed underneath */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[width + 0.2, 0.2, depth + 0.2]} />
        <meshStandardMaterial color="#1C1917" roughness={0.9} />
      </mesh>

      {/* 2. AUTHENTIC KAYKIT 3D MODULAR CASTLE STONE WALLS (Back Wall Only) */}
      {!hasTop && (
        <group position={[0, 0, -depth / 2]}>
          {tileOffsets.map((wx) => (
            <React.Suspense fallback={null} key={`wall-back-${wx}`}>
              <ModularWall position={[wx, 0, 0]} />
            </React.Suspense>
          ))}
          {/* Stone Wall Corner Columns */}
          <React.Suspense fallback={null}>
            <ModularColumn position={[-depth / 2 + 0.2, 0, 0.2]} />
            <ModularColumn position={[depth / 2 - 0.2, 0, 0.2]} />
          </React.Suspense>
        </group>
      )}

      {/* 3. Left Outer Wall (Only on far left edge of dungeon) */}
      {!hasLeft && (
        <group position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          {tileOffsets.map((wz) => (
            <React.Suspense fallback={null} key={`wall-left-${wz}`}>
              <ModularWall position={[wz, 0, 0]} />
            </React.Suspense>
          ))}
        </group>
      )}

      {/* 4. Right Outer Wall (Only on far right edge of dungeon) */}
      {!hasRight && (
        <group position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          {tileOffsets.map((wz) => (
            <React.Suspense fallback={null} key={`wall-right-${wz}`}>
              <ModularWall position={[wz, 0, 0]} />
            </React.Suspense>
          ))}
        </group>
      )}

      {/* 5. Hover-to-Reveal Expansion Buttons on Any Open Chamber Edge (Invisible by default, reveals on hover) */}
      {!hasLeft && (
        <HoverRevealPlusButton
          position={[-width / 2 - 0.35, 1.2, 0]}
          onClick={() => onAddChamber(chamber, 'left')}
          title={`Expand ${chamber.name} Left`}
        />
      )}

      {!hasRight && (
        <HoverRevealPlusButton
          position={[width / 2 + 0.35, 1.2, 0]}
          onClick={() => onAddChamber(chamber, 'right')}
          title={`Expand ${chamber.name} Right`}
        />
      )}

      {!hasTop && (
        <HoverRevealPlusButton
          position={[0, 1.2, -depth / 2 - 0.35]}
          onClick={() => onAddChamber(chamber, 'top')}
          title={`Expand ${chamber.name} North`}
        />
      )}

      {!hasBottom && (
        <HoverRevealPlusButton
          position={[0, 1.2, depth / 2 + 0.35]}
          onClick={() => onAddChamber(chamber, 'bottom')}
          title={`Expand ${chamber.name} South`}
        />
      )}
    </group>
  );
}

// Clean Hover-to-Reveal Plus Button (Subtle glowing circle by default, blooms into plus button on hover)
function HoverRevealPlusButton({ position, onClick, title }) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef(null);

  const handlePointerEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 200); // Responsive 0.2s hover
  };

  const handlePointerLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHovered(false);
  };

  return (
    <Html position={position} center distanceFactor={11}>
      <div
        className="w-16 h-16 flex items-center justify-center cursor-pointer pointer-events-auto select-none relative"
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
      >
        {/* Subtle glowing amber indicator circle when waiting */}
        <div
          className={`w-3.5 h-3.5 rounded-full bg-amber-500/40 border-2 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-300 ${
            isHovered ? 'opacity-0 scale-50' : 'opacity-40 hover:opacity-90'
          }`}
        />

        {/* Full button that blooms in on hover, completely invisible when not hovered */}
        <button
          onClick={onClick}
          title={title}
          className={`absolute w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.8)] border-2 border-amber-300 transition-all duration-200 transform ${
            isHovered
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-75 pointer-events-none'
          } active:scale-90 group`}
        >
          <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </Html>
  );
}

// Modular 3D KayKit Stone Floor Tile Component
function ModularFloorTile({ position }) {
  const { scene } = useGLTF('/models/dungeon/floor_tile_large.gltf');
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.7;
          child.material.metalness = 0.1;
        }
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={position} scale={[1, 1, 1]} />;
}

// Modular 3D KayKit Castle Wall Component
function ModularWall({ position, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/dungeon/wall.gltf');
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.8;
        }
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={position} rotation={rotation} scale={[1, 1, 1]} />;
}

// Modular 3D KayKit Column Component
function ModularColumn({ position }) {
  const { scene } = useGLTF('/models/dungeon/pillar.gltf');
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={position} scale={[0.9, 0.9, 0.9]} />;
}

// Animated Flickering Torch Light Component (Ultra Lightweight)
function FlickeringTorchLight({ position, color = '#F59E0B', baseIntensity = 3.0 }) {
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime() * 7;
      const flicker =
        Math.sin(t * 1.5) * 0.2 +
        Math.sin(t * 3.7) * 0.12 +
        Math.sin(t * 8.1) * 0.06;
      lightRef.current.intensity = Math.max(1.8, baseIntensity + flicker);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color={color}
      intensity={baseIntensity}
      distance={9}
      decay={2}
    />
  );
}

// Dynamic Ambient & Torch Lighting Rig
function DungeonLightingRig({ mode, chambers }) {
  const isCrystal = mode === 'crystal';
  const isMidnight = mode === 'midnight';

  const lightColor = isCrystal ? '#38BDF8' : isMidnight ? '#C084FC' : '#F59E0B';

  return (
    <group>
      {/* Warm Ambient Fill Light */}
      <ambientLight
        intensity={isMidnight ? 0.5 : isCrystal ? 0.8 : 0.95}
        color={isCrystal ? '#93C5FD' : isMidnight ? '#C4B5FD' : '#FEF3C7'}
      />

      {/* Main Directional Sun / Moonlight with single optimized shadow map */}
      <directionalLight
        position={[12, 18, 10]}
        intensity={isMidnight ? 1.0 : 1.9}
        color={isCrystal ? '#60A5FA' : isMidnight ? '#818CF8' : '#FDE68A'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0005}
      />

      {/* Warm Fill Light from front to illuminate props */}
      <directionalLight
        position={[-8, 10, 12]}
        intensity={0.8}
        color="#FDE68A"
      />

      {/* Animated Flickering Torch Light in each chamber */}
      {chambers.map((c) => (
        <FlickeringTorchLight
          key={`flicker-${c.id}`}
          position={[c.x, 2.6, c.z]}
          color={lightColor}
          baseIntensity={isMidnight ? 2.2 : 3.2}
        />
      ))}
    </group>
  );
}
