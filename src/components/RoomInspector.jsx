import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { ArrowLeft, Sparkles, Box, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// ----------------------------------------------------
// 3D Model Component with Traversal & Asset Logging
// ----------------------------------------------------
function DungeonModel({ onAssetsLoaded }) {
  const { scene } = useGLTF('/modular_dungeon/scene.gltf');

  useEffect(() => {
    if (!scene) return;

    const registry = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        registry.push({
          id: child.uuid,
          name: child.name || 'Unnamed_Mesh',
          type: child.type,
          geometryType: child.geometry?.type || 'BufferGeometry',
          materialName: Array.isArray(child.material)
            ? child.material.map((m) => m.name).join(', ')
            : child.material?.name || 'DefaultMaterial',
        });
      }
    });

    console.log(`[RoomInspector] Traversed scene hierarchy. Registered ${registry.length} sub-meshes:`, registry);
    if (onAssetsLoaded) {
      onAssetsLoaded(registry);
    }
  }, [scene, onAssetsLoaded]);

  return <primitive object={scene} position={[0, 0, 0]} />;
}

// ----------------------------------------------------
// Canvas Fallback Loading Spinner
// ----------------------------------------------------
function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 bg-slate-950/80 border border-cyan-500/30 p-6 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.3)]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-cyan-300 tracking-wider uppercase font-mono">
          Loading Dungeon Vault 3D...
        </span>
      </div>
    </Html>
  );
}

// ----------------------------------------------------
// Main RoomInspector Component
// ----------------------------------------------------
export default function RoomInspector({ onBack, onStartForging }) {
  const [assetRegistry, setAssetRegistry] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleAssetsLoaded = (registry) => {
    setAssetRegistry(registry);
    setIsLoaded(true);
  };

  const handleForgingClick = () => {
    if (onStartForging) {
      onStartForging(assetRegistry);
    } else {
      alert(`Transitioning to Stage 3 Object Placement with ${assetRegistry.length} placeable props!`);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans z-50">
      
      {/* 1. TOP GLASSMORPHISM OVERLAY BAR */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-950/70 border-b border-cyan-500/20 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-2xl">
        {/* LEFT: BACK BUTTON */}
        <button
          onClick={onBack}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>BACK TO CREATOR BOARD</span>
        </button>

        {/* CENTER: TITLE TAG */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-amber-500/40 px-5 py-2 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Box className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs md:text-sm font-black text-amber-300 tracking-widest uppercase font-serif">
            INSPECTING: DUNGEON VAULT
          </span>
        </div>

        {/* RIGHT: START FORGING BUTTON */}
        <button
          onClick={handleForgingClick}
          className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-black px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4.5 h-4.5" />
          <span>START FORGING THIS ROOM</span>
        </button>
      </div>

      {/* 2. 3D CANVAS VIEWPORT */}
      <Canvas
        camera={{ position: [10, 8, 12], fov: 50 }}
        shadows
        className="w-full h-full"
        gl={{ antialias: true, alpha: false }}
      >
        {/* LIGHTING SETUP */}
        {/* Warm torch ambient light */}
        <ambientLight intensity={0.4} color="#ffedd5" />
        
        {/* Directional light casting shadows from top-right */}
        <directionalLight
          position={[12, 15, 8]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Point light in main room corridor */}
        <pointLight
          position={[3, 2, 0]}
          color="#f59e0b"
          intensity={2.0}
          distance={14}
        />

        {/* ORBIT CONTROLS CONFIGURATION */}
        <OrbitControls
          target={[3, 0, 0]}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.1}
          makeDefault
        />

        {/* 3D MODEL WITH SUSPENSE */}
        <Suspense fallback={<CanvasLoader />}>
          <DungeonModel onAssetsLoaded={handleAssetsLoaded} />
        </Suspense>
      </Canvas>

      {/* 3. BOTTOM-LEFT HUD BADGE FOR PROPS INDEXED */}
      {isLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 z-40 bg-slate-900/85 border border-cyan-500/30 px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center gap-2.5 shadow-xl pointer-events-none"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Asset Registry
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {assetRegistry.length} Sub-mesh Props Loaded
            </span>
          </div>
        </motion.div>
      )}

      {/* 4. BOTTOM-RIGHT CONTROLS HINT */}
      <div className="fixed bottom-6 right-6 z-40 bg-slate-900/85 border border-slate-700/60 px-4 py-2 rounded-xl backdrop-blur-md text-[11px] text-slate-400 font-mono flex items-center gap-3 pointer-events-none">
        <span>🖱️ Drag to Orbit</span>
        <span>•</span>
        <span>Scroll to Zoom</span>
        <span>•</span>
        <span>Center: [3, 0, 0]</span>
      </div>
    </div>
  );
}
