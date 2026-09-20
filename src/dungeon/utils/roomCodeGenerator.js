import { publishRoomToCloud } from '../../utils/communityRoomPool';
/**
 * PuzzleForge Room Code Generator & Schema Packager
 * 
 * Generates unique, shareable room codes matching the PuzzleForge format (e.g. FORGE-4821)
 * and formats room layouts into Supabase-ready JSON payloads.
 */

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes confusing characters 0, 1, O, I

/**
 * Generates a unique, readable room code like FORGE-7X2M or FORGE-4821
 */
export function generateRoomCode(prefix = 'FORGE') {
  let randomPart = '';
  // 4 characters gives over 1 million unique combinations per prefix
  for (let i = 0; i < 4; i++) {
    randomPart += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `${prefix}-${randomPart}`;
}

const STORAGE_KEY = 'PF_PUBLISHED_ROOMS';

/**
 * Retrieves all locally saved published rooms (history)
 */
export function getPublishedRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load published rooms:', err);
    return [];
  }
}

/**
 * Formats full room state into Supabase-ready payload and saves to local registry
 */
export function savePublishedRoom({ title = 'My Cozy Dungeon Vault', chambers, placedItems, lightingMode }) {
  const roomCode = generateRoomCode('FORGE');
  const now = new Date().toISOString();

  // Extract puzzle summary stats
  const exitDoor = placedItems?.find((i) => i.logic?.role === 'exit_door');
  const containers = placedItems?.filter((i) => i.logic?.role === 'container') || [];
  const clues = placedItems?.filter((i) => i.logic?.role === 'clue') || [];
  const triggers = placedItems?.filter((i) => i.logic?.role === 'trigger') || [];

  const layoutJson = {
    chambers: chambers || [],
    lightingMode: lightingMode || 'torchlight',
    placedItems: (placedItems || []).map((item) => ({
      id: item.id,
      catalogId: item.catalogId,
      name: item.name,
      category: item.category,
      modelPath: item.modelPath,
      position: item.position,
      rotation: item.rotation,
      scale: item.scale,
      logic: item.logic || { role: 'none' }
    })),
    stats: {
      chambersCount: chambers?.length || 1,
      propsCount: placedItems?.length || 0,
      hasExitDoor: !!exitDoor,
      exitKeyRequired: exitDoor?.logic?.requiredKey || null,
      containersCount: containers.length,
      cluesCount: clues.length,
      triggersCount: triggers.length,
      isSolvable: !!exitDoor && containers.length > 0
    }
  };

  const publishedRecord = {
    room_code: roomCode,
    title: title || 'My Cozy Dungeon Vault',
    theme: 'dungeon',
    created_at: now,
    updated_at: now,
    layout_json: layoutJson,
    play_count: 0
  };

  try {
    const history = getPublishedRooms();
    // Add new published version to the front of history
    const updated = [publishedRecord, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Also add to Community Rooms pool
    try {
      const commRaw = localStorage.getItem('PF_COMMUNITY_ROOMS');
      const commList = commRaw ? JSON.parse(commRaw) : [];
      const updatedComm = [publishedRecord, ...commList.filter(r => r.room_code !== roomCode)];
      localStorage.setItem('PF_COMMUNITY_ROOMS', JSON.stringify(updatedComm));
    } catch(e) {}
  } catch (err) {
    console.error('Failed to save published room record:', err);
  }

  // Auto-publish to Supabase Cloud in the background
  try {
    publishRoomToCloud(publishedRecord);
  } catch(e) {}
  return publishedRecord;
}
