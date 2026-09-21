import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  ArrowLeft,
  Key,
  DoorClosed,
  FileText,
  Clock,
  Sparkles,
  Trophy,
  X,
  Compass,
  Hand
} from 'lucide-react';
import { audioSystem } from '../dungeon/utils/audioSystem';
import { submitRoomRun } from '../utils/communityRoomPool';

// ----------------------------------------------------
// Error Boundary to prevent any 3D scene crashes
// ----------------------------------------------------
class EscapeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('PlayerEscapeView 3D Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-stone-950 text-amber-200 p-8 text-center select-none">
          <h2 className="text-xl font-bold mb-2">Notice: Re-initializing Escape Chamber</h2>
          <p className="text-xs text-stone-400 max-w-md mb-4">
            A graphic component needed to reset. Click below to return to the hub.
          </p>
          <button
            onClick={this.props.onExit}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-sm"
          >
            Return to Hub
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ----------------------------------------------------
// Authentic KayKit Modular 3D Components
// ----------------------------------------------------
function ModularFloorTile({ position }) {
  const { scene } = useGLTF('/models/dungeon/floor_tile_large.gltf');
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.75;
          child.material.metalness = 0.1;
        }
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={position} scale={[1, 1, 1]} />;
}

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
          child.material.roughness = 0.85;
        }
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={position} rotation={rotation} scale={[1, 1, 1]} />;
}

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

  return <primitive object={clone} position={position} scale={[1, 1, 1]} />;
}

// ----------------------------------------------------
// Authentic Connected Chamber (NO divider walls between connected rooms!)
// ----------------------------------------------------
function ConnectedDungeonChamber({ chamber, allChambers }) {
  const x = chamber.x || 0;
  const z = chamber.z || 0;
  const width = chamber.width || 6;
  const depth = chamber.depth || chamber.length || 6;

  // Smart edge detection: checks if another chamber touches this edge
  const hasLeft = allChambers.some(
    (c) =>
      c !== chamber &&
      ((c.gridX !== undefined && c.gridX === chamber.gridX - 1 && c.gridZ === chamber.gridZ) ||
        (Math.abs((c.x || 0) - (x - width)) < 1.5 && Math.abs((c.z || 0) - z) < 1.5))
  );
  const hasRight = allChambers.some(
    (c) =>
      c !== chamber &&
      ((c.gridX !== undefined && c.gridX === chamber.gridX + 1 && c.gridZ === chamber.gridZ) ||
        (Math.abs((c.x || 0) - (x + width)) < 1.5 && Math.abs((c.z || 0) - z) < 1.5))
  );
  const hasTop = allChambers.some(
    (c) =>
      c !== chamber &&
      ((c.gridX !== undefined && c.gridX === chamber.gridX && c.gridZ === chamber.gridZ - 1) ||
        (Math.abs((c.z || 0) - (z - depth)) < 1.5 && Math.abs((c.x || 0) - x) < 1.5))
  );
  const hasBottom = allChambers.some(
    (c) =>
      c !== chamber &&
      ((c.gridX !== undefined && c.gridX === chamber.gridX && c.gridZ === chamber.gridZ + 1) ||
        (Math.abs((c.z || 0) - (z + depth)) < 1.5 && Math.abs((c.x || 0) - x) < 1.5))
  );

  // 3x3 grid of 2x2m modular stone floor slabs
  const tileOffsets = [-2, 0, 2];

  return (
    <group position={[x, 0, z]}>
      {/* 1. Authentic Textured Stone Floor Slabs */}
      <group position={[0, 0, 0]}>
        {tileOffsets.map((tx) =>
          tileOffsets.map((tz) => (
            <Suspense
              key={`floor-${tx}-${tz}`}
              fallback={
                <mesh position={[tx, 0.05, tz]}>
                  <boxGeometry args={[2, 0.1, 2]} />
                  <meshStandardMaterial color="#292524" roughness={0.8} />
                </mesh>
              }
            >
              <ModularFloorTile position={[tx, 0, tz]} />
            </Suspense>
          ))
        )}
      </group>

      {/* Stone Foundation Slab Bed */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[width + 0.1, 0.16, depth + 0.1]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>

      {/* 2. Top / North Outer Wall (ONLY if no room above) */}
      {!hasTop && (
        <group position={[0, 0, -depth / 2]}>
          {tileOffsets.map((wx) => (
            <Suspense key={`wall-top-${wx}`} fallback={null}>
              <ModularWall position={[wx, 0, 0]} />
            </Suspense>
          ))}
          <Suspense fallback={null}>
            <ModularColumn position={[-width / 2 + 0.2, 0, 0.2]} />
            <ModularColumn position={[width / 2 - 0.2, 0, 0.2]} />
          </Suspense>
          {/* Torch Light */}
          <pointLight position={[0, 2.2, 0.6]} intensity={1.5} color="#f59e0b" distance={8} />
        </group>
      )}

      {/* 3. Left / West Outer Wall (ONLY if no room to the left) */}
      {!hasLeft && (
        <group position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          {tileOffsets.map((wz) => (
            <Suspense key={`wall-left-${wz}`} fallback={null}>
              <ModularWall position={[wz, 0, 0]} />
            </Suspense>
          ))}
          <pointLight position={[0.6, 2.2, 0]} intensity={1.5} color="#f97316" distance={8} />
        </group>
      )}

      {/* 4. Right / East Outer Wall (ONLY if no room to the right) */}
      {!hasRight && (
        <group position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          {tileOffsets.map((wz) => (
            <Suspense key={`wall-right-${wz}`} fallback={null}>
              <ModularWall position={[wz, 0, 0]} />
            </Suspense>
          ))}
          <pointLight position={[-0.6, 2.2, 0]} intensity={1.5} color="#f97316" distance={8} />
        </group>
      )}

      {/* 5. Bottom / South Outer Wall (ONLY if no room below) */}
      {!hasBottom && (
        <group position={[0, 0, depth / 2]} rotation={[0, Math.PI, 0]}>
          {tileOffsets.map((wx) => (
            <Suspense key={`wall-bottom-${wx}`} fallback={null}>
              <ModularWall position={[wx, 0, 0]} />
            </Suspense>
          ))}
        </group>
      )}
    </group>
  );
}

// ----------------------------------------------------
// Safe Model Loader with Procedural Fallbacks
// ----------------------------------------------------
function SafeDungeonPropModel({ modelPath, scale = 1.2 }) {
  // Normalize old .glb paths to real .gltf
  let cleanPath = modelPath || '/models/dungeon/chest.gltf';
  if (cleanPath.endsWith('.glb')) {
    cleanPath = cleanPath.replace('.glb', '.gltf');
    if (cleanPath.includes('door-gate') || cleanPath.includes('door_gate')) {
      cleanPath = '/models/dungeon/wall_gated.gltf';
    } else if (cleanPath.includes('banner')) {
      cleanPath = '/models/dungeon/banner_red.gltf';
    } else if (cleanPath.includes('chest')) {
      cleanPath = '/models/dungeon/chest.gltf';
    }
  }

  const { scene } = useGLTF(cleanPath);
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

  const numScale = typeof scale === 'number' ? scale : 1.2;
  return <primitive object={clone} scale={[numScale, numScale, numScale]} />;
}

// ----------------------------------------------------
// Interactive Prop Component
// ----------------------------------------------------
function InteractiveProp({ item, isFocused, isOpened, onInteract }) {
  const role = item.logic?.role || 'none';
  const pos = item.position || [0, 0, 0];
  const rot = item.rotation || [0, 0, 0];
  const scale = item.scale || 1.2;

  return (
    <group
      position={pos}
      rotation={rot}
      onClick={(e) => {
        e.stopPropagation();
        onInteract(item);
      }}
    >
      <Suspense
        fallback={
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color={role === 'exit_door' ? '#991b1b' : '#d97706'} roughness={0.7} />
          </mesh>
        }
      >
        <SafeDungeonPropModel modelPath={item.modelPath} scale={scale} />
      </Suspense>

      {/* Proximity Focus Ring on Floor when player looks at this prop */}
      {isFocused && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.95, 32]} />
          <meshBasicMaterial
            color={
              role === 'exit_door'
                ? '#ef4444'
                : role === 'container'
                ? '#f59e0b'
                : role === 'clue'
                ? '#38bdf8'
                : '#a855f7'
            }
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Green Diamond Marker above Opened Chests */}
      {isOpened && (
        <mesh position={[0, 1.1, 0]}>
          <octahedronGeometry args={[0.12]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      )}
    </group>
  );
}

// ----------------------------------------------------
// First-Person 3D Character Controller (WASD + Mouse Look)
// ----------------------------------------------------
function FirstPersonController({
  chambers,
  placedItems,
  onInteractWithFocused,
  setFocusedItem,
  isPaused
}) {
  const { camera, gl } = useThree();

  // Player state: eye height = 1.6m
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const isPointerLockedRef = useRef(false);

  // WASD Key States
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  // Calculate Dungeon Bounds for soft boundary clamping
  const bounds = useMemo(() => {
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    (chambers || []).forEach((c) => {
      const halfW = (c.width || 6) / 2;
      const halfD = (c.depth || c.length || 6) / 2;
      minX = Math.min(minX, (c.x || 0) - halfW);
      maxX = Math.max(maxX, (c.x || 0) + halfW);
      minZ = Math.min(minZ, (c.z || 0) - halfD);
      maxZ = Math.max(maxZ, (c.z || 0) + halfD);
    });
    return {
      minX: minX === Infinity ? -3 : minX,
      maxX: maxX === -Infinity ? 3 : maxX,
      minZ: minZ === Infinity ? -3 : minZ,
      maxZ: maxZ === -Infinity ? 3 : maxZ
    };
  }, [chambers]);

  // Set initial position in the first room
  useEffect(() => {
    const first = chambers[0];
    camera.position.set(first?.x || 0, 1.6, (first?.z || 0) + 1.2);
    camera.rotation.set(0, 0, 0);
  }, []);

  // Keyboard & Mouse Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused) return;
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.right = true;
      if (code === 'KeyE') {
        onInteractWithFocused();
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.right = false;
    };

    const handleMouseMove = (e) => {
      if (!isPointerLockedRef.current || isPaused) return;
      const sensitivity = 0.0022;
      yawRef.current -= e.movementX * sensitivity;
      pitchRef.current -= e.movementY * sensitivity;
      // Clamp pitch (-70 deg to +70 deg)
      pitchRef.current = Math.max(-1.25, Math.min(1.25, pitchRef.current));
    };

    const handleLockChange = () => {
      isPointerLockedRef.current = document.pointerLockElement === gl.domElement;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handleLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [gl, isPaused, onInteractWithFocused]);

  // Click Canvas to Lock Pointer
  useEffect(() => {
    const canvas = gl.domElement;
    const handleClick = () => {
      if (!isPaused && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock?.();
      }
    };
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [gl, isPaused]);

  // Frame Loop: Smooth Movement & Interaction Raycast
  useFrame((_, delta) => {
    if (isPaused) return;

    // 1. Update Camera Rotation from Yaw & Pitch
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = pitchRef.current;
    euler.y = yawRef.current;
    camera.quaternion.setFromEuler(euler);

    // 2. WASD Movement in Direction of Yaw
    const speed = 4.8;
    const moveX = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
    const moveZ = (keysRef.current.backward ? 1 : 0) - (keysRef.current.forward ? 1 : 0);

    if (moveX !== 0 || moveZ !== 0) {
      const inputVector = new THREE.Vector3(moveX, 0, moveZ).normalize();
      // Rotate by yaw
      const moveEuler = new THREE.Euler(0, yawRef.current, 0);
      inputVector.applyEuler(moveEuler);
      inputVector.multiplyScalar(speed * delta);

      const nextX = camera.position.x + inputVector.x;
      const nextZ = camera.position.z + inputVector.z;

      // Soft clamp inside dungeon boundary
      const padding = 0.8;
      camera.position.x = THREE.MathUtils.clamp(nextX, bounds.minX + padding, bounds.maxX - padding);
      camera.position.z = THREE.MathUtils.clamp(nextZ, bounds.minZ + padding, bounds.maxZ - padding);
    }

    // Keep camera at fixed eye height 1.6m
    camera.position.y = 1.6;

    // 3. Find closest interactable prop in front of player
    let closestItem = null;
    let closestDist = 3.6; // Max reach distance (3.6 meters)

    const camPos = new THREE.Vector3(camera.position.x, 0, camera.position.z);
    const forwardDir = new THREE.Vector3();
    camera.getWorldDirection(forwardDir);
    forwardDir.y = 0;
    forwardDir.normalize();

    for (let i = 0; i < placedItems.length; i++) {
      const item = placedItems[i];
      const pos = item.position || [0, 0, 0];
      const itemPos = new THREE.Vector3(pos[0], 0, pos[2]);
      const dist = camPos.distanceTo(itemPos);

      if (dist < closestDist) {
        const toItem = itemPos.clone().sub(camPos).normalize();
        const dot = forwardDir.dot(toItem);
        if (dot > 0.45) { // Looking generally toward the prop
          closestDist = dist;
          closestItem = item;
        }
      }
    }

    setFocusedItem(closestItem);
  });

  return null;
}

// ----------------------------------------------------
// Main Player Escape View Component
// ----------------------------------------------------
export default function PlayerEscapeView({ room, onExit, onPlayAnother }) {
  const chambers = room?.layout_json?.chambers || [
    { id: 'grand_vault', name: 'Grand Vault', x: 0, z: 0, width: 6, depth: 6 }
  ];
  const placedItems = room?.layout_json?.placedItems || [];
  const roomCode = room?.room_code || 'FORGE-DEMO';
  const roomTitle = room?.title || 'Dungeon Vault';

  // Game States
  const [openedContainers, setOpenedContainers] = useState({});
  const [inventory, setInventory] = useState([]);
  const [activeClue, setActiveClue] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isEscaped, setIsEscaped] = useState(false);
  const [focusedItem, setFocusedItem] = useState(null);

  // Timer State (Stopwatch)
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (isEscaped) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [isEscaped]);

  const showToast = (msg, duration = 3200) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${tenths}`;
  };

  // Handle Prop Interaction
  const handleInteract = (item) => {
    if (isEscaped || !item) return;
    const role = item.logic?.role || 'none';

    // 1. Container / Chest
    if (role === 'container') {
      if (openedContainers[item.id]) {
        showToast(`Already searched ${item.name || 'this chest'}. It is empty.`);
        return;
      }
      const hidden = item.logic?.containsItem || { type: 'key', name: 'Royal Dungeon Key' };
      setOpenedContainers((prev) => ({ ...prev, [item.id]: true }));
      setInventory((prev) => [...prev, { name: hidden.name, type: hidden.type }]);
      try { audioSystem.playChime(); } catch (e) {}
      showToast(`🗝️ Found: ${hidden.name} inside ${item.name || 'chest'}!`);
      return;
    }

    // 2. Secret Clue Note / Wall Banner
    if (role === 'clue') {
      try { audioSystem.playClick(); } catch (e) {}
      document.exitPointerLock?.();
      setActiveClue(item.logic?.clueText || 'Search the gilded chest in the dark corner to claim your escape key.');
      return;
    }

    // 3. Exit Portcullis Gate
    if (role === 'exit_door') {
      const requiredKey = item.logic?.requiredKey || 'Royal Dungeon Key';
      const hasKey = inventory.some(
        (inv) => inv.name.toLowerCase().trim() === requiredKey.toLowerCase().trim()
      );

      if (!hasKey) {
        try { audioSystem.playThud(); } catch (e) {}
        showToast(`🔒 Exit Gate is locked! Requires: ${requiredKey}`);
      } else {
        // VICTORY ESCAPED!
        try { audioSystem.playChime(); } catch (e) {}
        document.exitPointerLock?.();
        setIsEscaped(true);
        try {
          const sec = (Date.now() - startTimeRef.current) / 1000;
          submitRoomRun(roomCode, 'Adventurer', sec);
        } catch (e) {}
      }
      return;
    }

    // 4. Other Prop
    try { audioSystem.playClick(); } catch (e) {}
    showToast(`${item.name || 'Dungeon Prop'} - Ancient stone artifact.`);
  };

  const isModalOpen = Boolean(activeClue || isEscaped);

  return (
    <EscapeErrorBoundary onExit={onExit}>
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-stone-950 select-none z-50 font-sans text-stone-100">
        {/* 1. TOP HUD */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={() => {
              document.exitPointerLock?.();
              onExit();
            }}
            className="bg-stone-900/90 hover:bg-stone-800 text-amber-300 hover:text-amber-100 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold transition border border-amber-500/30 shadow-xl cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Exit to Hub</span>
          </button>

          {/* Stopwatch Timer */}
          <div className="bg-stone-900/95 backdrop-blur-md px-5 py-2 rounded-2xl border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-amber-300">
              {formatTime(elapsedMs)}
            </span>
          </div>

          {/* Room Code Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/30 text-xs font-bold text-amber-200 shadow-xl">
            <span className="text-amber-400">{roomTitle}</span>
            <span className="text-stone-500">·</span>
            <span className="font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {roomCode}
            </span>
          </div>
        </div>

        {/* 2. TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="bg-stone-900/95 text-amber-200 border-2 border-amber-500/60 px-5 py-2.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-md">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* 3. FIRST PERSON CROSSHAIR & PROXIMITY INTERACTION BADGE */}
        {!isModalOpen && (
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center">
            {/* Center Reticle */}
            <div
              className={`w-3 h-3 rounded-full border-2 transition-all duration-150 ${
                focusedItem
                  ? 'border-amber-400 bg-amber-400/50 scale-150 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                  : 'border-white/60 bg-white/20'
              }`}
            />

            {/* In-Range Action Tooltip */}
            {focusedItem && (
              <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-950/90 border border-amber-500/60 text-amber-200 text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in zoom-in-95">
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-black uppercase">
                  E
                </span>
                <span>
                  {focusedItem.logic?.role === 'exit_door'
                    ? 'Unlock Exit Gate'
                    : focusedItem.logic?.role === 'container'
                    ? `Search ${focusedItem.name || 'Chest'}`
                    : focusedItem.logic?.role === 'clue'
                    ? 'Read Ancient Clue'
                    : `Inspect ${focusedItem.name || 'Prop'}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 4. CONTROLS HELPER BADGE */}
        <div className="absolute top-20 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[11px] text-slate-300 backdrop-blur-sm">
          <span className="font-mono font-bold text-amber-400">[W][A][S][D]</span> Walk
          <span className="text-slate-600">·</span>
          <span className="text-amber-400">Mouse</span> Look
          <span className="text-slate-600">·</span>
          <span className="font-mono font-bold text-amber-400">[E]</span> Interact
        </div>

        {/* 5. 3D FIRST PERSON ESCAPE ROOM CANVAS */}
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 100 }}
          shadows
          gl={{ antialias: true }}
          className="w-full h-full cursor-crosshair"
        >
          {/* Lighting Rig */}
          <ambientLight intensity={0.45} />
          <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />

          {/* First Person WASD Movement & Mouse Look Controller */}
          <FirstPersonController
            chambers={chambers}
            placedItems={placedItems}
            onInteractWithFocused={() => handleInteract(focusedItem)}
            setFocusedItem={setFocusedItem}
            isPaused={isModalOpen}
          />

          {/* Authentic Connected Modular Chambers (NO divider walls between connected rooms!) */}
          {chambers.map((ch, idx) => (
            <ConnectedDungeonChamber
              key={ch.id || idx}
              chamber={ch}
              allChambers={chambers}
            />
          ))}

          {/* Placed Interactive 3D Props */}
          {placedItems.map((item) => (
            <InteractiveProp
              key={item.id}
              item={item}
              isFocused={focusedItem?.id === item.id}
              isOpened={!!openedContainers[item.id]}
              onInteract={handleInteract}
            />
          ))}
        </Canvas>

        {/* 6. BOTTOM INVENTORY DOCK */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 bg-stone-900/95 backdrop-blur-md px-4 py-2.5 rounded-3xl border-2 border-amber-500/30 shadow-2xl max-w-[90vw] overflow-x-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 mr-1 flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            Inventory:
          </span>

          {inventory.length === 0 ? (
            <span className="text-xs text-stone-500 italic px-2">
              No keys collected yet. Explore the room!
            </span>
          ) : (
            inventory.map((inv, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs font-bold text-amber-200 shadow-sm animate-in zoom-in-90 duration-150"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{inv.name}</span>
              </div>
            ))
          )}
        </div>

        {/* 7. PARCHMENT CLUE MODAL */}
        {activeClue && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <div className="relative w-full max-w-sm bg-gradient-to-b from-[#fbf4e4] via-[#f5ebcf] to-[#ebdcb6] text-stone-900 border-4 border-[#8c6d37] rounded-3xl p-6 shadow-2xl text-center">
              <button
                onClick={() => setActiveClue(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-[#8c6d37]/20 hover:bg-[#8c6d37]/40 text-[#5c3e1e] transition"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center mx-auto mb-3 shadow">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#4a2e18] uppercase tracking-wide font-serif mb-2">
                Ancient Clue Found
              </h3>
              <p className="text-sm font-serif italic text-[#634526] leading-relaxed my-4 p-3 bg-[#ede1c2] rounded-xl border border-[#caa975]">
                &quot;{activeClue}&quot;
              </p>
              <button
                onClick={() => setActiveClue(null)}
                className="px-6 py-2 bg-[#4a2e18] hover:bg-[#38210e] text-[#f7e8c6] rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Fold Parchment
              </button>
            </div>
          </div>
        )}

        {/* 8. VICTORY MODAL: VAULT ESCAPED! */}
        {isEscaped && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in zoom-in-95 duration-300">
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#7a889b] via-[#637082] to-[#4e5a69] p-4 rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] border-2 border-[#3d4652] text-center text-stone-900">
              <div className="bg-gradient-to-b from-[#fbf4e4] via-[#f5ebcf] to-[#ebdcb6] rounded-3xl p-6 shadow-inner border border-[#d9c49a]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30 border-2 border-white">
                  <Trophy className="w-8 h-8 text-stone-950 stroke-[2.5]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#4a2e18] tracking-tight uppercase font-serif">
                  VAULT ESCAPED!
                </h2>
                <p className="text-xs font-bold text-[#7d5b36] mt-1 mb-4">
                  You conquered the dungeon chamber in first person!
                </p>
                <div className="p-4 bg-[#ebdcb4] rounded-2xl border-2 border-[#caa975] shadow-inner mb-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8a6033] block mb-0.5">
                    Final Escape Time
                  </span>
                  <span className="text-3xl font-mono font-black text-[#3d2410] tracking-widest">
                    {formatTime(elapsedMs)}
                  </span>
                  <p className="text-[11px] text-[#785b37] mt-1">
                    Room Code: <span className="font-mono font-bold text-[#4a2e18]">{roomCode}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  {onPlayAnother && (
                    <button
                      onClick={onPlayAnother}
                      className="w-full py-3 rounded-2xl bg-gradient-to-b from-[#ffb834] via-[#f39200] to-[#c76800] hover:from-[#ffc44d] hover:to-[#d67300] text-[#3d1e00] font-black text-sm uppercase tracking-wider border-b-4 border-[#8f4700] shadow-lg transition active:translate-y-1 cursor-pointer"
                    >
                      Play Another Community Room
                    </button>
                  )}
                  <button
                    onClick={onExit}
                    className="w-full py-2.5 rounded-2xl bg-[#4a2e18] hover:bg-[#38210e] text-[#f7e8c6] font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </EscapeErrorBoundary>
  );
}
