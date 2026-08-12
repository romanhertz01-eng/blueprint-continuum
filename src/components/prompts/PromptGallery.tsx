import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptGalleryProps {
  media: { type: 'image' | 'video' | 'audio'; src: string; poster?: string; alt: string }[];
  title: string;
}

export function PromptGallery({ media, title }: PromptGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const hasMultiple = media.length > 1;

  const nextSlide = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const prevSlide = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, nextSlide, prevSlide]);

  const activeMedia = media[activeIdx];

  const renderMedia = (item: typeof activeMedia, isLightbox = false) => {
    if (item.type === 'video') {
      return (
        <video
          src={item.src}
          poster={item.poster}
          controls
          playsInline
          className={cn(
            "w-full h-full object-cover",
            isLightbox ? "object-contain" : "object-cover"
          )}
        />
      );
    }
    return (
      <img
        src={item.src}
        alt={item.alt || title}
        className={cn(
          "w-full h-full",
          isLightbox ? "object-contain" : "object-cover"
        )}
      />
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Display */}
      <div className="relative group rounded-xl border border-border overflow-hidden bg-muted aspect-[3/4] max-w-[520px] mx-auto">
        {renderMedia(activeMedia)}

        {/* Overlay controls */}
        {hasMultiple && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 text-white text-[13px] font-medium pointer-events-none z-10">
            {activeIdx + 1} / {media.length}
          </div>
        )}

        <button
          onClick={() => setIsLightboxOpen(true)}
          title="На весь экран"
          className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Big Navigation arrows on main image */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {hasMultiple && (
        <div className="flex flex-wrap justify-center gap-2">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                i === activeIdx ? "border-primary ring-1 ring-primary" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={item.src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMedia(activeMedia, true)}

            {hasMultiple && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                  {activeIdx + 1} / {media.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
