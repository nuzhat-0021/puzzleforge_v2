import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { PropThumbnailImage } from './PropThumbnailImage';
import {
  ArrowLeft,
  Key,
  DoorClosed,
  FileText,
  Sparkles,
  Zap,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Box,
  Flame,
  Info,
  Rocket
} from 'lucide-react';

export function RoomLogicMenu({ onPublish }) {
  const {
    placedItems,
    selectedItemId,
    setSelectedItemId,
    sidebarMode,
    setSidebarMode,
    updateItemLogic
  } = useRoom();

  const selectedItem = placedItems.find((i) => i.id === selectedItemId);

  // Local state for editing selected prop's logic
  const currentLogic = selectedItem?.logic || { role: 'none' };
  const [activeRole, setActiveRole] = useState(currentLogic.role || 'none');
  const [requiredKey, setRequiredKey] = useState(currentLogic.requiredKey || 'Golden Vault Key');
  const [containType, setContainType] = useState(currentLogic.containsItem?.type || 'key');
  const [containName, setContainName] = useState(
    currentLogic.containsItem?.name || 'Golden Vault Key'
  );
  const [clueText, setClueText] = useState(
    currentLogic.clueText || 'The master key is hidden where the gold piles highest...'
  );

  // Sync state when selectedItem changes
  React.useEffect(() => {
    if (selectedItem) {
      const l = selectedItem.logic || { role: 'none' };
      setActiveRole(l.role || 'none');
      setRequiredKey(l.requiredKey || 'Golden Vault Key');
      setContainType(l.containsItem?.type || 'key');
      setContainName(l.containsItem?.name || 'Golden Vault Key');
      setClueText(l.clueText || 'The master key is hidden where the gold piles highest...');
    }
  }, [selectedItemId]);

  // Apply logic updates
  const handleSaveRole = (newRole) => {
    if (!selectedItem) return;
    setActiveRole(newRole);

    let logicData = { role: newRole };

    if (newRole === 'exit_door') {
      logicData.isLocked = true;
      logicData.requiredKey = requiredKey;
    } else if (newRole === 'container') {
      logicData.containsItem = {
        type: containType,
        name: containName,
        clueText: containType === 'note' ? clueText : undefined
      };
    } else if (newRole === 'clue') {
      logicData.clueText = clueText;
    } else if (newRole === 'trigger') {
      logicData.triggerMessage = 'A heavy mechanism echoes through the dungeon...';
    } else {
      logicData = { role: 'none' };
    }

    updateItemLogic(selectedItem.id, logicData);
  };

  // 1-Click Quick Auto-Wire Preset
  const handleAutoWire = () => {
    const door = placedItems.find(
      (i) =>
        i.catalogId?.includes('door') ||
        i.catalogId?.includes('portcullis') ||
        i.name?.toLowerCase().includes('door') ||
        i.name?.toLowerCase().includes('gate') ||
        i.name?.toLowerCase().includes('portcullis')
    ) || placedItems[placedItems.length - 1];

    const chest = placedItems.find(
      (i) =>
        i.catalogId?.includes('chest') ||
        i.name?.toLowerCase().includes('chest') ||
        i.name?.toLowerCase().includes('crate') ||
        i.name?.toLowerCase().includes('box')
    ) || placedItems[0];

    const banner = placedItems.find(
      (i) => i.catalogId?.includes('banner') || i.name?.toLowerCase().includes('banner')
    );

    if (door) {
      updateItemLogic(door.id, {
        role: 'exit_door',
        isLocked: true,
        requiredKey: 'Royal Dungeon Key'
      });
    }

    if (chest && chest.id !== door?.id) {
      updateItemLogic(chest.id, {
        role: 'container',
        containsItem: {
          type: 'key',
          name: 'Royal Dungeon Key'
        }
      });
    }

    if (banner && banner.id !== door?.id && banner.id !== chest?.id) {
      updateItemLogic(banner.id, {
        role: 'clue',
        clueText: 'Search the royal chest to find your freedom...'
      });
    }

    if (door) setSelectedItemId(door.id);
  };

  return (
    <div
      className={`absolute top-20 right-4 bottom-20 z-20 w-[350px] max-w-[calc(100vw-32px)] flex flex-col bg-stone-900/95 backdrop-blur-2xl rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden p-3.5 pointer-events-auto select-none transition-transform duration-300 ease-in-out ${
        sidebarMode === 'logic' ? 'translate-x-0' : 'translate-x-[120%] pointer-events-none'
      }`}
    >
      {/* 1. Header: Back Button & Title */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-amber-500/20">
        <button
          onClick={() => setSidebarMode('catalog')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-100 text-xs font-bold transition border border-amber-500/20 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Props</span>
        </button>

        <span className="text-[11px] font-bold text-amber-300/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
          {placedItems.length} {placedItems.length === 1 ? 'Prop' : 'Props'}
        </span>
      </div>

      <div className="mb-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              PuzzleForge Creator
            </span>
            <h2 className="text-sm font-extrabold text-amber-100 leading-tight">
              Room Logic & Puzzles
            </h2>
          </div>
          <button
            onClick={handleAutoWire}
            title="1-Click Auto-Setup: Sets up Key in Chest and Locked Exit Door"
            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-[10px] font-bold rounded-lg border border-amber-500/30 transition flex items-center gap-1 active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            Auto-Wire
          </button>
        </div>
      </div>

      {/* 2. Placed Items Scrollable List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-3">
        {placedItems.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-800 rounded-2xl text-stone-400">
            <Box className="w-8 h-8 text-amber-500/40 mb-2" />
            <p className="text-xs font-bold text-amber-200/80 mb-1">No Props in Vault</p>
            <p className="text-[11px] text-stone-400">
              Click &quot;Back to Props&quot; to drop chests, doors, and torches into your room first!
            </p>
          </div>
        ) : (
          placedItems.map((item) => {
            const isSel = selectedItemId === item.id;
            const role = item.logic?.role || 'none';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`group relative p-2 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                  isSel
                    ? 'bg-amber-500/15 border-amber-400 shadow-md scale-[1.02]'
                    : 'bg-stone-950/80 hover:bg-stone-800/80 border-stone-800/80 hover:border-amber-500/40'
                }`}
              >
                {/* 3D Model Thumbnail Image */}
                <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex-shrink-0 p-1 flex items-center justify-center overflow-hidden">
                  <PropThumbnailImage
                    modelPath={item.modelPath}
                    name={item.name}
                    category={item.category}
                  />
                </div>

                {/* Name & Logic Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-xs font-bold text-amber-100 truncate">{item.name}</h3>
                    {isSel && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
                    )}
                  </div>

                  {/* Puzzle Role Pill */}
                  <div className="flex items-center gap-1">
                    {role === 'exit_door' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold">
                        <DoorClosed className="w-2.5 h-2.5" />
                        Exit Door ({item.logic?.requiredKey || 'Key'})
                      </span>
                    )}
                    {role === 'container' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold">
                        <Key className="w-2.5 h-2.5" />
                        Hides: {item.logic?.containsItem?.name || 'Key'}
                      </span>
                    )}
                    {role === 'clue' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-extrabold">
                        <FileText className="w-2.5 h-2.5" />
                        Secret Clue
                      </span>
                    )}
                    {role === 'trigger' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold">
                        <Flame className="w-2.5 h-2.5" />
                        Trigger Switch
                      </span>
                    )}
                    {role === 'none' && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        Decorative · Click to wire
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Logic Configurator Drawer (When an Item is Selected) */}
      {selectedItem && (
        <div className="p-3 bg-stone-950/90 border border-amber-500/30 rounded-2xl shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-amber-300 truncate max-w-[200px]">
              Wiring: {selectedItem.name}
            </span>
            {activeRole !== 'none' && (
              <button
                onClick={() => handleSaveRole('none')}
                title="Reset to regular decor"
                className="text-stone-400 hover:text-red-400 p-1 rounded-md transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Choice Buttons */}
          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            <button
              onClick={() => handleSaveRole('exit_door')}
              className={`p-2 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 transition ${
                activeRole === 'exit_door'
                  ? 'bg-red-500 text-white border-red-400 shadow'
                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-red-400/50'
              }`}
            >
              <DoorClosed className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Exit Door</span>
            </button>

            <button
              onClick={() => handleSaveRole('container')}
              className={`p-2 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 transition ${
                activeRole === 'container'
                  ? 'bg-amber-500 text-stone-950 border-amber-300 shadow'
                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-400/50'
              }`}
            >
              <Key className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Hiding Spot</span>
            </button>

            <button
              onClick={() => handleSaveRole('clue')}
              className={`p-2 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 transition ${
                activeRole === 'clue'
                  ? 'bg-sky-500 text-stone-950 border-sky-300 shadow'
                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-sky-400/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Clue Note</span>
            </button>

            <button
              onClick={() => handleSaveRole('trigger')}
              className={`p-2 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 transition ${
                activeRole === 'trigger'
                  ? 'bg-purple-600 text-white border-purple-400 shadow'
                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-purple-400/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Switch</span>
            </button>
          </div>

          {/* Sub-Configs */}
          {activeRole === 'exit_door' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-300/80 block">
                Required Key to Escape:
              </label>
              <input
                type="text"
                value={requiredKey}
                onChange={(e) => {
                  setRequiredKey(e.target.value);
                  updateItemLogic(selectedItem.id, {
                    role: 'exit_door',
                    isLocked: true,
                    requiredKey: e.target.value
                  });
                }}
                placeholder="e.g. Golden Vault Key"
                className="w-full bg-stone-900 border border-red-500/30 rounded-xl px-2.5 py-1.5 text-xs text-amber-100 placeholder-stone-600 focus:outline-none focus:border-red-400 transition"
              />
            </div>
          )}

          {activeRole === 'container' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-300/80 block">
                Hidden Item Name:
              </label>
              <input
                type="text"
                value={containName}
                onChange={(e) => {
                  setContainName(e.target.value);
                  updateItemLogic(selectedItem.id, {
                    role: 'container',
                    containsItem: { type: containType, name: e.target.value }
                  });
                }}
                placeholder="e.g. Golden Vault Key"
                className="w-full bg-stone-900 border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-xs text-amber-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          )}

          {activeRole === 'clue' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-300/80 block">
                Parchment Clue Message:
              </label>
              <textarea
                rows={2}
                value={clueText}
                onChange={(e) => {
                  setClueText(e.target.value);
                  updateItemLogic(selectedItem.id, {
                    role: 'clue',
                    clueText: e.target.value
                  });
                }}
                placeholder="Write secret clue..."
                className="w-full bg-stone-900 border border-sky-500/30 rounded-xl px-2.5 py-1.5 text-xs text-amber-100 placeholder-stone-600 focus:outline-none focus:border-sky-400 transition resize-none"
              />
            </div>
          )}

          {activeRole === 'trigger' && (
            <p className="text-[11px] text-purple-300/90 font-medium">
              Interacting with this prop will trigger a mechanism click sound effect.
            </p>
          )}
        </div>
      )}

      {/* 4. Publish Room Button */}
      <div className="mt-2.5 pt-2 border-t border-amber-500/20">
        <button
          onClick={onPublish}
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
        >
          <Rocket className="w-4 h-4 stroke-[2.5]" />
          <span>Publish Vault & Get Code</span>
        </button>
      </div>
    </div>
  );
}
