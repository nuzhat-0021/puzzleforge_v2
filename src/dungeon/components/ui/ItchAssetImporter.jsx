import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { Upload, X, Check, PackagePlus, Sparkles } from 'lucide-react';

export function ItchAssetImporter({ isOpen, onClose }) {
  const { registerCustomGlb } = useRoom();
  const [dragOver, setDragOver] = useState(false);
  const [importedName, setImportedName] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.name.match(/\.(glb|gltf)$/i)) {
      alert('Please upload a 3D GLTF or GLB file (e.g. from itch.io asset packs)!');
      return;
    }
    registerCustomGlb(file);
    setImportedName(file.name);
    setTimeout(() => {
      setImportedName('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
      <div className="cozy-glass w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-500/30 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300/60 hover:text-amber-100 p-1.5 rounded-xl hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-cozy text-lg font-bold text-amber-100">
              Import Itch.io 3D Pack
            </h2>
            <p className="text-xs text-amber-300/70">
              Load custom `.glb` or `.gltf` low-poly models
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition ${
            dragOver
              ? 'border-amber-400 bg-amber-500/20'
              : 'border-amber-500/30 bg-black/30 hover:border-amber-400/60'
          }`}
        >
          {importedName ? (
            <div className="flex flex-col items-center gap-2 text-emerald-400 font-bold text-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-7 h-7" />
              </div>
              Imported {importedName}! Adding to room...
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-amber-400 mb-3 animate-bounce" />
              <p className="text-sm font-bold text-amber-100 mb-1">
                Drag & Drop your .glb / .gltf file here
              </p>
              <p className="text-xs text-amber-300/60 mb-4">
                Works with Kenney, Quaternius, or any itch.io 3D model pack
              </p>

              <label className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-lg border border-amber-400/40 transition">
                Browse Files
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>

        {/* Hints */}
        <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300/70">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Supports standard binary GLTF 2.0
          </span>
          <span>Max File Size: ~50MB</span>
        </div>
      </div>
    </div>
  );
}
