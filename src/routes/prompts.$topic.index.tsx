import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, X, Sparkles, Star, PlusCircle, ArrowRight, Home, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getCategories, PromptItem, getItemsByCategory } from '@/data/prompts';
import { EditorialPromptCard } from '@/components/prompts/EditorialPromptCard';
import { TextPromptCard } from '@/components/prompts/TextPromptCard';
import { AudioPromptCard } from '@/components/prompts/AudioPromptCard';
import { AgentPromptCard } from '@/components/prompts/AgentPromptCard';
import { CatalogCard } from '@/components/prompts/CatalogCard';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ORIGIN } from '@/lib/origin';

const PAGE_SIZE = 30;

export const Route = createFileRoute('/prompts/$topic/')({
  component: CategoryPage,
  loader: ({ params }) => {
    const categories = getCategories();
    const currentCategory = categories.find(c => c.slug === params.topic);
    const items = getItemsByCategory(params.topic as any);
    
    return {
      category: currentCategory,
      items,
      topicSlug: params.topic,
      allCategories: categories
    };
  },
  head: (options) => {
    const data = options.loaderData as { 
      category?: any; 
      items: any[]; 
      topicSlug: string; 
      allCategories: any[] 
    };
    if (!data) return {};
    
    const title = data.category?.seoTitle || `Промпты для ${data.category?.cardTitle || data.topicSlug} — ERA2.ai`;
    const description = data.category?.seoDescription || `Библиотека лучших промптов для ${data.category?.cardTitle || data.topicSlug}. Готовые примеры и инструкции.`;
    const canonical = `${ORIGIN}/prompts/${data.topicSlug}`;

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonical },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  }
});

function CategoryPage() {
  const data = Route.useLoaderData();
  const params = Route.useParams();
  const isVideo = params.topic === 'video';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'alpha'>('new');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Фильтр по типу видео (только для раздела видео)
  const [videoFilter, setVideoFilter] = useState('Все');
  const videoFilters = [
    'Все', 'Реклама', 'Обзор товара', 'Тревел', 'Кинокадр', 'Вертикальные', 'Motion'
  ];

  const filteredItems = useMemo(() => {
    let result = [...data.items];

    // Поиск
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.promptRu.toLowerCase().includes(q)
      );
    }

    // Фильтр по типу видео
    if (isVideo && videoFilter !== 'Все') {
      result = result.filter(item => {
        if (videoFilter === 'Вертикальные') return item.params?.aspect === '9:16';
        // Для остальных — поиск по совпадению в темах/описании (имитация)
        return item.topicSlug === videoFilter.toLowerCase() || 
               item.title.toLowerCase().includes(videoFilter.toLowerCase());
      });
    }

    // Сортировка
    if (sortBy === 'new') {
      result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [data.items, searchQuery, sortBy, videoFilter, isVideo]);

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

  const getCardType = (index: number, item: PromptItem): 'A' | 'B' | 'C' | 'D' | 'E' => {
    // 1. Приоритет ручному layout (из админки)
    if (item.layout === 'wide') return 'D';
    if (item.layout === 'featured') return 'E';

    // 2. Автоматическое определение по свойствам
    const hasMedia = !!item.media?.[0]?.src && item.category !== 'text';
    
    // Если текстовый - тип C
    if (!hasMedia) return 'C';

    // Ритмичность через хэш слага (стабильно при добавлении соседей)
    const charSum = item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hash = charSum % 10;
    
    // image-first (тип B) для некоторых карточек с медиа
    if (hash === 2 || hash === 7) return 'B';
    
    return 'A';
  };

  const getCardSpan = (type: 'A' | 'B' | 'C' | 'D' | 'E', item?: PromptItem): string => {
    switch (type) {
      case 'A': return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case 'B': return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case 'C': return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case 'D': return 'col-span-12 lg:col-span-6';
      case 'E': return 'col-span-12 lg:col-span-6';
      default: return 'col-span-12';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. ШАПКА / BREADCRUMBS */}
      <section className="pt-6 pb-4 px-6 max-w-7xl mx-auto w-full">
        <nav className="flex items-center gap-2 text-[12px] text-muted-foreground mb-6 font-medium">
          <Link to="/prompts" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="w-3 h-3" /> Главная
          </Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground">{data.category?.cardTitle || data.topicSlug}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-[32px] md:text-[42px] font-bold tracking-tight">
                {isVideo ? 'Промпты для видео' : data.category?.title}
              </h1>
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            </div>
            <p className="text-muted-foreground text-[15px] max-w-2xl leading-relaxed">
              {isVideo 
                ? 'Готовые сценарии, стили и идеи для генерации видео' 
                : (data.category?.description || 'Библиотека лучших промптов от экспертов ERA2.')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-bold border border-border/50 text-muted-foreground flex items-center gap-1.5">
               <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {data.items.length} промптов
            </div>
            <div className="px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-bold border border-border/50 text-muted-foreground flex items-center gap-1.5">
               <ArrowRight className="w-3.5 h-3.5" /> Обновляется ежедневно
            </div>
          </div>
        </div>
      </section>

      {/* 2. ЛЕНТА КАТЕГОРИЙ (PILLS) */}
      <section className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Link
              to="/prompts"
              className="px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border bg-muted/30 border-border/50 hover:bg-muted/60 text-muted-foreground"
            >
              Все темы
            </Link>
            {data.allCategories.map(cat => (
              <Link
                key={cat.slug}
                to="/prompts/$topic"
                params={{ topic: cat.slug }}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border",
                  params.topic === cat.slug
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-muted/30 border-border/50 hover:bg-muted/60 text-muted-foreground"
                )}
              >
                {cat.cardTitle}
              </Link>
            ))}
          </div>

          {/* ВТОРИЧНАЯ ЛЕНТА ФИЛЬТРОВ ДЛЯ ВИДЕО */}
          {isVideo && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {videoFilters.map(filter => (
                  <button
                    key={filter}
                    onClick={() => {setVideoFilter(filter); setPage(1);}}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border uppercase tracking-wider",
                      videoFilter === filter
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "bg-muted/20 border-border/50 hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. СТРОКА СОРТИРОВКИ */}
      <section className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between mb-6">
        <div className="text-[13px] font-medium text-muted-foreground">
          Найдено <span className="text-foreground font-bold ml-1">{filteredItems.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Поиск в разделе..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-xl bg-muted/30 border border-border/50 text-[13px] focus:ring-1 focus:ring-primary outline-none w-48 transition-all focus:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Сортировка:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-[13px] font-bold text-foreground focus:ring-0 cursor-pointer outline-none"
            >
              <option value="new">Сначала новые</option>
              <option value="popular">Популярные</option>
              <option value="alpha">А–Я</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. MIXED-GRID */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-20 flex-grow">
        {visibleItems.length > 0 ? (
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {visibleItems.map((item, idx) => {
              if (params.topic === 'text') {
                return (
                  <div key={`${item.slug}-${idx}`} className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2.4">
                    <CatalogCard item={item} index={idx} />
                  </div>
                );
              }
              if (item.category === 'audio') {
                return (
                  <div key={`${item.slug}-${idx}`} className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
                    <AudioPromptCard item={item} />
                  </div>
                );
              }
              if (item.category === 'agents') {
                return (
                  <div key={`${item.slug}-${idx}`} className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
                    <AgentPromptCard item={item} />
                  </div>
                );
              }

              const type = getCardType(idx, item);
              const span = getCardSpan(type, item);
              return (
                <div key={`${item.slug}-${idx}`} className={span}>
                  <EditorialPromptCard item={item} type={type} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center bg-muted/10 rounded-[32px] border border-dashed border-border/50">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ничего не найдено</h3>
            <p className="text-muted-foreground mb-8">Попробуйте изменить параметры поиска или фильтры</p>
            <button 
              onClick={() => {setSearchQuery(''); setVideoFilter('Все');}}
              className="h-11 px-8 rounded-xl bg-primary text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* 5. ПОКАЗАТЬ ЕЩЁ */}
        {hasMore && (
          <div className="mt-16 flex justify-center">
            <button 
              onClick={handleShowMore} 
              disabled={isLoadingMore}
              className={cn(
                "h-12 px-10 rounded-full border border-border bg-card font-bold text-[14px] flex items-center gap-3 transition-all hover:bg-muted/50 active:scale-95 disabled:opacity-50",
                isLoadingMore && "animate-pulse"
              )}
            >
              {isLoadingMore ? "Загрузка..." : "Показать ещё"}
              <PlusCircle className={cn("w-4 h-4", isLoadingMore && "animate-spin")} />
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}