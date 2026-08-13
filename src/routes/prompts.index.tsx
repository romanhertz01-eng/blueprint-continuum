import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, Sparkles, PlusCircle } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getCategories, countItemsByCategory, PromptItem } from '@/data/prompts';
import { CatalogGrid } from '@/components/prompts/CatalogGrid';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const TITLE = 'Библиотека промптов для нейросетей — готовые примеры | ERA2.ai';
const DESCRIPTION = 'Библиотека лучших промптов для ChatGPT, Midjourney, Claude и других нейросетей. Бесплатные примеры, копирование без регистрации, быстрый старт генерации в ERA2.';
const CANONICAL = `${ORIGIN}/prompts`;

export const Route = createFileRoute('/prompts/')({
  component: PromptsHub,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { name: 'robots', content: 'index,follow' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: CANONICAL },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: CANONICAL }],
  }),
});

const PAGE_SIZE = 25;

function PromptsHub() {
  const allItems = getPublishedItems();
  const promptCategories = getCategories();
  const categoryCounts = countItemsByCategory();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayItems = useMemo(() => {
    // Interleave text and images for the main hub
    const textItems = allItems.filter(i => i.category === 'text');
    const imageItems = allItems.filter(i => i.category === 'image');
    const audioItems = allItems.filter(i => i.category === 'audio');
    const videoItems = allItems.filter(i => i.category === 'video');
    const otherItems = allItems.filter(i => !['text', 'image', 'audio', 'video'].includes(i.category));

    const result: PromptItem[] = [];
    let tIdx = 0, iIdx = 0, aIdx = 0, vIdx = 0, oIdx = 0;

    while (tIdx < textItems.length || iIdx < imageItems.length || aIdx < audioItems.length || vIdx < videoItems.length || oIdx < otherItems.length) {
      if (iIdx < imageItems.length) result.push(imageItems[iIdx++]);
      if (tIdx < textItems.length) result.push(textItems[tIdx++]);
      if (iIdx < imageItems.length) result.push(imageItems[iIdx++]);
      if (vIdx < videoItems.length) result.push(videoItems[vIdx++]);
      if (aIdx < audioItems.length) result.push(audioItems[aIdx++]);
      if (oIdx < otherItems.length) result.push(otherItems[oIdx++]);
    }
    return result;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return displayItems;
    return displayItems.filter(item => item.category === selectedCategory);
  }, [displayItems, selectedCategory]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, page * PAGE_SIZE);
  }, [filteredItems, page]);

  const hasMore = visibleItems.length < filteredItems.length;

  const handleShowMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. INTRO / HERO */}
      <section className="pt-12 pb-8 px-6 max-w-[1520px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Библиотека ERA2
            </div>
            <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-[0.95] mb-6">
              Мир идей для ваших <span className="text-primary">генераций</span>
            </h1>
            <p className="text-[16px] md:text-[18px] text-muted-foreground max-w-lg leading-relaxed">
              Лучшие промпты для работы, творчества и бизнеса. Исследуйте тысячи готовых сценариев.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Найти промпт..." 
                  className="h-[52px] w-full sm:w-[320px] pl-12 pr-6 rounded-2xl bg-muted/50 border border-border/40 text-[15px] outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
             </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TILES (Large) */}
      <section className="max-w-[1520px] mx-auto px-6 w-full mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...promptCategories, { slug: 'model', cardTitle: 'По моделям', title: 'По моделям' } as any].map((cat) => {
            const count = cat.slug === 'model' ? 12 : (categoryCounts[cat.slug as keyof typeof categoryCounts] || 0);
            const firstItem = allItems.find(i => i.category === cat.slug);
            const image = firstItem?.media?.[0]?.src || `/community/0${Math.floor(Math.random() * 8) + 1}.jpg`;
            const href = cat.slug === 'model' ? '/prompts/model' : `/prompts/${cat.slug}`;

            return (
              <Link
                key={cat.slug}
                to={href as any}
                className="relative h-[180px] lg:h-[240px] rounded-[28px] overflow-hidden group border border-border/10 transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <img 
                  src={image} 
                  alt={cat.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-white font-black text-[18px] md:text-[20px] mb-1 leading-tight">{cat.cardTitle || cat.title}</span>
                  <span className="text-white/70 text-[12px] font-bold uppercase tracking-wider">{cat.slug === 'model' ? 'Модели' : `${count} идей`}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. STICKY CATEGORY NAV */}
      <section className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-[1520px] mx-auto px-6 h-[64px] flex items-center gap-4 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setSelectedCategory(null)}
             className={cn(
               "px-5 py-2 rounded-full text-[14px] font-bold whitespace-nowrap transition-all border",
               selectedCategory === null 
                ? "bg-primary text-white border-primary" 
                : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted"
             )}
           >
             Все промпты
           </button>
           {promptCategories.map(cat => (
             <button
               key={cat.slug}
               onClick={() => setSelectedCategory(cat.slug)}
               className={cn(
                 "px-5 py-2 rounded-full text-[14px] font-bold whitespace-nowrap transition-all border",
                 selectedCategory === cat.slug
                  ? "bg-primary text-white border-primary"
                  : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted"
               )}
             >
               {cat.cardTitle}
             </button>
           ))}
        </div>
      </section>

      {/* 4. MAIN EDITORIAL GRID */}
      <section className="max-w-[1520px] mx-auto px-6 w-full pt-10 pb-20 flex-grow">
        <CatalogGrid items={visibleItems} />

        {/* 5. LOAD MORE */}
        {hasMore && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={handleShowMore} 
              disabled={isLoadingMore}
              className={cn(
                "h-[56px] px-12 rounded-full border border-border bg-card font-black text-[15px] flex items-center gap-4 transition-all hover:bg-muted/50 active:scale-95 disabled:opacity-50 shadow-xl",
                isLoadingMore && "animate-pulse"
              )}
            >
              {isLoadingMore ? "Загрузка..." : "Показать ещё"}
              <PlusCircle className={cn("w-5 h-5", isLoadingMore && "animate-spin")} />
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
