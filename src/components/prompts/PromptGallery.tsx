import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptItem } from '@/data/prompts/types';

interface PromptGalleryProps {
  media: PromptItem['media'];
  title: string;
}

export function PromptGallery({ media, title }: PromptGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // SSR-safe scroll lock
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isLightboxOpen]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeIdx]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const activeMedia = media[activeIdx];
  const hasMultiple = media.length > 1;

  const renderMedia = (item: typeof activeMedia, className?: string, isVideoControllable = true) => {
    if (item.type === 'video') {
      return (
        <video
          src={item.src}
          poster={item.poster}
          controls={isVideoControllable}
          className={cn("w-full h-full object-contain bg-black", className)}
        />
      );
    }
    return (
      <img
        src={item.src}
        alt={title}
        className={cn("w-full h-full object-contain", className)}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Container */}
      <div className="relative group bg-muted rounded-xl border border-border overflow-hidden">
        <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]">
          {renderMedia(activeMedia)}
        </div>

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Counter */}
            <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded font-medium z-10">
              {activeIdx + 1} / {media.length}
            </div>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
          title="На весь экран"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {media.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "relative w-[72px] h-[72px] flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                activeIdx === idx ? "border-primary" : "border-border hover:border-muted-foreground/50"
              )}
            >
              <img src={item.poster || item.src} className="w-full h-full object-cover" alt="" />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          {/* Header */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Center Stage */}
          <div className="flex-1 relative flex items-center justify-center px-4 md:px-20 pb-10">
            <div 
              className="absolute inset-0" 
              onClick={() => setIsLightboxOpen(false)} 
            />
            
            <div className="relative max-w-full max-h-full flex items-center justify-center z-10">
              {renderMedia(activeMedia, "max-h-[85vh]")}
            </div>

            {hasMultiple && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-20"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
