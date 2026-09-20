import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// In-memory cache for rendered 3D thumbnails
const thumbnailCache = new Map();
const pendingResolvers = new Map();
const renderQueue = [];
let isProcessingQueue = false;

// Try loading cached thumbnails from localStorage
try {
  const saved = localStorage.getItem('cozy_dungeon_thumbnails');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.entries(parsed).forEach(([path, url]) => {
      thumbnailCache.set(path, url);
    });
  }
} catch (e) {
  console.warn('Could not read saved thumbnails from storage', e);
}

function saveToStorage() {
  try {
    const obj = {};
    thumbnailCache.forEach((val, key) => {
      obj[key] = val;
    });
    localStorage.setItem('cozy_dungeon_thumbnails', JSON.stringify(obj));
  } catch (e) {}
}

let sharedRenderer = null;
let sharedScene = null;
let sharedCamera = null;
const loader = new GLTFLoader();

function getOffscreenRenderer() {
  if (!sharedRenderer && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 140;

    sharedRenderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    sharedRenderer.setSize(140, 140);
    sharedRenderer.outputColorSpace = THREE.SRGBColorSpace;

    sharedScene = new THREE.Scene();

    // Studio lights for crisp, warm 3D miniature look
    const ambient = new THREE.AmbientLight(0xfff7ed, 1.4);
    sharedScene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfef3c7, 2.2);
    dirLight.position.set(4, 6, 5);
    sharedScene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xf59e0b, 1.2);
    fillLight.position.set(-4, 3, -3);
    sharedScene.add(fillLight);

    sharedCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  }
  return { renderer: sharedRenderer, scene: sharedScene, camera: sharedCamera };
}

// Process 1 thumbnail per animation frame to prevent UI lag / hitching
function processQueue() {
  if (renderQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;
  const modelPath = renderQueue.shift();

  loader.load(
    modelPath,
    (gltf) => {
      try {
        const { renderer, scene, camera } = getOffscreenRenderer();
        if (!renderer) {
          notifyResolvers(modelPath, null);
          scheduleNext();
          return;
        }

        const model = gltf.scene.clone();

        // Center and auto-scale model inside unit box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 0.01);

        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        // Isometric camera framing
        const targetDist = maxDim * 2.3;
        camera.position.set(targetDist * 0.85, targetDist * 0.65, targetDist * 0.85);
        camera.lookAt(0, 0, 0);

        scene.add(model);
        renderer.render(scene, camera);

        const dataUrl = renderer.domElement.toDataURL('image/png');
        scene.remove(model);

        thumbnailCache.set(modelPath, dataUrl);
        saveToStorage();
        notifyResolvers(modelPath, dataUrl);
      } catch (err) {
        notifyResolvers(modelPath, null);
      }
      scheduleNext();
    },
    undefined,
    () => {
      notifyResolvers(modelPath, null);
      scheduleNext();
    }
  );
}

function scheduleNext() {
  // Yield to browser rendering loop (requestAnimationFrame) so 60 FPS is maintained
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => processQueue());
  } else {
    setTimeout(processQueue, 16);
  }
}

function notifyResolvers(modelPath, result) {
  const list = pendingResolvers.get(modelPath);
  if (list) {
    list.forEach((resolve) => resolve(result));
    pendingResolvers.delete(modelPath);
  }
}

/**
 * Returns an isometric 3D thumbnail of a GLTF model (cached or queued smoothly)
 * @param {string} modelPath URL to the .gltf model
 * @returns {Promise<string>} Data URL of the rendered thumbnail
 */
export function getModelThumbnail(modelPath) {
  if (thumbnailCache.has(modelPath)) {
    return Promise.resolve(thumbnailCache.get(modelPath));
  }

  return new Promise((resolve) => {
    let list = pendingResolvers.get(modelPath);
    if (!list) {
      list = [];
      pendingResolvers.set(modelPath, list);
      renderQueue.push(modelPath);
      if (!isProcessingQueue) {
        processQueue();
      }
    }
    list.push(resolve);
  });
}
