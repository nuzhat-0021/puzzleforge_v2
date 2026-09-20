import React, { useState } from 'react';
import { X, Copy, Check, Share2, Key, DoorClosed, Boxes } from 'lucide-react';
import { getPublishedRooms } from '../../utils/roomCodeGenerator';

export function PublishModal({ isOpen, onClose, publishedRoom }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen || !publishedRoom) return null;

  const roomCode = publishedRoom.room_code || 'FORGE-0000';
  const stats = publishedRoom.layout_json?.stats || {};
  const history = getPublishedRooms();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Stone Tablet Outer Frame */}
      <div className="relative w-full max-w-[440px] bg-gradient-to-b from-[#7a889b] via-[#637082] to-[#4e5a69] p-3.5 sm:p-4 rounded-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.5)] border-2 border-[#3d4652]">
        
        {/* Carved Stone Clip at Top Center */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-6 py-1.5 bg-gradient-to-b from-[#8f9eb2] via-[#6e7d90] to-[#556374] rounded-xl border-2 border-[#3d4652] shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.5)] flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3d4652] shadow-inner" />
          <div className="w-8 h-1 rounded-full bg-[#3d4652]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3d4652] shadow-inner" />
        </div>

        {/* 3D Glossy Red Game Exit Button on Corner */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-30 w-9 h-9 rounded-full bg-gradient-to-b from-[#ff6b6b] via-[#e02e2e] to-[#9e1313] border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.8)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform group"
          title="Close"
        >
          <X className="w-5 h-5 stroke-[3] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
        </button>

        {/* Pinned Parchment Paper Sheet */}
        <div className="relative bg-gradient-to-b from-[#fbf4e4] via-[#f5ebcf] to-[#ebdcb6] rounded-2xl p-5 sm:p-6 shadow-[inset_0_2px_8px_rgba(180,140,80,0.2),0_4px_12px_rgba(0,0,0,0.25)] border border-[#d9c49a] text-center overflow-hidden">
          
          {/* Subtle Corner Dog-Ear Fold (Bottom Left) */}
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-tr from-[#637082] to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#d4be90] border-t border-r border-[#bfa26e] rounded-tr-md shadow-sm pointer-events-none" />

          {/* Game Header Title */}
          <div className="mt-1 mb-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#4a2e18] uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
              VAULT PUBLISHED!
            </h2>
            
            {/* Game Divider with Center Diamond */}
            <div className="flex items-center justify-center gap-2 my-2 opacity-60">
              <div className="h-[1.5px] w-16 bg-[#8a6845]" />
              <div className="w-2 h-2 rotate-45 bg-[#8a6845]" />
              <div className="h-[1.5px] w-16 bg-[#8a6845]" />
            </div>

            <p className="text-xs font-bold text-[#7d5b36]">
              Your escape room is ready for players!
            </p>
          </div>

          {/* Sunken Parchment Room Code Box */}
          <div className="my-4 p-3.5 bg-[#ebdcb4] rounded-2xl border-2 border-[#caa975] shadow-[inset_0_2px_6px_rgba(100,70,30,0.25)]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8a6033] block mb-1">
              ✦ Shareable Room Code ✦
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-widest text-[#3d2410] font-mono select-all my-0.5">
              {roomCode}
            </div>
            <p className="text-[11px] font-medium text-[#7a5a36] mt-1">
              Friends can enter this code in PuzzleForge to play your room.
            </p>
          </div>

          {/* 3D Glossy Game Button (Amber/Gold Capsule with 3D Bevel) */}
          <button
            onClick={handleCopyCode}
            className={`w-full py-3 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-150 active:translate-y-1 ${
              copiedCode
                ? 'bg-gradient-to-b from-[#5cd66e] via-[#32a845] to-[#1e782c] text-white border-b-4 border-[#14551e] shadow-[0_6px_15px_rgba(30,120,44,0.4),inset_0_2px_3px_rgba(255,255,255,0.6)]'
                : 'bg-gradient-to-b from-[#ffb834] via-[#f39200] to-[#c76800] hover:from-[#ffc44d] hover:to-[#d67300] text-[#3d1e00] border-b-4 border-[#8f4700] shadow-[0_6px_15px_rgba(200,100,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.7)]'
            }`}
          >
            <div className="flex items-center justify-center gap-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
              {copiedCode ? (
                <>
                  <Check className="w-5 h-5 stroke-[3] text-white" />
                  <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    CODE COPIED!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 stroke-[2.5]" />
                  <span>SHARE ROOM CODE</span>
                </>
              )}
            </div>
          </button>

          {/* Mini Cute Game Stats */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[#dfcaa0] text-[11px] font-extrabold text-[#7d5a35]">
            <div className="flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-[#a8763f]" />
              <span>{stats.propsCount || 0} Props</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-[#a8763f]" />
              <span>{stats.containersCount || 0} Keys</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <DoorClosed className="w-3.5 h-3.5 text-[#a8763f]" />
              <span>{stats.hasExitDoor ? 'Exit Door' : 'Open'}</span>
            </div>
          </div>

          {/* History Drawer Toggle (If multiple versions exist) */}
          {history.length > 1 && (
            <div className="mt-2.5">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-[10px] font-bold text-[#8a6845] hover:text-[#4a2e18] underline transition"
              >
                {showHistory ? 'Hide Past Codes' : `Past Room Versions (${history.length})`}
              </button>

              {showHistory && (
                <div className="mt-2 max-h-24 overflow-y-auto space-y-1 text-left px-2 bg-[#ebdcb4]/60 rounded-xl p-1.5 border border-[#caa975]">
                  {history.map((h, idx) => (
                    <div
                      key={h.room_code || idx}
                      className="flex items-center justify-between text-[11px] font-mono font-bold text-[#4a2e18] py-0.5"
                    >
                      <span>{h.room_code}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(h.room_code);
                          alert(`Copied ${h.room_code}!`);
                        }}
                        className="text-[10px] font-bold text-[#f39200] hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
