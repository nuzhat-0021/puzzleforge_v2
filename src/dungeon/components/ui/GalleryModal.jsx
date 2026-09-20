import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { X, Download, Trash2, Camera, Image as ImageIcon } from 'lucide-react';

export function GalleryModal({ isOpen, onClose, onOpenPhoto }) {
  const { snapshots, deleteSnapshot } = useRoom();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-3xl bg-stone-900 rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-bold shadow">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-amber-100 leading-tight">
                Vault Photo Album
              </h2>
              <p className="text-xs text-amber-400/70 font-medium">
                {snapshots.length} {snapshots.length === 1 ? 'Snapshot' : 'Snapshots'} Saved
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenPhoto();
            }}
            className="mr-10 bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            Take New Photo
          </button>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {snapshots.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-stone-800/60 border border-amber-500/20 flex items-center justify-center text-amber-400/40 mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-amber-200 mb-1">
                No Snapshots in Gallery Yet
              </h3>
              <p className="text-xs text-stone-400 max-w-xs mb-4">
                Decorate your dungeon vault and click the purple camera button to take your first Polaroid!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenPhoto();
                }}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Take Snapshot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="bg-stone-100 p-3 pb-4 rounded-2xl shadow-lg border-2 border-amber-200/50 flex flex-col transform hover:-translate-y-1 transition duration-200"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-950 mb-2 border border-stone-300">
                    <img
                      src={snap.dataUrl}
                      alt="Dungeon Snapshot"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between text-stone-700 text-[11px] font-bold px-1 mb-2">
                    <span>{snap.date}</span>
                    <span className="text-stone-500 font-normal">
                      {snap.chamberCount} Chambers · {snap.itemCount} Props
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-stone-200">
                    <a
                      href={snap.dataUrl}
                      download={`dungeon-vault-${snap.id}.png`}
                      className="flex-1 bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-white py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                    <button
                      onClick={() => deleteSnapshot(snap.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-200 transition"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
