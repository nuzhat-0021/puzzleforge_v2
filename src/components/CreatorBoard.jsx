import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Box } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';

// ----------------------------------------------------
// 3D Room Mesh Components (Zero character models/slots)
// ----------------------------------------------------
function RoomMesh({ templateId, isHovered }) {
  const groupRef = useRef();

  // Gentle continuous auto-rotation + slight speed boost on hover
  useFrame((_, delta) => {
    if (groupRef.current) {
      const speed = isHovered ? 0.6 : 0.3;
      groupRef.current.rotation.y += delta * speed;
    }
  });

  // Render specific themed room environment based on templateId
  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {templateId === 'dungeon' && (
        <>
          {/* Dungeon Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[3.6, 3.6]} />
            <meshStandardMaterial color="#262626" roughness={0.8} />
          </mesh>

          {/* Walls */}
          <mesh position={[0, 1.2, -1.8]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#1c1917" roughness={0.9} />
          </mesh>
          <mesh position={[-1.8, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#1c1917" roughness={0.9} />
          </mesh>
          <mesh position={[1.8, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#262626" roughness={0.9} />
          </mesh>

          {/* Central Stone Pedestal & Artifact */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 0.8, 8]} />
            <meshStandardMaterial color="#44403c" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <octahedronGeometry args={[0.25]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
          </mesh>

          {/* Warm Torch Lighting */}
          <pointLight position={[0, 1.8, 0]} color="#f59e0b" intensity={2.5} distance={5} />
        </>
      )}

      {templateId === 'office' && (
        <>
          {/* Office Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[3.6, 3.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Walls */}
          <mesh position={[0, 1.2, -1.8]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <mesh position={[-1.8, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <mesh position={[1.8, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>

          {/* Office Desk & Monitor Screen */}
          <mesh position={[0, 0.45, -0.4]}>
            <boxGeometry args={[1.6, 0.9, 0.8]} />
            <meshStandardMaterial color="#64748b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.1, -0.5]}>
            <boxGeometry args={[0.7, 0.45, 0.08]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
          </mesh>

          {/* Office Overhead Light */}
          <spotLight position={[0, 3, 1]} angle={0.6} penumbra={0.4} intensity={2.0} color="#e2e8f0" />
        </>
      )}

      {templateId === 'scifi' && (
        <>
          {/* Sci-Fi Metallic Grid Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[3.6, 3.6]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Sci-Fi Panels */}
          <mesh position={[0, 1.2, -1.8]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.4} />
          </mesh>
          <mesh position={[-1.8, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.4} />
          </mesh>
          <mesh position={[1.8, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#312e81" roughness={0.4} />
          </mesh>

          {/* Central Glowing Energy Pod */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 1.5, 16]} />
            <meshStandardMaterial color="#06b6d4" transparent opacity={0.65} emissive="#0891b2" emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#a5f3fc" emissive="#22d3ee" emissiveIntensity={1.2} />
          </mesh>

          {/* Neon Cyan Spotlight */}
          <pointLight position={[0, 1.2, 0]} color="#06b6d4" intensity={3.5} distance={6} />
        </>
      )}

      {templateId === 'asylum' && (
        <>
          {/* Cracked Asylum Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[3.6, 3.6]} />
            <meshStandardMaterial color="#111827" roughness={0.95} />
          </mesh>

          {/* Walls */}
          <mesh position={[0, 1.2, -1.8]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#1f2937" roughness={0.9} />
          </mesh>
          <mesh position={[-1.8, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#1f2937" roughness={0.9} />
          </mesh>
          <mesh position={[1.8, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[3.6, 2.4, 0.15]} />
            <meshStandardMaterial color="#374151" roughness={0.9} />
          </mesh>

          {/* Rusted Frame / Cage Structure */}
          <mesh position={[0, 0.5, -0.3]}>
            <boxGeometry args={[1.4, 0.7, 0.9]} />
            <meshStandardMaterial color="#4b5563" roughness={0.9} wireframe />
          </mesh>
          <mesh position={[0, 1.1, -0.3]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#84cc16" emissive="#4d7c0f" emissiveIntensity={0.7} />
          </mesh>

          {/* Eerie Greenish Spotlight */}
          <spotLight position={[0, 2.8, 0.5]} angle={0.5} penumbra={0.6} intensity={2.5} color="#a3e635" />
        </>
      )}
    </group>
  );
}

// ----------------------------------------------------
// 3D Canvas Container Component
// ----------------------------------------------------
function RoomCanvas({ templateId, isHovered }) {
  return (
    <Canvas
      camera={{ position: [3.2, 2.6, 3.8], fov: 45 }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 7, 4]} intensity={1.2} />
      <RoomMesh templateId={templateId} isHovered={isHovered} />
    </Canvas>
  );
}

// ----------------------------------------------------
// 4 ROOM TEMPLATES DATA
// ----------------------------------------------------
const ROOM_TEMPLATES = [
  {
    id: 'dungeon',
    title: 'Dungeon Vault',
    difficulty: 'Easy',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'office',
    title: 'Abandoned Office',
    difficulty: 'Medium',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'scifi',
    title: 'Sci-Fi Laboratory',
    difficulty: 'Hard',
    badgeStyle: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  {
    id: 'asylum',
    title: 'Creepy Asylum',
    difficulty: 'Expert',
    badgeStyle: 'bg-red-500/20 text-red-300 border-red-500/40',
  },
];

// ----------------------------------------------------
// CREATOR BOARD COMPONENT
// ----------------------------------------------------
export default function CreatorBoard({ onBack, onSelectTemplate }) {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const handleForge = () => {
    if (!selectedId) return;
    if (selectedId !== 'dungeon') {
      const tmpl = ROOM_TEMPLATES.find((t) => t.id === selectedId);
      alert(`${tmpl ? tmpl.title : 'This layout'} is currently under construction and coming soon! Please select the Dungeon Vault template to forge.`);
      return;
    }
    if (onSelectTemplate) {
      onSelectTemplate('dungeon');
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none z-50 font-sans">
      {/* 1. BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/creatorbg.jpg')" }}
      />

      {/* AMBIENT DARK BACKDROP OVERLAY */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] pointer-events-none" />

      {/* BACK BUTTON (TOP-LEFT FIXED) */}
      <button
        onClick={onBack}
        className="fixed top-6 left-8 z-30 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer backdrop-blur-md"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400" />
        <span>BACK TO DASHBOARD</span>
      </button>

      {/* 2. CENTERED TRANSLUCENT GLASS CONTAINER */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-[1100px] h-[82vh] max-h-[680px] bg-[#182832]/65 border border-cyan-500/20 backdrop-blur-lg shadow-[0_25px_70px_rgba(0,0,0,0.85)] rounded-[32px] md:rounded-[36px] p-6 md:p-8 flex flex-col justify-between overflow-hidden"
        >
          {/* 3. 2x2 GRID OF 4 ROOM PREVIEW CARDS */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0 mb-4">
            {ROOM_TEMPLATES.map((tmpl) => {
              const isSelected = selectedId === tmpl.id;
              const isHovered = hoveredId === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedId(tmpl.id)}
                  onMouseEnter={() => setHoveredId(tmpl.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#488796]/55 border-2 border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.5)] scale-[1.02]'
                      : isHovered
                      ? 'bg-[#488796]/55 border-cyan-300/60'
                      : 'bg-[#488796]/35 border-[#6ba4b2]/40'
                  }`}
                >
                  {/* 3D CANVAS VIEWPORT (BACKGROUND LAYER INSIDE CARD) */}
                  <div className="absolute inset-0 z-0">
                    <RoomCanvas templateId={tmpl.id} isHovered={isHovered || isSelected} />
                  </div>

                  {/* VIGNETTE GRADIENT FOR READABILITY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 pointer-events-none z-1" />

                  {/* TOP OVERLAY ROW: BADGES */}
                  <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-700/60 backdrop-blur-md text-slate-300 text-xs font-semibold">
                      <Box className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="uppercase text-[10px] tracking-wider font-mono">3D Room</span>
                    </div>
                  </div>

                  {/* BOTTOM OVERLAY ROW: TEMPLATE TITLE */}
                  <div className="relative z-10 p-4 pointer-events-none flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {tmpl.title}
                    </h3>
                    {isSelected && (
                      <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. BOTTOM ACTION FOOTER */}
          <div className="border-t border-slate-700/60 pt-4 flex items-center justify-between">
            {/* LEFT SIDE: GOLD STENCIL HEADER */}
            <div className="flex flex-col">
              <h2 className="text-amber-400 font-extrabold text-lg md:text-xl uppercase tracking-wider font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                select room template
              </h2>
              {selectedId ? (
                <span className="text-xs text-slate-300 font-medium">
                  Selected:{' '}
                  <span className="text-cyan-400 font-bold uppercase">
                    {ROOM_TEMPLATES.find((t) => t.id === selectedId)?.title}
                  </span>
                </span>
              ) : (
                <span className="text-xs text-slate-400">Choose a 3D environment template to forge</span>
              )}
            </div>

            {/* RIGHT SIDE: ACTION BUTTON */}
            <button
              onClick={handleForge}
              disabled={!selectedId}
              className={`px-6 md:px-8 py-3 rounded-xl flex items-center gap-2 text-sm md:text-base font-black tracking-wider uppercase transition-all shadow-lg ${
                selectedId
                  ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>FORGE THIS ROOM</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
