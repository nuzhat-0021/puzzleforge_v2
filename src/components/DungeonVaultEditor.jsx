import React, { useRef, useState } from 'react';
import { RoomProvider, useRoom } from '../dungeon/context/RoomContext';
import { RoomCanvas } from '../dungeon/components/3d/RoomCanvas';
import { TopNavbar } from '../dungeon/components/ui/TopNavbar';
import { FurnitureCatalog } from '../dungeon/components/ui/FurnitureCatalog';
import { RoomLogicMenu } from '../dungeon/components/ui/RoomLogicMenu';
import { ActionButtons } from '../dungeon/components/ui/ActionButtons';
import { PhotoModal } from '../dungeon/components/ui/PhotoModal';
import { GalleryModal } from '../dungeon/components/ui/GalleryModal';
import { PublishModal } from '../dungeon/components/ui/PublishModal';
import { savePublishedRoom } from '../dungeon/utils/roomCodeGenerator';

function DungeonVaultInner({ onBack }) {
  const canvasRef = useRef(null);
  const { chambers, placedItems, lightingMode } = useRoom();

  const [photoOpen, setPhotoOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishedRoom, setPublishedRoom] = useState(null);

  const handlePublish = () => {
    const record = savePublishedRoom({
      title: 'Dungeon Vault',
      chambers,
      placedItems,
      lightingMode
    });
    setPublishedRoom(record);
    setPublishOpen(true);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-stone-950 via-zinc-950 to-stone-900 font-sans select-none z-50">
      {/* Top Navbar */}
      <TopNavbar onPublish={handlePublish} onBack={onBack} />

      {/* 3D Interactive Cozy Dungeon Canvas with Cutaway Vault View */}
      <RoomCanvas canvasRef={canvasRef} />

      {/* Poki-Style Right-Hand Category & Prop Catalog Shelf */}
      <FurnitureCatalog />

      {/* Room Logic & Escape Puzzle Configurator Menu */}
      <RoomLogicMenu onPublish={handlePublish} />

      {/* Action Buttons (Camera, Gallery, Sound) */}
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

      {/* Publish Room Stone Clipboard Modal */}
      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        publishedRoom={publishedRoom}
      />
    </div>
  );
}

export default function DungeonVaultEditor({ onBack }) {
  return (
    <RoomProvider>
      <DungeonVaultInner onBack={onBack} />
    </RoomProvider>
  );
}
