import { supabase } from '../lib/supabaseClient';

const STARTER_ROOM = {
  room_code: 'FORGE-DEMO',
  title: 'Crypt of the Gilded Key',
  theme: 'dungeon',
  created_at: new Date().toISOString(),
  layout_json: {
    chambers: [
      { id: 'grand_vault', label: 'Grand Vault', x: 0, z: 0, width: 5, length: 5, height: 3 }
    ],
    lightingMode: 'torchlight',
    placedItems: [
      {
        id: 'starter_door',
        catalogId: 'door_gate',
        name: 'Iron Portcullis Exit',
        category: 'doors',
        modelPath: '/models/dungeon/door-gate-bars.glb',
        position: [0, 0, -2.4],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        logic: { role: 'exit_door', isLocked: true, requiredKey: 'Royal Dungeon Key' }
      },
      {
        id: 'starter_chest',
        catalogId: 'chest',
        name: 'Gilded Royal Chest',
        category: 'props',
        modelPath: '/models/dungeon/chest.glb',
        position: [-1.8, 0, 1.5],
        rotation: [0, Math.PI / 4, 0],
        scale: [1, 1, 1],
        logic: {
          role: 'container',
          containsItem: { type: 'key', name: 'Royal Dungeon Key' }
        }
      },
      {
        id: 'starter_banner',
        catalogId: 'banner',
        name: 'Ancient Wall Banner',
        category: 'decor',
        modelPath: '/models/dungeon/wall-banner.glb',
        position: [2.3, 1.2, 0],
        rotation: [0, -Math.PI / 2, 0],
        scale: [1, 1, 1],
        logic: {
          role: 'clue',
          clueText: 'Search the gilded chest in the dark corner to claim your escape key.'
        }
      }
    ],
    stats: {
      chambersCount: 1,
      propsCount: 3,
      hasExitDoor: true,
      containersCount: 1,
      cluesCount: 1,
      isSolvable: true
    }
  }
};

/**
 * Publish room to Supabase Cloud & local storage
 */
export async function publishRoomToCloud(roomRecord) {
  try {
    const { data, error } = await supabase.from('rooms').insert([
      {
        room_code: roomRecord.room_code,
        title: roomRecord.title || 'Dungeon Vault',
        theme: roomRecord.theme || 'dungeon',
        creator_name: 'Architect',
        layout_json: roomRecord.layout_json
      }
    ]);
    if (error) {
      console.warn('Supabase cloud publish error:', error.message);
    } else {
      console.log('✅ Room published to Supabase Cloud:', roomRecord.room_code);
    }
  } catch (err) {
    console.warn('Network error publishing to Supabase:', err);
  }
}

/**
 * Fetch room by code (Checks local cache first, then queries Supabase Cloud)
 */
export async function getRoomByCode(code) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

  if (cleanCode === 'FORGE-DEMO' || cleanCode === 'DEMO') {
    return STARTER_ROOM;
  }

  // 1. Check local cache
  try {
    const raw = localStorage.getItem('PF_PUBLISHED_ROOMS');
    if (raw) {
      const list = JSON.parse(raw);
      const match = list.find((r) => r.room_code?.toUpperCase() === cleanCode);
      if (match) return match;
    }
  } catch (e) {}

  // 2. Query Supabase Cloud
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (data && !error) {
      return data;
    }
  } catch (e) {}

  return null;
}

/**
 * Fetch a random room from Supabase Cloud or local community pool
 */
export async function getRandomCommunityRoom(excludeCode = null) {
  // 1. Try fetching real community rooms from Supabase Cloud
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (data && data.length > 0) {
      let pool = data;
      if (data.length > 1 && excludeCode) {
        pool = data.filter((r) => r.room_code !== excludeCode);
      }
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex];
    }
  } catch (e) {}

  // 2. Fallback to local community pool
  try {
    const commRaw = localStorage.getItem('PF_COMMUNITY_ROOMS');
    if (commRaw) {
      const candidates = JSON.parse(commRaw);
      if (candidates.length > 0) {
        let pool = candidates;
        if (candidates.length > 1 && excludeCode) {
          pool = candidates.filter((r) => r.room_code !== excludeCode);
        }
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
      }
    }
  } catch (e) {}

  return STARTER_ROOM;
}

/**
 * Submit speedrun escape time to Supabase Leaderboard
 */
export async function submitRoomRun(roomCode, playerName, timeSeconds) {
  try {
    const { error } = await supabase.from('room_runs').insert([
      {
        room_code: roomCode,
        player_name: playerName || 'Adventurer',
        time_seconds: parseFloat(timeSeconds.toFixed(2))
      }
    ]);
    if (!error) {
      console.log('✅ Run posted to Supabase Leaderboard:', timeSeconds);
    }
  } catch (e) {
    console.warn('Failed to submit leaderboard run:', e);
  }
}

/**
 * Fetch top speedruns for Leaderboard modal
 */
export async function getLeaderboardRuns(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('room_runs')
      .select('*')
      .order('time_seconds', { ascending: true })
      .limit(limit);

    if (data && !error) {
      return data;
    }
  } catch (e) {}
  return [];
}
