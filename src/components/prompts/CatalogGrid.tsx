import { PromptItem } from "@/data/prompts/types";
import { cn } from "@/lib/utils";
import { Heart, Type, Image as ImageIcon, Music, Play, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import React from 'react';

interface CatalogCardProps {
  item: PromptItem;
  type: 'Light' | 'Image' | 'Soft';
}

const CategoryIcon = ({ category, className }: { category: string; className?: string }) => {
  switch (category) {
    case 'text': return <Type className={className} />;
    case 'audio': return <Music className={className} />;
    case 'video': return <Play className={className} />;
    default: return <ImageIcon className={className} />;
  }
};

export const CatalogCard = ({ item, type }: CatalogCardProps) => {
  const hasMedia = !!item.media?.[0]?.src;
  
  if (type === 'Image' && hasMedia) {
    return (
      <Link 
        to="/prompts/$topic/$slug"
        params={{ topic: item.topicSlug || item.category, slug: item.slug }}
        className="group relative flex flex-col w-full h-[400px] rounded-[24px] overflow-hidden bg-card border border-border/40 transition-all hover:shadow-xl hover:-translate-y-1"
      >
        <img 
          src={item.media![0].src} 
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <CategoryIcon category={item.category} className="w-4 h-4 text-white" />
          </div>
          <button className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-auto p-5 relative z-10">
          <h3 className="text-white text-[17px] font-bold leading-tight mb-4 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[12px] font-medium">
              Попробовать
            </div>
            {item.providerId && (
              <span className="text-white/50 text-[11px] font-medium uppercase tracking-wider">
                {item.providerId}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  const isSoft = type === 'Soft';
  const bgClass = isSoft 
    ? "bg-gradient-to-br from-primary/5 to-orange-500/5 border-primary/10" 
    : "bg-card border-border/40";

  return (
    <Link 
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug || item.category, slug: item.slug }}
      className={cn(
        "group flex flex-col w-full h-[400px] rounded-[24px] border p-5 transition-all hover:shadow-xl hover:-translate-y-1",
        bgClass
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isSoft ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <CategoryIcon category={item.category} className="w-5 h-5" />
        </div>
        <button className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {hasMedia && !isSoft ? (
        <div className="w-full aspect-[4/3] rounded-[16px] overflow-hidden mb-4 bg-muted">
          <img src={item.media![0].src} className="w-full h-full object-cover" alt="" />
        </div>
      ) : (
        <div className={cn(
          "w-full aspect-[4/3] rounded-[16px] mb-4 flex items-center justify-center p-6 text-center",
          isSoft ? "bg-white/40" : "bg-muted/40"
        )}>
           <span className="text-[14px] text-muted-foreground italic line-clamp-3">
             {item.promptRu}
           </span>
        </div>
      )}

      <h3 className="text-[17px] font-bold leading-tight mb-2 line-clamp-2">
        {item.title}
      </h3>
      
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/10">
        <div className="px-3 py-1.5 rounded-full bg-primary text-white text-[12px] font-bold shadow-sm shadow-primary/20">
          Попробовать
        </div>
        {item.providerId && (
          <span className="text-muted-foreground/60 text-[11px] font-medium uppercase tracking-wider">
            {item.providerId}
          </span>
        )}
      </div>
    </Link>
  );
};

export const CollectionShelf = ({ title, subtitle, items }: { title: string, subtitle: string, items: PromptItem[] }) => {
  return (
    <div className="col-span-full py-6">
      <div className="bg-muted/30 rounded-[28px] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-black tracking-tight">{title}</h2>
            <p className="text-muted-foreground text-[14px]">{subtitle}</p>
          </div>
          <button className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all group">
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
          {items.map((item) => (
            <Link 
              key={item.slug}
              to="/prompts/$topic/$slug"
              params={{ topic: item.topicSlug || item.category, slug: item.slug }}
              className="flex-shrink-0 w-[180px] group"
            >
              <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden mb-3">
                {item.media?.[0]?.src ? (
                  <img src={item.media[0].src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-orange-500/20" />
                )}
                <div className="absolute top-2 right-2">
                  <div className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
              <h4 className="text-[14px] font-bold leading-snug line-clamp-2 px-1 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EditorialBanner = ({ 
  title, 
  subtitle, 
  badge, 
  cta, 
  image 
}: { 
  title: string, 
  subtitle: string, 
  badge: string, 
  cta: string, 
  image?: string 
}) => {
  return (
    <div className="col-span-full h-[340px] rounded-[32px] overflow-hidden relative group cursor-pointer bg-neutral-900 border border-border/20">
      {image && (
        <img src={image} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105" alt="" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center items-start z-10">
        <div className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-black uppercase tracking-widest mb-6">
          {badge}
        </div>
        <h2 className="text-[28px] md:text-[40px] font-black text-white leading-tight mb-4 max-w-2xl">
          {title}
        </h2>
        <p className="text-white/70 text-[16px] md:text-[18px] mb-8 max-w-xl font-medium">
          {subtitle}
        </p>
        <button className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-[15px] hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-95">
          {cta}
        </button>
      </div>
    </div>
  );
};

export const CatalogGrid = ({ items }: { items: PromptItem[] }) => {
  const elements: React.ReactNode[] = [];
  
  let currentPos = 0;
  let shelfIndex = 0;
  let bannerIndex = 0;

  const mockShelves = [
    { title: "Топ промптов недели", subtitle: "Лучшие идеи по мнению сообщества" },
    { title: "Для вашего бизнеса", subtitle: "Инструменты для продуктивности" },
  ];

  const mockBanners = [
    { badge: "КУРС", title: "Мастер промптов: От новичка до PRO", subtitle: "Научим писать идеальные промпты за 5 дней", cta: "Начать обучение" },
    { badge: "НОВОЕ", title: "Обновление библиотеки: Видео-генерация", subtitle: "Более 100 новых сценариев для Luma и Runway", cta: "Смотреть новинки" },
  ];

  while (currentPos < items.length) {
    const batchSize = elements.length % 25 === 0 ? 10 : 15;
    const batch = items.slice(currentPos, currentPos + batchSize);
    
    batch.forEach((item, idx) => {
      let type: 'Light' | 'Image' | 'Soft' = 'Light';
      const hasMedia = !!item.media?.[0]?.src;
      
      if (!hasMedia || item.category === 'text' || item.category === 'audio') {
        type = 'Soft';
      } else if (idx % 3 === 0) {
        type = 'Image';
      }

      elements.push(
        <div key={`card-${item.slug}-${currentPos + idx}`} className="col-span-12 sm:col-span-6 lg:col-span-1">
          <CatalogCard item={item} type={type} />
        </div>
      );
    });
    currentPos += batchSize;

    if (currentPos < items.length) {
      if (elements.length % 30 === 10) {
        const shelfData = mockShelves[shelfIndex % mockShelves.length];
        const shelfItems = items.slice(currentPos, currentPos + 7);
        elements.push(
          <CollectionShelf 
            key={`shelf-${shelfIndex}`}
            title={shelfData.title}
            subtitle={shelfData.subtitle}
            items={shelfItems}
          />
        );
        shelfIndex++;
      } else if (elements.length % 40 === 25) {
        const bannerData = mockBanners[bannerIndex % mockBanners.length];
        elements.push(
          <EditorialBanner
            key={`banner-${bannerIndex}`}
            {...bannerData}
            image={`/community/0${(bannerIndex % 8) + 1}.jpg`}
          />
        );
        bannerIndex++;
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-[18px] md:gap-[20px]">
      {elements}
    </div>
  );
};
