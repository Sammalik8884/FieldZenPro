import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface PhotoLightboxProps {
  photos: { url: string; label?: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photos, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  const current = photos[currentIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(i + 1, photos.length - 1));
      if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, photos.length]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
        <span className="text-white/70 text-sm font-medium">
          {current.label || `Photo ${currentIndex + 1}`} &nbsp;|&nbsp; {currentIndex + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-3">
          <a
            href={current.url}
            download
            onClick={e => e.stopPropagation()}
            className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </a>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Prev Button */}
      {currentIndex > 0 && (
        <button
          className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
          onClick={e => { e.stopPropagation(); setCurrentIndex(i => i - 1); }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={current.url}
        alt={current.label || 'Photo'}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {/* Next Button */}
      {currentIndex < photos.length - 1 && (
        <button
          className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
          onClick={e => { e.stopPropagation(); setCurrentIndex(i => i + 1); }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrentIndex(i); }}
              className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
