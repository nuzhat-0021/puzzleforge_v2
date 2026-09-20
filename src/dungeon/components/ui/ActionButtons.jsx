import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { Camera, Image as GalleryIcon, Volume2, VolumeX } from 'lucide-react';

export function ActionButtons({ onOpenPhoto, onOpenGallery }) {
  const { soundMuted, toggleSound } = useRoom();

  return (
    <div className="absolute bottom-5 left-5 z-20 flex items-center gap-3 pointer-events-auto select-none">
      {/* 🟣 Purple Camera Button (Poki Style) */}
      <button
        onClick={onOpenPhoto}
        title="Take Dungeon Snapshot"
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 hover:from-purple-400 hover:to-indigo-600 text-white flex items-center justify-center shadow-2xl border-2 border-purple-300 hover:scale-105 active:scale-95 transition-all group"
      >
        <Camera className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>

      {/* 🟠 Orange Gallery Button (Poki Style) */}
      <button
        onClick={onOpenGallery}
        title="View Vault Photo Gallery"
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white flex items-center justify-center shadow-2xl border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all group"
      >
        <GalleryIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>

      {/* 🔵 Blue Sound Toggle Button (Poki Style) */}
      <button
        onClick={toggleSound}
        title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border-2 transition-all group hover:scale-105 active:scale-95 ${
          soundMuted
            ? 'bg-gradient-to-br from-stone-600 to-stone-800 text-stone-300 border-stone-500'
            : 'bg-gradient-to-br from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white border-sky-300'
        }`}
      >
        {soundMuted ? (
          <VolumeX className="w-7 h-7 text-stone-300 group-hover:scale-110 transition-transform" />
        ) : (
          <Volume2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
}
