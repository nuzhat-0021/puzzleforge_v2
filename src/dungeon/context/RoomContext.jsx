import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
const confetti = (opts) => {
  if (typeof window !== 'undefined' && window.confetti) {
    try { window.confetti(opts); } catch(e) {}
  }
};
import { DUNGEON_CATALOG_ITEMS } from '../utils/assetCatalog';
import { audioSystem } from '../utils/audioSystem';

const RoomContext = createContext(null);

const CHAMBER_NAMES = [
  'Royal Treasury',
  'Dragon Hoard',
  'Alchemist Sanctum',
  'Knights Armory',
  'Ancient Throne Hall',
  'Secret Relic Vault',
  'Crystal Cavern',
  'Sunken Crypt'
];

export function RoomProvider({ children }) {
  // 1. Multi-Chamber Dungeon Layout
  const [chambers, setChambers] = useState([
    {
      id: 'chamber-main',
      name: 'Grand Vault',
      gridX: 0,
      gridZ: 0,
      x: 0,
      z: 0,
      width: 6,
      depth: 6,
      wallTheme: 'stone',
      floorTheme: 'slab'
    }
  ]);

  // 2. Placed Dungeon Props
  const [placedItems, setPlacedItems] = useState([
    {
      id: 'prop-init-chest',
      catalogId: 'chest-gold',
      name: 'Gilded Royal Chest',
      category: 'treasures',
      modelPath: '/models/dungeon/chest_gold.gltf',
      position: [0, 0, -0.3],
      rotation: [0, 0, 0],
      scale: 1.3,
      soundType: 'coin',
      isWallItem: false
    },
    {
      id: 'prop-init-coins-1',
      catalogId: 'coin-stack-large',
      name: 'Grand Gold Hoard',
      category: 'treasures',
      modelPath: '/models/dungeon/coin_stack_large.gltf',
      position: [1.6, 0, 0.4],
      rotation: [0, Math.PI / 4, 0],
      scale: 1.4,
      soundType: 'coin',
      isWallItem: false
    },
    {
      id: 'prop-init-coins-2',
      catalogId: 'coin-stack-small',
      name: 'Coin Cache',
      category: 'treasures',
      modelPath: '/models/dungeon/coin_stack_small.gltf',
      position: [1.8, 0, -1.0],
      rotation: [0, 0, 0],
      scale: 1.3,
      soundType: 'coin',
      isWallItem: false
    },
    {
      id: 'prop-init-torch-standing',
      catalogId: 'torch-lit-standing',
      name: 'Standing Fire Torch',
      category: 'lighting',
      modelPath: '/models/dungeon/torch_lit.gltf',
      position: [-2.2, 0, 1.8],
      rotation: [0, 0, 0],
      scale: 1.3,
      soundType: 'torch',
      isWallItem: false
    },
    {
      id: 'prop-init-banner',
      catalogId: 'banner-red-royal',
      name: 'Royal Red Banner',
      category: 'armory',
      modelPath: '/models/dungeon/banner_red.gltf',
      position: [0, 2.0, -2.88],
      rotation: [0, 0, 0],
      scale: 1.3,
      soundType: 'wood',
      isWallItem: true
    },
    {
      id: 'prop-init-pillar',
      catalogId: 'pillar-decorated',
      name: 'Carved Vault Pillar',
      category: 'architecture',
      modelPath: '/models/dungeon/pillar_decorated.gltf',
      position: [-2.4, 0, -2.4],
      rotation: [0, 0, 0],
      scale: 1.2,
      soundType: 'stone',
      isWallItem: false
    }
  ]);

  // 3. Selection & Interaction State
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(0.5);

  // 4. Drag & Drop Pipeline State
  const [draggingCatalogItem, setDraggingCatalogItem] = useState(null);
  const [dragHoverPoint, setDragHoverPoint] = useState(null);
  const [draggingSceneItemId, setDraggingSceneItemId] = useState(null);

  // 5. Lighting & Mood Mode
  const [lightingMode, setLightingMode] = useState('torchlight'); // 'torchlight' | 'crystal' | 'midnight'

  // 6. Audio State
  const [soundMuted, setSoundMuted] = useState(false);
  const [bgmPlaying, setBgmPlaying] = useState(false);

  // 7. Saved Photos & Gallery
  const [snapshots, setSnapshots] = useState([]);

  // 8. Undo History Stack
  const [undoStack, setUndoStack] = useState([]);

  // 9. Creator Sidebar Mode ('catalog' | 'logic')
  const [sidebarMode, setSidebarMode] = useState('catalog');

  // Update puzzle logic for a placed item
  const updateItemLogic = (id, logicData) => {
    recordHistory();
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          logic: {
            ...(item.logic || {}),
            ...logicData
          }
        };
      })
    );
    audioSystem.playPop();
  };

  // Save current state to undo history before an action
  const recordHistory = () => {
    setUndoStack((prev) => [
      ...prev.slice(-19),
      {
        placedItems: placedItems.map((item) => ({
          ...item,
          position: [...item.position],
          rotation: [...item.rotation]
        })),
        chambers: [...chambers]
      }
    ]);
  };

  // Undo last action
  const undo = () => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const previousState = prev[prev.length - 1];
      if (previousState.placedItems) setPlacedItems(previousState.placedItems);
      if (previousState.chambers) setChambers(previousState.chambers);
      return prev.slice(0, prev.length - 1);
    });
    setSelectedItemId(null);
    audioSystem.playPop();
  };

  // Listen for Ctrl+Z / Cmd+Z keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack]);

  const isLoadedRef = useRef(false);

  // Load saved dungeon layout from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cozy_dungeon_vault_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.chambers?.length) setChambers(parsed.chambers);
        if (parsed.placedItems?.length) {
          const cleaned = parsed.placedItems.map((item) => {
            if (
              (item.catalogId === 'wall-doorway-arch' ||
                item.catalogId === 'wall-portcullis' ||
                item.category === 'architecture') &&
              item.position[1] > 0.1
            ) {
              return { ...item, position: [item.position[0], 0, item.position[2]], isWallItem: false };
            }
            return item;
          });
          setPlacedItems(cleaned);
        }
        if (parsed.lightingMode) setLightingMode(parsed.lightingMode);
      }

      const savedPhotos = localStorage.getItem('cozy_dungeon_snapshots');
      if (savedPhotos) {
        setSnapshots(JSON.parse(savedPhotos));
      }
    } catch (e) {
      console.warn('Could not load saved dungeon layout', e);
    } finally {
      isLoadedRef.current = true;
    }
  }, []);

  // Continuous Auto-Save: Automatically persists any change to localStorage
  useEffect(() => {
    if (!isLoadedRef.current) return;

    const timer = setTimeout(() => {
      try {
        const data = JSON.stringify({ chambers, placedItems, lightingMode });
        localStorage.setItem('cozy_dungeon_vault_save', data);
      } catch (e) {
        console.warn('Auto-save failed', e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [chambers, placedItems, lightingMode]);

  // Flush save immediately if laptop sleeps, tab closes, or user switches tabs
  useEffect(() => {
    const handleImmediateSave = () => {
      if (isLoadedRef.current) {
        try {
          const data = JSON.stringify({ chambers, placedItems, lightingMode });
          localStorage.setItem('cozy_dungeon_vault_save', data);
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', handleImmediateSave);
    document.addEventListener('visibilitychange', handleImmediateSave);
    return () => {
      window.removeEventListener('beforeunload', handleImmediateSave);
      document.removeEventListener('visibilitychange', handleImmediateSave);
    };
  }, [chambers, placedItems, lightingMode]);

  // Manual save layout
  const saveLayout = () => {
    try {
      const data = JSON.stringify({ chambers, placedItems, lightingMode });
      localStorage.setItem('cozy_dungeon_vault_save', data);
      audioSystem.playChime();
    } catch (e) {
      console.error('Failed to save layout', e);
    }
  };

  // Add a new chamber adjacent to an existing chamber (Orange '+' button handler)
  const addChamber = (fromChamber, direction) => {
    let newGridX = fromChamber.gridX;
    let newGridZ = fromChamber.gridZ;

    if (direction === 'left') newGridX -= 1;
    if (direction === 'right') newGridX += 1;
    if (direction === 'top') newGridZ -= 1;
    if (direction === 'bottom') newGridZ += 1;

    // Check if chamber already exists at this coordinate
    const exists = chambers.some((c) => c.gridX === newGridX && c.gridZ === newGridZ);
    if (exists) return;

    const chamberIndex = chambers.length % CHAMBER_NAMES.length;
    const newName = CHAMBER_NAMES[chamberIndex];

    const newChamber = {
      id: `chamber-${Date.now()}`,
      name: newName,
      gridX: newGridX,
      gridZ: newGridZ,
      x: newGridX * 6.0,
      z: newGridZ * 6.0,
      width: 6,
      depth: 6,
      wallTheme: 'stone',
      floorTheme: 'slab'
    };

    recordHistory();
    setChambers((prev) => [...prev, newChamber]);

    // Sound effect & confetti
    audioSystem.playChime();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#FBBF24', '#EF4444', '#10B981']
      });
    } catch (e) {}
  };

  // Helper to play sound based on item soundType
  const playItemSound = (soundType) => {
    switch (soundType) {
      case 'coin':
        audioSystem.playCoin();
        break;
      case 'stone':
        audioSystem.playStoneDrop();
        break;
      case 'torch':
        audioSystem.playTorch();
        break;
      case 'wood':
      default:
        audioSystem.playWoodDrop();
        break;
    }
  };

  // Add Item to Room (Click or Drop)
  const addItemAt = (catalogItem, position = [0, 0, 0]) => {
    let [x, y, z] = position;

    if (gridSnap) {
      x = Math.round(x / gridSize) * gridSize;
      z = Math.round(z / gridSize) * gridSize;
    }

    // Default height for wall items
    if (catalogItem.isWallItem && y < 1.0) {
      y = 1.8;
    }

    const newItemId = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newItem = {
      id: newItemId,
      catalogId: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      modelPath: catalogItem.modelPath,
      position: [x, y, z],
      rotation: [0, 0, 0],
      scale: catalogItem.scale || 1.2,
      soundType: catalogItem.soundType || 'wood',
      isWallItem: catalogItem.isWallItem || false
    };

    recordHistory();
    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItemId);
    playItemSound(catalogItem.soundType);
  };

  // Move placed item
  const moveItem = (id, newPosition) => {
    let [x, y, z] = newPosition;
    if (gridSnap) {
      x = Math.round(x / gridSize) * gridSize;
      z = Math.round(z / gridSize) * gridSize;
    }

    setPlacedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, position: [x, y, z] } : item))
    );
  };

  // Rotate placed item by angle in radians (e.g. 45 or 90 deg)
  const rotateItem = (id, deltaAngle = Math.PI / 2) => {
    recordHistory();
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newRy = (item.rotation[1] + deltaAngle) % (Math.PI * 2);
        return { ...item, rotation: [item.rotation[0], newRy, item.rotation[2]] };
      })
    );
    audioSystem.playPop();
  };

  // Adjust elevation (raise onto table or lower)
  const adjustElevation = (id, deltaY) => {
    recordHistory();
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newY = Math.max(0, parseFloat((item.position[1] + deltaY).toFixed(2)));
        return { ...item, position: [item.position[0], newY, item.position[2]] };
      })
    );
    audioSystem.playPop();
  };

  // Duplicate placed item
  const duplicateItem = (id) => {
    const item = placedItems.find((i) => i.id === id);
    if (!item) return;

    recordHistory();
    const dupId = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newItem = {
      ...item,
      id: dupId,
      position: [item.position[0] + 0.4, item.position[1], item.position[2] + 0.4]
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedItemId(dupId);
    playItemSound(item.soundType);
  };

  // Delete placed item
  const deleteItem = (id) => {
    recordHistory();
    setPlacedItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
    audioSystem.playPop();
  };

  // Sound toggles
  const toggleSound = () => {
    const newMuted = !soundMuted;
    setSoundMuted(newMuted);
    audioSystem.setMuted(newMuted);
    if (newMuted && bgmPlaying) {
      setBgmPlaying(false);
    }
  };

  const toggleBgm = () => {
    if (soundMuted) {
      setSoundMuted(false);
      audioSystem.setMuted(false);
    }
    const isPlaying = audioSystem.toggleBgm();
    setBgmPlaying(isPlaying);
  };

  // Photo Gallery
  const saveSnapshot = (dataUrl) => {
    const newSnapshot = {
      id: `photo-${Date.now()}`,
      dataUrl,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      chamberCount: chambers.length,
      itemCount: placedItems.length
    };
    const updated = [newSnapshot, ...snapshots];
    setSnapshots(updated);
    try {
      localStorage.setItem('cozy_dungeon_snapshots', JSON.stringify(updated));
    } catch (e) {}
  };

  const deleteSnapshot = (id) => {
    const updated = snapshots.filter((s) => s.id !== id);
    setSnapshots(updated);
    try {
      localStorage.setItem('cozy_dungeon_snapshots', JSON.stringify(updated));
    } catch (e) {}
  };

  const clearAllProps = () => {
    recordHistory();
    setPlacedItems([]);
    setSelectedItemId(null);
    audioSystem.playPop();
  };

  const resetDungeonLayout = () => {
    const defaultChambers = [
      {
        id: 'chamber-main',
        name: 'Grand Vault',
        gridX: 0,
        gridZ: 0,
        x: 0,
        z: 0,
        width: 6,
        depth: 6,
        wallTheme: 'stone',
        floorTheme: 'slab'
      }
    ];
    const defaultProps = [
      {
        id: 'prop-init-chest',
        catalogId: 'chest-gold',
        name: 'Gilded Royal Chest',
        category: 'treasures',
        modelPath: '/models/dungeon/chest_gold.gltf',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1.3,
        soundType: 'coin',
        isWallItem: false
      },
      {
        id: 'prop-init-coins',
        catalogId: 'coin-stack-large',
        name: 'Grand Gold Hoard',
        category: 'treasures',
        modelPath: '/models/dungeon/coin_stack_large.gltf',
        position: [1.4, 0, 0.4],
        rotation: [0, Math.PI / 4, 0],
        scale: 1.3,
        soundType: 'coin',
        isWallItem: false
      }
    ];

    setChambers(defaultChambers);
    setPlacedItems(defaultProps);
    setSelectedItemId(null);
    try {
      localStorage.removeItem('cozy_dungeon_vault_save');
    } catch (e) {}
    audioSystem.playChime();
  };

  return (
    <RoomContext.Provider
      value={{
        chambers,
        placedItems,
        selectedItemId,
        selectedItem: placedItems.find((i) => i.id === selectedItemId),
        gridSnap,
        gridSize,
        draggingCatalogItem,
        dragHoverPoint,
        draggingSceneItemId,
        lightingMode,
        soundMuted,
        bgmPlaying,
        snapshots,
        setSelectedItemId,
        setGridSnap,
        setDraggingCatalogItem,
        setDragHoverPoint,
        setDraggingSceneItemId,
        setLightingMode,
        addChamber,
        addItemAt,
        moveItem,
        rotateItem,
        adjustElevation,
        duplicateItem,
        deleteItem,
        toggleSound,
        toggleBgm,
        saveSnapshot,
        deleteSnapshot,
        clearAllProps,
        saveLayout,
        resetDungeonLayout,
        recordHistory,
        undo,
        canUndo: undoStack.length > 0,
        sidebarMode,
        setSidebarMode,
        updateItemLogic
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
