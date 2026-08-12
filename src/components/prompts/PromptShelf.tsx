import React from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { PromptItem } from '@/data/prompts/types';
import { cn } from '@/lib/utils';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';
import { promptTopics } from '@/data/prompts/topics';


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
      <div className="flex items-end justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-[20px] md:text-[22px] font-bold tracking-tight text-foreground">
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

      <div className="relative group">
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x no-scrollbar">
          {items.map((item) => {
            const modelName = getModelName(item.providerId);
            const mainTopic = promptTopics.find((t) => t.slug === item.topicSlug);
            const media = item.media[0];
            
            return (
              <Link
                key={item.slug}
                to="/prompts/$topic/$slug"
                params={{ topic: item.topicSlug, slug: item.slug }}
                className="flex-none w-[280px] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] snap-start group/card"
              >
                <div className="relative aspect-[3/4] rounded-[18px] overflow-hidden bg-muted transition-transform duration-300 group-hover/card:-translate-y-1">
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
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" 
                    />
                  )}
                  
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors" />
                  
                  {/* Badges Top Left */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-medium">
                      {modelName}
                    </div>
                    <div className="bg-primary/90 text-white text-[11px] px-2 py-0.5 rounded font-medium">
                      Бесплатно
                    </div>
                  </div>

                  {/* Open Icon Top Right */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-80 group-hover/card:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    {item.category} · {mainTopic?.cardTitle || mainTopic?.title || item.topicSlug}
                  </div>
                  <h3 className="text-[14px] font-semibold text-foreground line-clamp-2 leading-snug group-hover/card:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex justify-end mt-1">
                    <span className="text-[12px] text-muted-foreground">Бесплатно</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
