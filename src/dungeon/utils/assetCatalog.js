// Cozy Dungeon Vault Asset Catalog
// Uses extracted KayKit Dungeon Pack gltf models in /models/dungeon/

export const CATALOG_CATEGORIES = [
  {
    id: 'treasures',
    label: 'Treasures',
    icon: 'Coins',
    color: '#F59E0B',
    description: 'Gold chests, coin piles, and precious vault riches'
  },
  {
    id: 'furniture',
    label: 'Thrones & Tables',
    icon: 'Armchair',
    color: '#8B5CF6',
    description: 'Throne chairs, banquet tables, and cozy dungeon beds'
  },
  {
    id: 'lighting',
    label: 'Torches & Lights',
    icon: 'Flame',
    color: '#EF4444',
    description: 'Wall sconces, standing torches, and warm candles'
  },
  {
    id: 'architecture',
    label: 'Pillars & Walls',
    icon: 'Castle',
    color: '#64748B',
    description: 'Stone pillars, arched doorways, and iron portcullises'
  },
  {
    id: 'armory',
    label: 'Armory & Banners',
    icon: 'Shield',
    color: '#3B82F6',
    description: 'Golden shields, crests, and majestic wall tapestries'
  },
  {
    id: 'potions',
    label: 'Potions & Tavern',
    icon: 'FlaskConical',
    color: '#10B981',
    description: 'Alchemist potions, brew kegs, barrels, and feast plates'
  },
  {
    id: 'crates',
    label: 'Storage & Crates',
    icon: 'Package',
    color: '#D97706',
    description: 'Stacked cargo crates, relic boxes, and vault shelving'
  }
];

export const DUNGEON_CATALOG_ITEMS = [
  // 💰 TREASURES & VAULT
  {
    id: 'chest-gold',
    name: 'Gilded Royal Chest',
    category: 'treasures',
    modelPath: '/models/dungeon/chest_gold.gltf',
    soundType: 'coin',
    scale: 1.2,
    dimensions: [1.2, 0.9, 0.9],
    previewGradient: 'from-amber-400 to-yellow-600',
    description: 'A heavy chest overflowing with royal dungeon treasure.'
  },
  {
    id: 'chest-wood',
    name: 'Ironbound Chest',
    category: 'treasures',
    modelPath: '/models/dungeon/chest.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [1.2, 0.8, 0.8],
    previewGradient: 'from-amber-700 to-amber-900',
    description: 'Reinforced ironbound chest for precious loot.'
  },
  {
    id: 'coin-stack-large',
    name: 'Grand Gold Hoard',
    category: 'treasures',
    modelPath: '/models/dungeon/coin_stack_large.gltf',
    soundType: 'coin',
    scale: 1.4,
    dimensions: [1.0, 0.6, 1.0],
    previewGradient: 'from-yellow-300 to-amber-500',
    description: 'Massive towering piles of sparkling gold coins.'
  },
  {
    id: 'coin-stack-medium',
    name: 'Medium Coin Stack',
    category: 'treasures',
    modelPath: '/models/dungeon/coin_stack_medium.gltf',
    soundType: 'coin',
    scale: 1.3,
    dimensions: [0.7, 0.4, 0.7],
    previewGradient: 'from-yellow-400 to-amber-600',
    description: 'Piles of minted vault currency.'
  },
  {
    id: 'coin-stack-small',
    name: 'Coin Cache',
    category: 'treasures',
    modelPath: '/models/dungeon/coin_stack_small.gltf',
    soundType: 'coin',
    scale: 1.3,
    dimensions: [0.5, 0.3, 0.5],
    previewGradient: 'from-amber-300 to-yellow-500',
    description: 'A neat cluster of gold coins.'
  },
  {
    id: 'keyring-hanging',
    name: 'Vault Keyring',
    category: 'treasures',
    modelPath: '/models/dungeon/keyring_hanging.gltf',
    soundType: 'coin',
    isWallItem: true,
    scale: 1.2,
    dimensions: [0.4, 0.6, 0.2],
    previewGradient: 'from-slate-400 to-amber-500',
    description: 'Heavy bronze keys for the secret dungeon vaults.'
  },
  {
    id: 'trunk-large',
    name: 'Vault Strongbox Trunk',
    category: 'treasures',
    modelPath: '/models/dungeon/trunk_large_A.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [1.2, 0.8, 0.7],
    previewGradient: 'from-amber-800 to-stone-900',
    description: 'Spacious vintage travel trunk with bronze buckles.'
  },

  // 👑 FURNITURE & THRONES
  {
    id: 'throne-chair',
    name: 'Dungeon Lord Throne',
    category: 'furniture',
    modelPath: '/models/dungeon/chair.gltf',
    soundType: 'wood',
    scale: 1.3,
    dimensions: [0.8, 1.3, 0.8],
    previewGradient: 'from-purple-600 to-indigo-900',
    description: 'Carved high-back throne chair with leather seat.'
  },
  {
    id: 'table-banquet',
    name: 'Royal Banquet Table',
    category: 'furniture',
    modelPath: '/models/dungeon/table_long_tablecloth.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [2.4, 0.9, 1.1],
    previewGradient: 'from-red-600 to-amber-800',
    description: 'Long wooden feast table with a crimson tablecloth.'
  },
  {
    id: 'table-feast-decorated',
    name: 'Grand Feast Table',
    category: 'furniture',
    modelPath: '/models/dungeon/table_long_decorated_A.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [2.4, 1.0, 1.1],
    previewGradient: 'from-amber-700 to-amber-950',
    description: 'Festive table dressed with chalices, candles, and feast.'
  },
  {
    id: 'table-small-scholar',
    name: "Scholar's Table",
    category: 'furniture',
    modelPath: '/models/dungeon/table_small_decorated_A.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [1.0, 0.8, 1.0],
    previewGradient: 'from-amber-600 to-stone-800',
    description: 'Small research desk with parchment and candle.'
  },
  {
    id: 'table-medium-plain',
    name: 'Dungeon Worktable',
    category: 'furniture',
    modelPath: '/models/dungeon/table_medium.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [1.6, 0.8, 1.0],
    previewGradient: 'from-stone-600 to-amber-900',
    description: 'Solid timber crafting table.'
  },
  {
    id: 'cozy-dungeon-bed',
    name: 'Royal Vault Canopy Bed',
    category: 'furniture',
    modelPath: '/models/dungeon/bed_decorated.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [2.2, 1.4, 1.8],
    previewGradient: 'from-rose-500 to-amber-700',
    description: 'Luxurious carved four-post bed with warm quilts.'
  },
  {
    id: 'bed-frame',
    name: 'Rustic Straw Bed',
    category: 'furniture',
    modelPath: '/models/dungeon/bed_frame.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [2.0, 0.8, 1.4],
    previewGradient: 'from-amber-600 to-amber-800',
    description: 'Comfortable timber frame bed with cozy blanket.'
  },
  {
    id: 'stool-wood',
    name: 'Round Timber Stool',
    category: 'furniture',
    modelPath: '/models/dungeon/stool.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [0.6, 0.6, 0.6],
    previewGradient: 'from-amber-500 to-amber-800',
    description: 'Handcrafted three-legged wooden stool.'
  },

  // 🔥 LIGHTING & TORCHES
  {
    id: 'torch-mounted',
    name: 'Iron Wall Torch Sconce',
    category: 'lighting',
    modelPath: '/models/dungeon/torch_mounted.gltf',
    soundType: 'torch',
    isWallItem: true,
    scale: 1.3,
    dimensions: [0.3, 0.8, 0.4],
    previewGradient: 'from-orange-500 to-red-600',
    description: 'Brilliant flickering torch mounted on castle stonework.'
  },
  {
    id: 'torch-lit-standing',
    name: 'Standing Fire Torch',
    category: 'lighting',
    modelPath: '/models/dungeon/torch_lit.gltf',
    soundType: 'torch',
    scale: 1.3,
    dimensions: [0.4, 1.2, 0.4],
    previewGradient: 'from-yellow-400 to-orange-600',
    description: 'Portable fire torch casting rich, warm ambient light.'
  },
  {
    id: 'candle-triple',
    name: 'Triple Candelabra',
    category: 'lighting',
    modelPath: '/models/dungeon/candle_triple.gltf',
    soundType: 'torch',
    scale: 1.3,
    dimensions: [0.4, 0.6, 0.4],
    previewGradient: 'from-amber-300 to-orange-500',
    description: 'Three glowing beeswax candles in an iron holder.'
  },
  {
    id: 'candle-lit-single',
    name: 'Warm Lit Candle',
    category: 'lighting',
    modelPath: '/models/dungeon/candle_lit.gltf',
    soundType: 'torch',
    scale: 1.3,
    dimensions: [0.3, 0.4, 0.3],
    previewGradient: 'from-yellow-300 to-amber-500',
    description: 'Single candle casting delicate cozy glow.'
  },
  {
    id: 'shelf-candles',
    name: 'Wall Shelf with Candles',
    category: 'lighting',
    modelPath: '/models/dungeon/shelf_small_candles.gltf',
    soundType: 'wood',
    isWallItem: true,
    scale: 1.2,
    dimensions: [1.0, 0.6, 0.4],
    previewGradient: 'from-amber-600 to-orange-700',
    description: 'Wooden wall shelf with glowing candles and knick-knacks.'
  },

  // 🏰 PILLARS & ARCHITECTURE
  {
    id: 'pillar-decorated',
    name: 'Carved Vault Pillar',
    category: 'architecture',
    modelPath: '/models/dungeon/pillar_decorated.gltf',
    soundType: 'stone',
    scale: 1.2,
    dimensions: [0.9, 2.6, 0.9],
    previewGradient: 'from-slate-500 to-stone-700',
    description: 'Grand ornate stone pillar with ancient masonry.'
  },
  {
    id: 'pillar-clean',
    name: 'Stone Castle Column',
    category: 'architecture',
    modelPath: '/models/dungeon/pillar.gltf',
    soundType: 'stone',
    scale: 1.2,
    dimensions: [0.8, 2.4, 0.8],
    previewGradient: 'from-stone-400 to-stone-600',
    description: 'Sturdy cylindrical column supporting the vault ceiling.'
  },
  {
    id: 'wall-doorway-arch',
    name: 'Arched Passage Doorway',
    category: 'architecture',
    modelPath: '/models/dungeon/wall_doorway.gltf',
    soundType: 'stone',
    scale: 1.1,
    dimensions: [2.0, 2.8, 0.5],
    previewGradient: 'from-slate-600 to-stone-800',
    description: 'Open arched doorway connecting adjoining chambers.'
  },
  {
    id: 'wall-portcullis',
    name: 'Iron Portcullis Gate',
    category: 'architecture',
    modelPath: '/models/dungeon/wall_gated.gltf',
    soundType: 'stone',
    scale: 1.1,
    dimensions: [2.0, 2.8, 0.5],
    previewGradient: 'from-zinc-700 to-stone-900',
    description: 'Heavy iron barred gate securing secret treasure vaults.'
  },
  {
    id: 'stairs-stone',
    name: 'Stone Vault Stairs',
    category: 'architecture',
    modelPath: '/models/dungeon/stairs.gltf',
    soundType: 'stone',
    scale: 1.2,
    dimensions: [1.8, 1.4, 1.8],
    previewGradient: 'from-stone-500 to-zinc-700',
    description: 'Hand-chiseled stone steps leading to raised platforms.'
  },
  {
    id: 'barrier-column',
    name: 'Balustrade Pillar Corner',
    category: 'architecture',
    modelPath: '/models/dungeon/barrier_column.gltf',
    soundType: 'stone',
    scale: 1.2,
    dimensions: [0.5, 1.0, 0.5],
    previewGradient: 'from-stone-400 to-stone-700',
    description: 'Stone barrier post for balconies and elevated walkways.'
  },

  // 🛡️ ARMORY & BANNERS
  {
    id: 'sword-shield-gold',
    name: 'Golden Guardian Crest',
    category: 'armory',
    modelPath: '/models/dungeon/sword_shield_gold.gltf',
    soundType: 'coin',
    isWallItem: true,
    scale: 1.3,
    dimensions: [0.8, 1.0, 0.3],
    previewGradient: 'from-yellow-400 to-amber-600',
    description: 'Polished golden knight shield with crossing twin blades.'
  },
  {
    id: 'sword-shield-steel',
    name: 'Knight Sword & Shield',
    category: 'armory',
    modelPath: '/models/dungeon/sword_shield.gltf',
    soundType: 'wood',
    isWallItem: true,
    scale: 1.3,
    dimensions: [0.8, 1.0, 0.3],
    previewGradient: 'from-slate-400 to-blue-700',
    description: 'Steel broadsword crossed with a reinforced heater shield.'
  },
  {
    id: 'banner-red-royal',
    name: 'Royal Red Banner',
    category: 'armory',
    modelPath: '/models/dungeon/banner_red.gltf',
    soundType: 'wood',
    isWallItem: true,
    scale: 1.3,
    dimensions: [0.6, 1.6, 0.2],
    previewGradient: 'from-red-600 to-rose-900',
    description: 'Rich velvet red wall banner fringed with gold.'
  },
  {
    id: 'banner-shield-red',
    name: 'Crown Shield Tapestry',
    category: 'armory',
    modelPath: '/models/dungeon/banner_shield_red.gltf',
    soundType: 'wood',
    isWallItem: true,
    scale: 1.3,
    dimensions: [0.7, 1.6, 0.2],
    previewGradient: 'from-red-500 to-amber-700',
    description: 'Hanging tapestry bearing the emblem of the high crown.'
  },
  {
    id: 'banner-blue-pattern',
    name: 'Azure Falcon Banner',
    category: 'armory',
    modelPath: '/models/dungeon/banner_patternA_blue.gltf',
    soundType: 'wood',
    isWallItem: true,
    scale: 1.3,
    dimensions: [0.6, 1.6, 0.2],
    previewGradient: 'from-blue-500 to-indigo-800',
    description: 'Deep cobalt banner woven with heraldic crests.'
  },
  {
    id: 'banner-triple-yellow',
    name: 'Triple Gold Pennants',
    category: 'armory',
    modelPath: '/models/dungeon/banner_triple_yellow.gltf',
    soundType: 'wood',
    isWallItem: true,
    scale: 1.3,
    dimensions: [0.8, 1.5, 0.2],
    previewGradient: 'from-yellow-400 to-amber-700',
    description: 'Three regal golden pennants hanging side-by-side.'
  },

  // 🧪 POTIONS & TAVERN
  {
    id: 'keg-brew',
    name: 'Tavern Honey Mead Keg',
    category: 'potions',
    modelPath: '/models/dungeon/keg_decorated.gltf',
    soundType: 'wood',
    scale: 1.3,
    dimensions: [0.9, 1.0, 0.9],
    previewGradient: 'from-amber-600 to-amber-900',
    description: 'Aged oak keg filled with sweet spiced mead.'
  },
  {
    id: 'barrel-decorated',
    name: 'Large Wine Barrel',
    category: 'potions',
    modelPath: '/models/dungeon/barrel_large_decorated.gltf',
    soundType: 'wood',
    scale: 1.3,
    dimensions: [0.9, 1.2, 0.9],
    previewGradient: 'from-amber-700 to-stone-900',
    description: 'Large wooden cellar barrel bound with iron hoops.'
  },
  {
    id: 'barrel-stack',
    name: 'Cellar Barrel Stack',
    category: 'potions',
    modelPath: '/models/dungeon/barrel_small_stack.gltf',
    soundType: 'wood',
    scale: 1.3,
    dimensions: [1.2, 1.3, 0.8],
    previewGradient: 'from-amber-800 to-amber-950',
    description: 'A pyramid stack of aged wooden casks.'
  },
  {
    id: 'bottle-green-potion',
    name: 'Verdant Elixir Bottle',
    category: 'potions',
    modelPath: '/models/dungeon/bottle_A_green.gltf',
    soundType: 'coin',
    scale: 1.4,
    dimensions: [0.3, 0.6, 0.3],
    previewGradient: 'from-emerald-400 to-teal-700',
    description: 'Glowing glass flask containing rejuvenating botanical magic.'
  },
  {
    id: 'bottle-labeled-brown',
    name: "Alchemist's Tonic",
    category: 'potions',
    modelPath: '/models/dungeon/bottle_A_labeled_brown.gltf',
    soundType: 'coin',
    scale: 1.4,
    dimensions: [0.3, 0.6, 0.3],
    previewGradient: 'from-amber-700 to-amber-950',
    description: 'Sealed amber potion flask labeled with arcane runes.'
  },
  {
    id: 'plate-food-feast',
    name: 'Hearty Roast Platter',
    category: 'potions',
    modelPath: '/models/dungeon/plate_food_A.gltf',
    soundType: 'wood',
    scale: 1.4,
    dimensions: [0.6, 0.25, 0.6],
    previewGradient: 'from-orange-400 to-red-700',
    description: 'Fresh tavern dinner plate with roasted fowl and bread.'
  },

  // 📦 CRATES & STORAGE
  {
    id: 'crates-stacked',
    name: 'Stacked Vault Crates',
    category: 'crates',
    modelPath: '/models/dungeon/crates_stacked.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [1.4, 1.5, 1.2],
    previewGradient: 'from-amber-600 to-amber-900',
    description: 'Towering wooden shipping crates ready for inspection.'
  },
  {
    id: 'box-large',
    name: 'Heavy Timber Crate',
    category: 'crates',
    modelPath: '/models/dungeon/box_large.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [1.0, 0.9, 1.0],
    previewGradient: 'from-amber-700 to-stone-800',
    description: 'Durable pine storage crate.'
  },
  {
    id: 'box-decorated',
    name: 'Carved Relic Keepsake',
    category: 'crates',
    modelPath: '/models/dungeon/box_small_decorated.gltf',
    soundType: 'wood',
    scale: 1.3,
    dimensions: [0.6, 0.5, 0.6],
    previewGradient: 'from-amber-500 to-yellow-700',
    description: 'Small ornamental jewelry box lined with silk.'
  },
  {
    id: 'shelves-tall',
    name: 'Vault Archival Bookcase',
    category: 'crates',
    modelPath: '/models/dungeon/shelves.gltf',
    soundType: 'wood',
    scale: 1.2,
    dimensions: [1.4, 2.4, 0.6],
    previewGradient: 'from-stone-700 to-amber-950',
    description: 'Tall wooden shelving filled with dusty spellbooks and tomes.'
  }
];
