import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
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
  Boxes,
  HelpCircle
} from 'lucide-react';
import { DungeonModel } from '../dungeon/components/3d/DungeonModel';
import { audioSystem } from '../dungeon/utils/audioSystem';
import { submitRoomRun } from '../utils/communityRoomPool';

// ----------------------------------------------------
// Error Boundary to prevent any white screen crashes
// ----------------------------------------------------
class EscapeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Escape Room 3D Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-stone-950 text-amber-200 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Notice: 3D Scene Loading Fallback</h2>
          <p className="text-xs text-stone-400 max-w-md mb-4">
            A graphic element could not be initialized directly. Click below to return to the hub.
          </p>
          <button
            onClick={this.props.onExit}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-sm"
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
// Standalone 3D Dungeon Chamber for Player Mode
// (Never calls useRoom, 100% crash-proof)
// ----------------------------------------------------
function PlayerChamber({ chamber }) {
  const x = chamber.x || 0;
  const z = chamber.z || 0;
  const width = chamber.width || 6;
  const depth = chamber.depth || 6;
  const height = 3;

  return (
    <group position={[x, 0, z]}>
      {/* Stone Floor Slab */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color="#292524" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Decorative Floor Grid Inlay */}
      <gridHelper
        args={[width, Math.round(width / 2), '#78716c', '#44403c']}
        position={[0, 0.01, 0]}
      />

      {/* Back Wall (Cutaway roof & front for isometric visibility) */}
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, height, depth]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[width / 2, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, height, depth]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>

      {/* Corner Wall Pillars */}
      <mesh position={[-width / 2 + 0.2, height / 2, -depth / 2 + 0.2]}>
        <boxGeometry args={[0.5, height + 0.2, 0.5]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.95} />
      </mesh>
      <mesh position={[width / 2 - 0.2, height / 2, -depth / 2 + 0.2]}>
        <boxGeometry args={[0.5, height + 0.2, 0.5]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.95} />
      </mesh>

      {/* Warm Wall Torch Pointlights */}
      <pointLight position={[0, 2.2, -depth / 2 + 0.5]} intensity={1.8} color="#f59e0b" distance={8} />
      <pointLight position={[-width / 2 + 0.5, 2.2, 0]} intensity={1.4} color="#f97316" distance={7} />
      <pointLight position={[width / 2 - 0.5, 2.2, 0]} intensity={1.4} color="#f97316" distance={7} />
    </group>
  );
}

// ----------------------------------------------------
// 3D Placed Prop in Player Mode
// ----------------------------------------------------
function PlayerProp({ item, onInteract, isOpened }) {
  const [hovered, setHovered] = useState(false);
  const role = item.logic?.role || 'none';
  const pos = item.position || [0, 0, 0];
  const rot = item.rotation || [0, 0, 0];
  const scale = item.scale || 1.2;
  const numScale = typeof scale === 'number' ? scale : 1.2;

  return (
    <group
      position={pos}
      rotation={rot}
      onClick={(e) => {
        e.stopPropagation();
        onInteract(item);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* 3D Model with Fallback Geometry */}
      <Suspense
        fallback={
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
        }
      >
        <DungeonModel
          modelPath={item.modelPath}
          scale={numScale}
          isSelected={false}
          isHovered={hovered}
        />
      </Suspense>

      {/* Subtle Glowing Aura on Hover */}
      {hovered && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 24]} />
          <meshBasicMaterial
            color={
              role === 'exit_door'
                ? '#ef4444'
                : role === 'container'
                ? '#f59e0b'
                : role === 'clue'
                ? '#0ea5e9'
                : '#e2e8f0'
            }
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Green Diamond Marker above Opened / Looted Containers */}
      {isOpened && (
        <mesh position={[0, 0.9, 0]}>
          <octahedronGeometry args={[0.1]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      )}
    </group>
  );
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
    if (isEscaped) return;
    const role = item.logic?.role || 'none';

    // 1. Container / Hiding Spot
    if (role === 'container') {
      if (openedContainers[item.id]) {
        showToast(`Already searched ${item.name || 'this chest'}. It is empty.`);
        return;
      }

      const hidden = item.logic?.containsItem || { type: 'key', name: 'Royal Dungeon Key' };
      setOpenedContainers((prev) => ({ ...prev, [item.id]: true }));
      setInventory((prev) => [...prev, { name: hidden.name, type: hidden.type }]);
      try { audioSystem.playChime(); } catch(e) {}
      showToast(`🗝️ Found: ${hidden.name} inside ${item.name || 'chest'}!`);
      return;
    }

    // 2. Secret Clue Note
    if (role === 'clue') {
      try { audioSystem.playClick(); } catch(e) {}
      setActiveClue(item.logic?.clueText || 'Search the gilded chest in the dark corner to claim your escape key.');
      return;
    }

    // 3. Mechanism Switch
    if (role === 'trigger') {
      try { audioSystem.playClick(); } catch(e) {}
      showToast('⚙️ A mechanism clicks deep within the stone walls...');
      return;
    }

    // 4. Exit Door
    if (role === 'exit_door') {
      const requiredKey = item.logic?.requiredKey || 'Royal Dungeon Key';
      const hasKey = inventory.some(
        (inv) => inv.name.toLowerCase().trim() === requiredKey.toLowerCase().trim()
      );

      if (!hasKey) {
        try { audioSystem.playThud(); } catch(e) {}
        showToast(`🔒 Exit Gate is locked! Requires: ${requiredKey}`);
      } else {
        // VICTORY ESCAPED!
        try { audioSystem.playChime(); } catch(e) {}
        setIsEscaped(true);
        try {
          const sec = (Date.now() - startTimeRef.current) / 1000;
          submitRoomRun(roomCode, 'Adventurer', sec);
        } catch(e) {}
      }
      return;
    }

    // 5. Normal Decorative Prop
    try { audioSystem.playClick(); } catch(e) {}
    showToast(`${item.name || 'Dungeon Prop'} - Ancient stone artifact.`);
  };

  return (
    <EscapeErrorBoundary onExit={onExit}>
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-stone-950 select-none z-50 font-sans text-stone-100">
        
        {/* 1. TOP HUD */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={onExit}
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

        {/* 3. 3D ESCAPE ROOM CANVAS */}
        <Canvas
          camera={{ position: [0, 9, 11], fov: 45, near: 0.1, far: 200 }}
          shadows
          gl={{ antialias: true }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={3}
            maxDistance={40}
            maxPolarAngle={Math.PI / 2 - 0.05}
            target={[0, 0.5, 0]}
          />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[8, 16, 8]} intensity={0.8} castShadow />

          {/* Render Standalone Chambers */}
          {chambers.map((ch, idx) => (
            <PlayerChamber key={ch.id || idx} chamber={ch} />
          ))}

          {/* Contact Shadows */}
          <ContactShadows position={[0, 0.001, 0]} opacity={0.6} scale={20} blur={2} far={4} color="#1c1917" />

          {/* Render Interactive Props */}
          {placedItems.map((item) => (
            <PlayerProp
              key={item.id}
              item={item}
              isOpened={!!openedContainers[item.id]}
              onInteract={handleInteract}
            />
          ))}
        </Canvas>

        {/* 4. BOTTOM INVENTORY DOCK */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 bg-stone-900/95 backdrop-blur-md px-4 py-2.5 rounded-3xl border-2 border-amber-500/30 shadow-2xl max-w-[90vw] overflow-x-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 mr-1 flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            Inventory:
          </span>

          {inventory.length === 0 ? (
            <span className="text-xs text-stone-500 italic px-2">
              No keys collected yet. Search the room!
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

        {/* 5. PARCHMENT CLUE MODAL */}
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
                className="px-6 py-2 bg-[#4a2e18] hover:bg-[#38210e] text-[#f7e8c6] rounded-xl font-bold text-xs uppercase tracking-wider transition"
              >
                Fold Parchment
              </button>
            </div>
          </div>
        )}

        {/* 6. VICTORY MODAL: VAULT ESCAPED! */}
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
                  You cracked the puzzles and conquered the dungeon chamber.
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
                      className="w-full py-3 rounded-2xl bg-gradient-to-b from-[#ffb834] via-[#f39200] to-[#c76800] hover:from-[#ffc44d] hover:to-[#d67300] text-[#3d1e00] font-black text-sm uppercase tracking-wider border-b-4 border-[#8f4700] shadow-lg transition active:translate-y-1"
                    >
                      Play Another Community Room
                    </button>
                  )}
                  <button
                    onClick={onExit}
                    className="w-full py-2.5 rounded-2xl bg-[#4a2e18] hover:bg-[#38210e] text-[#f7e8c6] font-bold text-xs uppercase tracking-wider transition"
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
