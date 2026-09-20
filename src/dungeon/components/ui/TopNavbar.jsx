import React from 'react';
import { useRoom } from '../../context/RoomContext';
import {
  Sparkles,
  Flame,
  Gem,
  Moon,
  Music,
  Grid,
  Save,
  Trash2,
  RotateCcw,
  Undo2,
  Rocket,
  ArrowLeft
} from 'lucide-react';

export function TopNavbar({ onPublish, onBack }) {
  const {
    chambers,
    placedItems,
    lightingMode,
    setLightingMode,
    gridSnap,
    setGridSnap,
    bgmPlaying,
    toggleBgm,
    saveLayout,
    clearAllProps,
    resetDungeonLayout,
    undo,
    canUndo
  } = useRoom();

  const handleClear = () => {
    if (window.confirm('Clear all placed props in your dungeon vault?')) {
      clearAllProps();
    }
  };

  const handleResetVault = () => {
    if (
      window.confirm(
        'Reset dungeon back to a clean, single Grand Vault? This will reset the extra chambers.'
      )
    ) {
      resetDungeonLayout();
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto select-none">
      {/* Brand & Logo + Back Button */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-stone-900/90 hover:bg-stone-800 text-amber-300 hover:text-amber-100 px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition border border-amber-500/30 shadow-lg cursor-pointer active:scale-95"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        )}
        <div className="bg-stone-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-amber-500/30 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-md">
            <Sparkles className="w-5 h-5 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-amber-100 leading-tight">
              Dungeon Vault
            </h1>
            <p className="text-xs text-amber-400/80 font-medium">
              {chambers.length} {chambers.length === 1 ? 'Chamber' : 'Chambers'} · {placedItems.length} Props Placed
            </p>
          </div>
        </div>
      </div>

      {/* Center Controls: Lighting Moods & Tavern Lo-Fi */}
      <div className="hidden md:flex items-center gap-2 bg-stone-900/90 backdrop-blur-xl px-3 py-2 rounded-2xl border border-amber-500/20 shadow-2xl">
        {/* Mood Presets */}
        <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-xl">
          <button
            onClick={() => setLightingMode('torchlight')}
            title="Warm Torchlight"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              lightingMode === 'torchlight'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Torchlight
          </button>
          <button
            onClick={() => setLightingMode('crystal')}
            title="Mystic Crystals"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              lightingMode === 'crystal'
                ? 'bg-sky-500 text-stone-950 shadow-md'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            Crystal
          </button>
          <button
            onClick={() => setLightingMode('midnight')}
            title="Midnight Crypt"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              lightingMode === 'midnight'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Midnight
          </button>
        </div>

        <div className="w-px h-6 bg-stone-700 mx-1" />

        {/* Tavern Lo-Fi Music Toggle */}
        <button
          onClick={toggleBgm}
          title={bgmPlaying ? 'Pause Lo-Fi Tavern Music' : 'Play Lo-Fi Tavern Music'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            bgmPlaying
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 border-amber-300 shadow-md animate-pulse'
              : 'bg-stone-950/70 text-amber-300/80 border-amber-500/20 hover:text-amber-100 hover:bg-white/5'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>{bgmPlaying ? 'Tavern Music Playing' : 'Tavern Lo-Fi'}</span>
        </button>
      </div>

      {/* Right Controls: Undo, Grid Snap, Save, Reset Vault, Clear */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          title={canUndo ? 'Undo Last Action (Ctrl+Z)' : 'Nothing to undo'}
          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center shadow-md active:scale-95 ${
            canUndo
              ? 'bg-stone-900/90 hover:bg-amber-900/40 text-amber-300 border-amber-500/30 hover:border-amber-400 cursor-pointer'
              : 'bg-stone-900/40 text-stone-600 border-stone-800/60 cursor-not-allowed opacity-50'
          }`}
        >
          <Undo2 className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={() => setGridSnap(!gridSnap)}
          title="Toggle Grid Snap (0.5m)"
          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center ${
            gridSnap
              ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md'
              : 'bg-stone-900/90 text-amber-300/60 border-amber-500/20 hover:text-amber-100'
          }`}
        >
          <Grid className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          onClick={saveLayout}
          title="Save Dungeon Vault Layout"
          className="bg-stone-900/90 hover:bg-amber-900/40 text-amber-200 p-2.5 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-all shadow-md active:scale-95"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          onClick={onPublish}
          title="Publish Room & Generate Unique Code"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black px-3.5 py-2.5 rounded-2xl border border-amber-300 transition-all shadow-lg flex items-center gap-1.5 text-xs active:scale-95"
        >
          <Rocket className="w-4 h-4 stroke-[2.5]" />
          <span>Publish</span>
        </button>

        <button
          onClick={handleResetVault}
          title="Reset Dungeon to Clean Single Grand Vault"
          className="bg-stone-900/90 hover:bg-amber-900/40 text-amber-300 p-2.5 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-all shadow-md active:scale-95"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          onClick={handleClear}
          title="Clear All Props"
          className="bg-stone-900/90 hover:bg-red-900/40 text-red-400 p-2.5 rounded-2xl border border-red-500/30 hover:border-red-400 transition-all shadow-md active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
