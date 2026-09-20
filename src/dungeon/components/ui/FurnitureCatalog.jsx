import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { CATALOG_CATEGORIES, DUNGEON_CATALOG_ITEMS } from '../../utils/assetCatalog';
import { PropThumbnailImage } from './PropThumbnailImage';
import {
  Coins,
  Armchair,
  Flame,
  Castle,
  Shield,
  FlaskConical,
  Package,
  Search,
  Sparkles,
  Move
} from 'lucide-react';

const ICON_MAP = {
  Coins,
  Armchair,
  Flame,
  Castle,
  Shield,
  FlaskConical,
  Package
};

export function FurnitureCatalog() {
  const {
    addItemAt,
    setDraggingCatalogItem,
    setDragHoverPoint,
    sidebarMode,
    setSidebarMode
  } = useRoom();
  const [activeCategory, setActiveCategory] = useState('treasures');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = CATALOG_CATEGORIES.find((c) => c.id === activeCategory);

  const filteredItems = DUNGEON_CATALOG_ITEMS.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return (searchQuery ? true : matchesCategory) && matchesSearch;
  });

  // Start drag-and-drop into 3D scene on pointer down
  const handleItemPointerDown = (item, e) => {
    if (e.button !== 0) return;
    setDraggingCatalogItem(item);
    setDragHoverPoint([0, 0, 0]);
  };

  return (
    <div
      className={`absolute top-20 right-4 bottom-20 z-20 flex pointer-events-auto select-none transition-transform duration-300 ease-in-out ${
        sidebarMode === 'catalog' ? 'translate-x-0' : 'translate-x-[120%] pointer-events-none'
      }`}
    >
      {/* 1. Vertical Category Strip (Poki Style) */}
      <div className="flex flex-col items-center gap-1.5 bg-stone-900/90 backdrop-blur-xl p-2 rounded-3xl border border-amber-500/30 shadow-2xl mr-2">
        {CATALOG_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Sparkles;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery('');
              }}
              title={cat.label}
              className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border-2 ${
                isActive
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 border-amber-300 scale-105 shadow-lg'
                  : 'bg-stone-800/80 text-amber-200/70 border-stone-700/60 hover:bg-stone-700/80 hover:text-amber-100 hover:border-amber-400/40'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.4]" />
            </button>
          );
        })}
      </div>

      {/* 2. Two-Column Prop Shelf (Poki Style) */}
      <div className="w-[300px] flex flex-col bg-stone-900/95 backdrop-blur-2xl rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden p-3.5">
        {/* Header: Title & Search */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase">
                Vault Catalog
              </span>
              <h2 className="text-sm font-extrabold text-amber-100 leading-tight">
                {currentCategory?.label}
              </h2>
            </div>
            <span className="text-[11px] font-bold text-amber-300/60 bg-stone-800 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {filteredItems.length} props
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search props (chest, torch, coin...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950/70 border border-amber-500/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Drag Hint Banner */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] font-semibold text-amber-300">
          <Move className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>Drag card directly into dungeon or click to drop!</span>
        </div>

        {/* 2-Column Grid with Real 3D Thumbnails */}
        <div className="grid grid-cols-2 gap-2.5 flex-1 overflow-y-auto pr-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onPointerDown={(e) => handleItemPointerDown(item, e)}
              onClick={() => addItemAt(item, [0, 0, 0])}
              className="group relative bg-stone-950/80 hover:bg-stone-800/90 border-2 border-stone-800 hover:border-amber-400 rounded-2xl p-2 flex flex-col items-center justify-between cursor-grab active:cursor-grabbing transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Card Illustration Frame with Real 3D Rendered Prop Image */}
              <div
                className={`w-full aspect-square rounded-xl bg-gradient-to-br ${item.previewGradient} flex items-center justify-center relative overflow-hidden shadow-inner mb-1.5 p-1`}
              >
                <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition" />

                {/* 3D Rendered Thumbnail */}
                <PropThumbnailImage
                  modelPath={item.modelPath}
                  name={item.name}
                  category={item.category}
                />

                {/* Drag Handle Indicator */}
                <div className="absolute top-1.5 right-1.5 bg-stone-950/70 backdrop-blur-md rounded-lg p-1 opacity-0 group-hover:opacity-100 transition shadow">
                  <Move className="w-3 h-3 text-amber-300" />
                </div>
              </div>

              {/* Prop Label */}
              <span className="text-[11px] font-bold text-amber-100 text-center line-clamp-1 w-full group-hover:text-amber-300 transition">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Create Logic Action Button */}
        <div className="pt-2.5 mt-2 border-t border-amber-500/20">
          <button
            onClick={() => setSidebarMode('logic')}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] border border-amber-300/80 transition active:scale-95 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-stone-950 stroke-[2.5] group-hover:rotate-12 transition" />
            <span>Create Logic</span>
            <span className="text-stone-950 font-black group-hover:translate-x-0.5 transition">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
