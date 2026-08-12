import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Bookmark } from 'lucide-react';
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

  // Regular shelf: horizontal row of 5
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-[16px]">
        {items.slice(0, 5).map((item) => (
          <PromptShelfCard key={item.slug} item={item} modelName={getModelName(item.providerId)} />
        ))}
      </div>
    </section>
  );
}

function PromptShelfCard({ item, modelName }: { item: PromptItem, modelName: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const media = item.media[0];
  
  // Single fixed aspect for shelf
  const aspectClass = "aspect-[3/4]";

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
    <div className="group/card">
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
