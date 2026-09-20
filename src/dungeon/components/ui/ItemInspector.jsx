import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { RotateCw, ArrowUp, ArrowDown, Copy, Trash2, X } from 'lucide-react';

export function ItemInspector() {
  const { selectedItem, updateItem, deleteItem, duplicateItem, selectItem } = useRoom();

  if (!selectedItem) return null;

  return null;
}
