import React, { useState, useEffect, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Bookmark, Heart, Share2 } from 'lucide-react';
import { PromptItem } from '@/data/prompts/types';
import { cn } from '@/lib/utils';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';
import { TryPromptButton } from './TryPromptButton';
import { getRelatedItems, getRelatedByModel, getItemsByTopic, getPublishedItems } from '@/data/prompts';

interface DiscoveryFeedProps {
  currentItem: PromptItem;
}

type FilterType = 'for-you' | 'model' | 'topic' | 'popular';

export function DiscoveryFeed({ currentItem }: DiscoveryFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('for-you');
  const [displayCount, setDisplayCount] = useState(20);

  const getModelName = (providerId: string) => {
    const allProviders = [...imageProviders, ...videoProviders, ...textProviders];
    const provider = allProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const modelName = getModelName(currentItem.providerId);

  const items = useMemo(() => {
    let result: PromptItem[] = [];
    
    if (activeFilter === 'for-you') {
      const related = getRelatedItems(currentItem, 20);
      const byModel = getRelatedByModel(currentItem, 20);
      result = [...related, ...byModel].sort(() => Math.random() - 0.5);
    } else if (activeFilter === 'model') {
      result = getRelatedByModel(currentItem, 40);
    } else if (activeFilter === 'topic') {
      result = getItemsByTopic(currentItem.topicSlug).filter(i => i.slug !== currentItem.slug);
    } else if (activeFilter === 'popular') {
      result = getPublishedItems()
        .filter(i => i.category === currentItem.category && i.slug !== currentItem.slug)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    const unique = Array.from(new Map(result.map(item => [item.slug, item])).values());
    return unique;
  }, [activeFilter, currentItem]);

  const visibleItems = items.slice(0, displayCount);
  const hasMore = items.length > displayCount;

  const filters: { id: FilterType; label: string }[] = [
    { id: 'for-you', label: 'Для вас' },
    { id: 'model', label: modelName },
    { id: 'topic', label: 'По теме' },
    { id: 'popular', label: 'Популярное' },
  ];

  return (
    <section className="mt-[64px] border-t border-border pt-[64px] pb-20 overflow-hidden">
      <div className="max-w-[1480px] mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-[26px] font-bold text-foreground mb-1">Больше идей для вас</h2>
          <p className="text-[14px] text-muted-foreground">Похожие по теме, стилю и модели</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setDisplayCount(20);
              }}
              className={cn(
                "px-5 py-2 rounded-full text-[14px] font-medium border transition-all",
                activeFilter === filter.id
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted/40 border-border text-foreground/70 hover:bg-muted/60"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* MASONRY: CSS columns */}
        <div className="columns-2 sm:columns-3 lg:columns-5 gap-[16px] [column-fill:balance]">
          {visibleItems.map((item, index) => (
            <DiscoveryCard 
              key={`${item.slug}-${activeFilter}-${index}`} 
              item={item} 
              modelName={getModelName(item.providerId)} 
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => setDisplayCount(prev => prev + 10)}
              className="px-10 py-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-[15px] font-medium transition-colors"
            >
              Показать ещё
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function DiscoveryCard({ item, modelName }: { item: PromptItem, modelName: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const media = item.media[0];
  
  const aspectStyle = React.useMemo(() => {
    const aspect = item.params?.aspect || '3:4';
    const [w, h] = aspect.split(':').map(Number);
    if (!w || !h) return { aspectRatio: '3/4' };
    return { aspectRatio: `${w}/${h}` };
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
        <div 
          className="relative rounded-[18px] overflow-hidden bg-muted transition-all duration-300 md:hover:-translate-y-[2px]"
          style={aspectStyle}
        >
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
              loading="lazy"
            />
          )}
          
          {/* Hover Overlay - Desktop Only */}
          <div className="absolute inset-0 bg-black/0 md:group-hover/card:bg-black/20 transition-all duration-300 pointer-events-none md:group-hover/card:pointer-events-auto">
            <div className="absolute inset-0 opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
              <div className="flex justify-end">
                <button
                  onClick={toggleSave}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg",
                    isSaved ? "bg-primary text-white" : "bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
                  )}
                >
                  <Bookmark className={cn("w-4.5 h-4.5", isSaved && "fill-current")} />
                </button>
              </div>

              <div className="w-full transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                <TryPromptButton 
                  item={item} 
                  label="Создать" 
                  className="w-full py-2 h-auto text-[13px] font-semibold bg-white text-black hover:bg-white/90 border-none shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[8px] px-1">
          <h3 className="text-[15px] font-semibold text-foreground line-clamp-2 leading-[1.3] mb-1">
            {item.title}
          </h3>
          <div className="text-[13px] text-muted-foreground flex items-center gap-1.5 font-normal">
            <span>{modelName}</span>
            <span className="opacity-30">·</span>
            <span>{item.params?.aspect || '3:4'}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}