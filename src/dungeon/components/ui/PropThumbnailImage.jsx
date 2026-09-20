import React, { useState, useEffect } from 'react';
import { getModelThumbnail } from '../../utils/thumbnailGenerator';
import {
  Coins,
  Armchair,
  Flame,
  Castle,
  Shield,
  FlaskConical,
  Package
} from 'lucide-react';

const CATEGORY_FALLBACK_ICONS = {
  treasures: Coins,
  furniture: Armchair,
  lighting: Flame,
  architecture: Castle,
  armory: Shield,
  potions: FlaskConical,
  crates: Package
};

export function PropThumbnailImage({ modelPath, name, category }) {
  const [thumbUrl, setThumbUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getModelThumbnail(modelPath).then((url) => {
      if (isMounted) {
        if (url) setThumbUrl(url);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [modelPath]);

  const FallbackIcon = CATEGORY_FALLBACK_ICONS[category] || Package;

  if (thumbUrl) {
    return (
      <img
        src={thumbUrl}
        alt={name}
        className="w-full h-full object-contain p-1.5 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform duration-200"
        loading="lazy"
      />
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400/40 border-t-amber-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <FallbackIcon className="w-8 h-8 text-amber-200/80 drop-shadow-md" />
    </div>
  );
}
