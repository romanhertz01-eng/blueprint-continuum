import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Bookmark } from 'lucide-react';
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

const PAGE_SIZE = 30;
const LOAD_MORE_SIZE = 20;

export function DiscoveryFeed({ currentItem }: DiscoveryFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('for-you');
  const [visibleItems, setVisibleItems] = useState<PromptItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const getModelName = (providerId: string) => {
    const allProviders = [...imageProviders, ...videoProviders, ...textProviders];
    const provider = allProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const modelName = getModelName(currentItem.providerId);

  const allItemsForFilter = useMemo(() => {
    let result: PromptItem[] = [];
    
    if (activeFilter === 'for-you') {
      const related = getRelatedItems(currentItem, 100);
      const byModel = getRelatedByModel(currentItem, 100);
      result = [...related, ...byModel].sort(() => Math.random() - 0.5);
    } else if (activeFilter === 'model') {
      result = getRelatedByModel(currentItem, 200);
    } else if (activeFilter === 'topic') {
      result = getItemsByTopic(currentItem.topicSlug).filter(i => i.slug !== currentItem.slug);
    } else if (activeFilter === 'popular') {
      result = getPublishedItems()
        .filter(i => i.category === currentItem.category && i.slug !== currentItem.slug)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    // Ensure uniqueness
    const unique = Array.from(new Map(result.map(item => [item.slug, item])).values());
    
    // Cycle/Repeat to ensure we have enough for prototype (Step 1)
    if (unique.length > 0 && unique.length < 100) {
      let repeated = [...unique];
      while (repeated.length < 100) {
        repeated = [...repeated, ...unique];
      }
      return repeated;
    }
    
    return unique;
  }, [activeFilter, currentItem]);

  // Handle filter change
  useEffect(() => {
    setVisibleItems(allItemsForFilter.slice(0, PAGE_SIZE));
    
    // Smooth scroll to top of feed when filter changes
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [allItemsForFilter]);

  const hasMore = allItemsForFilter.length > visibleItems.length;

  const loadMore = () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // BACKEND: Replace this with real server-side fetching
    // Using setTimeout 300ms to simulate loading as requested
    setTimeout(() => {
      const nextBatch = allItemsForFilter.slice(
        visibleItems.length,
        visibleItems.length + LOAD_MORE_SIZE
      );
      
      setVisibleItems(prev => [...prev, ...nextBatch]);
      setIsLoading(false);
    }, 300);
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'for-you', label: 'Для вас' },
    { id: 'model', label: modelName },
    { id: 'topic', label: 'По теме' },
    { id: 'popular', label: 'Популярное' },
  ];

  return (
    <section 
      ref={feedRef}
      className="mt-[64px] border-t border-border pt-[64px] pb-20 overflow-hidden scroll-mt-20"
    >
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-[24px]">
          <h2 className="text-[26px] font-bold text-foreground mb-[4px]">Больше идей для вас</h2>
          <p className="text-[14px] text-muted-foreground">Похожие по теме, стилю и модели</p>
        </div>

        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 mb-[24px] -mx-6 px-6 sm:mx-0 sm:px-0">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-5 py-2 rounded-full text-[14px] font-medium border transition-all whitespace-nowrap",
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
        <div className="columns-2 sm:columns-3 lg:columns-5 gap-[12px] [column-fill:balance]">
          {visibleItems.map((item, index) => (
            <DiscoveryCard 
              key={`${item.slug}-${activeFilter}-${index}`} 
              item={item} 
              modelName={getModelName(item.providerId)} 
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-[32px] flex justify-center">
            <button 
              onClick={loadMore}
              disabled={isLoading}
              className={cn(
                "px-10 py-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-[15px] font-medium transition-all min-w-[200px]",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? "Загружаем..." : "Показать ещё"}
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
    <div className="break-inside-avoid mb-[12px] group/card animate-in fade-in duration-500">
      <Link
        to="/prompts/$topic/$slug"
        params={{ topic: item.topicSlug, slug: item.slug }}
        className="block"
      >
        <div 
          className="relative rounded-[14px] overflow-hidden bg-muted transition-all duration-300"
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
          
          {/* Hover Overlay - Desktop Only (@media hover:hover) */}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 pointer-events-none @media(hover:hover):group-hover/card:bg-black/30 @media(hover:hover):group-hover/card:pointer-events-auto">
            <div className="absolute inset-0 opacity-0 @media(hover:hover):group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
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

              <div className="w-full transform translate-y-2 @media(hover:hover):group-hover/card:translate-y-0 transition-transform duration-300">
                <TryPromptButton 
                  item={item} 
                  label="Создать" 
                  className="w-full py-2 h-auto text-[13px] font-semibold bg-white text-black hover:bg-white/90 border-none shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[6px] px-1">
          <h3 className="text-[14px] font-semibold text-foreground truncate leading-[18px] mb-[2px]">
            {item.title}
          </h3>
          <div className="text-[12px] text-muted-foreground flex items-center gap-1.5 font-normal leading-[16px]">
            <span>{modelName}</span>
            <span className="opacity-30">·</span>
            <span>{item.params?.aspect || '3:4'}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
