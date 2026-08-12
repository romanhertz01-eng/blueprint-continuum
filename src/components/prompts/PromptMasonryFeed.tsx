import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Bookmark, ChevronRight } from 'lucide-react';
import { PromptItem } from '@/data/prompts/types';
import { cn } from '@/lib/utils';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';
import { TryPromptButton } from './TryPromptButton';

interface PromptMasonryFeedProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  items: PromptItem[];
}

export function PromptMasonryFeed({ title, subtitle, ctaLabel, ctaHref, items }: PromptMasonryFeedProps) {
  const [displayCount, setDisplayCount] = useState(10);
  
  if (!items || items.length === 0) return null;

  const getModelName = (providerId: string) => {
    const allProviders = [...imageProviders, ...videoProviders, ...textProviders];
    const provider = allProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const visibleItems = items.slice(0, displayCount);
  const hasMore = items.length > displayCount;

  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 md:px-8">
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div className="space-y-1">
          <h2 className="text-[24px] md:text-[26px] font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-[14px] text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <Link 
          to={ctaHref as any}
          className="text-primary text-[14px] font-medium hover:underline flex items-center gap-1 group"
        >
          {ctaLabel}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-5 gap-4 md:gap-[16px]">
        {visibleItems.map((item) => (
          <PromptDiscoveryCard key={item.slug} item={item} modelName={getModelName(item.providerId)} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => setDisplayCount(prev => prev + 10)}
            className="px-8 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-[15px] font-medium transition-colors"
          >
            Показать ещё
          </button>
        </div>
      )}
    </section>
  );
}

function PromptDiscoveryCard({ item, modelName }: { item: PromptItem, modelName: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const media = item.media[0];
  
  const aspectClass = React.useMemo(() => {
    const aspect = item.params?.aspect;
    if (aspect === '1:1') return 'aspect-square';
    if (aspect === '3:4') return 'aspect-[3/4]';
    if (aspect === '4:3') return 'aspect-[4/3]';
    if (aspect === '16:9') return 'aspect-video';
    if (aspect === '9:16') return 'aspect-[9/16]';
    if (aspect === '2:3') return 'aspect-[2/3]';
    return 'aspect-[3/4]';
  }, [item.params?.aspect]);

  useEffect(() => {
    try {
      const saves = JSON.parse(localStorage.getItem('era2_prompt_saves') || '[]');
      setIsSaved(saves.includes(item.slug));
    } catch (e) {}
  }, [item.slug]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saves = JSON.parse(localStorage.getItem('era2_prompt_saves') || '[]');
      const newSaves = isSaved ? saves.filter((s: string) => s !== item.slug) : [...saves, item.slug];
      localStorage.setItem('era2_prompt_saves', JSON.stringify(newSaves));
      setIsSaved(!isSaved);
    } catch (e) {}
  };

  return (
    <div className="break-inside-avoid mb-[20px] group/card">
      <Link
        to="/prompts/$topic/$slug"
        params={{ topic: item.topicSlug, slug: item.slug }}
        className="block"
      >
        <div className={cn(
          "relative rounded-[16px] overflow-hidden bg-muted transition-all duration-300 md:hover:hover:-translate-y-[2px]",
          aspectClass
        )}>
          {media.type === 'video' ? (
            <video 
              src={media.src} 
              poster={media.poster} 
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <img 
              src={media.src} 
              alt={media.alt} 
              className="w-full h-full object-cover" 
            />
          )}
          
          {/* Model Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <div className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-medium transition-opacity">
              {modelName}
            </div>
          </div>
          
          {/* Hover Overlay - Desktop Only */}
          <div className="absolute inset-0 bg-black/0 md:hover:hover:bg-black/20 transition-colors pointer-events-none md:hover:hover:pointer-events-auto">
            <div className="absolute inset-0 opacity-0 md:hover:hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <div className="flex justify-end">
                <button
                  onClick={toggleSave}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90",
                    isSaved ? "bg-primary text-white" : "bg-black/50 text-white hover:bg-black/70"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                </button>
              </div>

              <div className="w-full">
                <TryPromptButton 
                  item={item} 
                  label="Создать с этим промптом" 
                  className="w-full py-1.5 h-auto text-[12px] bg-primary hover:bg-primary/90 text-white border-none shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[8px] px-1">
          <h3 className="text-[14px] font-medium text-foreground line-clamp-2 leading-tight">
            {item.title}
          </h3>
          <div className="mt-[4px] text-[12px] text-muted-foreground flex items-center gap-1.5">
            <span>{modelName}</span>
            <span className="opacity-40">·</span>
            <span>{item.params?.aspect || '3:4'}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
