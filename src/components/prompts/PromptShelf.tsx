import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Bookmark, Check } from 'lucide-react';
import { PromptItem } from '@/data/prompts/types';
import { cn } from '@/lib/utils';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';
import { TryPromptButton } from './TryPromptButton';

interface PromptShelfProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  items: PromptItem[];
}

export function PromptShelf({ title, subtitle, ctaLabel, ctaHref, items }: PromptShelfProps) {
  if (!items || items.length === 0) return null;

  const getModelName = (providerId: string) => {
    const allProviders = [...imageProviders, ...videoProviders, ...textProviders];
    const provider = allProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 md:px-8">
      <div className="flex items-end justify-between mb-4 md:mb-5">
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

      <div className="columns-2 md:columns-3 lg:columns-5 xl:columns-6 gap-3">
        {items.map((item) => (
          <PromptMasonryCard key={item.slug} item={item} modelName={getModelName(item.providerId)} />
        ))}
      </div>
    </section>
  );
}

function PromptMasonryCard({ item, modelName }: { item: PromptItem, modelName: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const media = item.media[0];
  
  // Pinterest pattern: hover only on desktop
  const aspectClass = React.useMemo(() => {
    const aspect = item.params?.aspect;
    if (aspect === '1:1') return 'aspect-square';
    if (aspect === '3:4') return 'aspect-[3/4]';
    if (aspect === '4:3') return 'aspect-[4/3]';
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
    <div className="break-inside-avoid mb-3 group/card">
      <Link
        to="/prompts/$topic/$slug"
        params={{ topic: item.topicSlug, slug: item.slug }}
        className="block"
      >
        <div className={cn(
          "relative rounded-[16px] overflow-hidden bg-muted transition-all duration-300 md:group-hover/card:-translate-y-0.5",
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
              className="w-full h-full object-cover transition-transform duration-700 md:group-hover/card:scale-105" 
            />
          )}
          
          {/* Default Model Chip */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <div className="bg-black/60 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium opacity-80 group-hover/card:opacity-100 transition-opacity">
              {modelName}
            </div>
          </div>

          {/* Status Badge (if exists) */}
          {(item as any).status_badge && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <div className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {(item as any).status_badge}
              </div>
            </div>
          )}
          
          {/* Hover Overlay - Desktop Only */}
          <div className="absolute inset-0 bg-black/0 md:group-hover/card:bg-black/20 transition-colors pointer-events-none md:pointer-events-auto">
            <div className="absolute inset-0 opacity-0 md:group-hover/card:opacity-100 transition-opacity flex flex-col justify-between p-3">
              {/* Top Right Actions */}
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

              {/* Bottom Actions */}
              <div className="w-full">
                <TryPromptButton 
                  item={item} 
                  label="Создать" 
                  className="w-full py-1.5 h-auto text-[12px] bg-primary hover:bg-primary/90 text-white border-none shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2.5 px-1 space-y-0.5">
          <h3 className="text-[14px] font-semibold text-foreground line-clamp-2 leading-tight group-hover/card:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
            <span>{modelName}</span>
            <span className="opacity-40">·</span>
            <span>{item.params?.aspect || '3:4'}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

