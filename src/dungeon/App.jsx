import React, { useRef, useState } from 'react';
import { RoomProvider } from './context/RoomContext';
import { RoomCanvas } from './components/3d/RoomCanvas';
import { TopNavbar } from './components/ui/TopNavbar';
import { FurnitureCatalog } from './components/ui/FurnitureCatalog';
import { RoomLogicMenu } from './components/ui/RoomLogicMenu';
import { ActionButtons } from './components/ui/ActionButtons';
import { PhotoModal } from './components/ui/PhotoModal';
import { GalleryModal } from './components/ui/GalleryModal';

import { PublishModal } from './components/ui/PublishModal';
import { savePublishedRoom } from './utils/roomCodeGenerator';
import { useRoom } from './context/RoomContext';

function DungeonVaultApp() {
  const canvasRef = useRef(null);
  const { chambers, placedItems, lightingMode } = useRoom();

  // Modals
  const [photoOpen, setPhotoOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishedRoom, setPublishedRoom] = useState(null);

  const handlePublish = () => {
    const record = savePublishedRoom({
      title: 'My Cozy Dungeon Vault',
      chambers,
      placedItems,
      lightingMode
    });
    setPublishedRoom(record);
    setPublishOpen(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-stone-950 via-zinc-950 to-stone-900 font-sans select-none">
      {/* Top Navbar */}
      <TopNavbar onPublish={handlePublish} />

      {/* 3D Interactive Cozy Dungeon Canvas with Cutaway Vault View */}
      <RoomCanvas canvasRef={canvasRef} />

      {/* Poki-Style Right-Hand Category & Prop Catalog Shelf */}
      <FurnitureCatalog />

      {/* Room Logic & Escape Puzzle Configurator Menu */}
      <RoomLogicMenu onPublish={handlePublish} />

      {/* Poki-Style Bottom-Left Chunky Action Buttons (Camera, Gallery, Sound) */}
      <ActionButtons
        onOpenPhoto={() => setPhotoOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
      />

      {/* Photo Mode Snapshot Modal */}
      <PhotoModal
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
        canvasRef={canvasRef}
      />

      {/* Saved Snapshots Gallery Modal */}
      <GalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onOpenPhoto={() => setPhotoOpen(true)}
      />

      {/* Publish Room & Unique Code Modal */}
      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        publishedRoom={publishedRoom}
      />
    </div>
  );
}

export default function App() {
  return (
    <RoomProvider>
      <DungeonVaultApp />
    </RoomProvider>
  );
}
