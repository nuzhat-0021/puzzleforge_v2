import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { audioSystem } from '../../utils/audioSystem';
import { Download, Bookmark, X, Sparkles, Check } from 'lucide-react';

export function PhotoModal({ isOpen, onClose, canvasRef }) {
  const { saveSnapshot } = useRoom();
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [savedToGallery, setSavedToGallery] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef?.current) {
      try {
        audioSystem.playCameraShutter();
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setSnapshotUrl(dataUrl);
        setSavedToGallery(false);
      } catch (e) {
        console.error('Failed to capture canvas screenshot', e);
      }
    }
  }, [isOpen, canvasRef]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!snapshotUrl) return;
    const a = document.createElement('a');
    a.href = snapshotUrl;
    a.download = `my-cozy-dungeon-vault-${Date.now()}.png`;
    a.click();
    audioSystem.playCoin();
  };

  const handleSaveToGallery = () => {
    if (!snapshotUrl || savedToGallery) return;
    saveSnapshot(snapshotUrl);
    setSavedToGallery(true);
    audioSystem.playCoin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-stone-900 rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="text-lg font-extrabold text-amber-100">
            Dungeon Vault Polaroid
          </h2>
        </div>

        {/* Polaroid Card Frame */}
        <div className="bg-stone-100 p-4 pb-6 rounded-2xl shadow-2xl border-4 border-amber-200/60 flex flex-col items-center w-full max-w-sm transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
          <div className="w-full aspect-square bg-stone-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-stone-300">
            {snapshotUrl ? (
              <img
                src={snapshotUrl}
                alt="Cozy Dungeon Vault"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-stone-400">Capturing vault...</span>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between w-full px-2">
            <span className="font-serif italic font-bold text-stone-800 text-sm">
              My Cozy Dungeon Vault
            </span>
            <span className="font-mono text-[10px] text-stone-500 font-semibold">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 w-full max-w-sm">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            Download PNG
          </button>

          <button
            onClick={handleSaveToGallery}
            disabled={savedToGallery}
            className={`flex-1 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border transition active:scale-95 shadow-lg ${
              savedToGallery
                ? 'bg-emerald-600/80 border-emerald-400 text-white'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/30'
            }`}
          >
            {savedToGallery ? (
              <>
                <Check className="w-4 h-4" />
                Saved to Gallery!
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                Save to Gallery
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
