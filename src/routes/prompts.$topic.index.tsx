import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, X, Sparkles, Star, PlusCircle, ArrowRight, Home, ChevronRight, Heart, Zap, LayoutGrid, Check } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getCategories, PromptItem, getItemsByCategory, getTopicsByCategory } from '@/data/prompts';
import { EditorialPromptCard } from '@/components/prompts/EditorialPromptCard';
import { TextPromptCard } from '@/components/prompts/TextPromptCard';
import { AudioPromptCard } from '@/components/prompts/AudioPromptCard';
import { AgentPromptCard } from '@/components/prompts/AgentPromptCard';

import { useState, useMemo, useRef, useEffect } from 'react';
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


function TextCategoryCard({ item }: { item: PromptItem }) {
  const providerColors: Record<string, string> = {
    chatgpt: 'bg-[#10a37f]/7',
    claude: 'bg-[#d97757]/7',
    gemini: 'bg-[#4285f4]/7',
    deepseek: 'bg-[#60a5fa]/7',
  };
  
  const tintClass = providerColors[item.providerId.toLowerCase()] || 'bg-muted/7';

  return (
    <Link 
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug, slug: item.slug }}
      className={cn(
        "group relative flex flex-col p-5 rounded-2xl border border-dashed border-border bg-card aspect-[4/5] transition-all duration-200 hover:-translate-y-0.5 hover:border-solid hover:border-primary/40 overflow-hidden",
        tintClass
      )}
    >
      {/* Upper row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-muted/50 border border-border/60">
          {item.providerId}
        </span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="w-3.5 h-3.5" />
          <span className="text-[13px]">{item.likes}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-4 text-[17px] font-bold line-clamp-2 leading-tight">
        {item.title}
      </h3>

      {/* Prompt text */}
      <div className="mt-3 flex-1 text-[14px] text-muted-foreground italic leading-relaxed line-clamp-6">
        «{item.promptRu}»
      </div>

      {/* Bottom row */}
      <div className="mt-4 flex items-center gap-2 text-primary font-bold text-[14px]">
        <Zap className="w-3.5 h-3.5" /> Попробовать
      </div>
    </Link>
  );
}

function CategoryPage() {
  const data = Route.useLoaderData();
  const params = Route.useParams();
  const isVideo = params.topic === 'video';
  const isAudio = params.topic === 'audio';
  const isText = params.topic === 'text';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'alpha'>('new');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Категории (фильтры тем)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPanelOpen(false);
    };
    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isPanelOpen]);

  const categoryTopics = useMemo(() => {
    const topics = getTopicsByCategory(params.topic as any);
    // Фильтруем темы, у которых есть хотя бы один промпт в этой категории
    return topics.filter(topic => 
      data.items.some(item => item.topicSlug === topic.slug || item.extraTopicSlugs?.includes(topic.slug))
    );
  }, [params.topic, data.items]);

  // Сброс фильтров при смене категории
  useEffect(() => {
    setSelectedTopics([]);
    setIsPanelOpen(false);
  }, [params.topic]);

  // Данные для аудио-полок
  const audioShelvesData = useMemo(() => {
    if (!isAudio || searchQuery.trim()) return [];
    
    const audioTopics = getTopicsByCategory('audio');
    const topicsWithPrompts = audioTopics.map(topic => {
      // Собираем промпты, где topicSlug совпадает ИЛИ slug темы есть в extraTopicSlugs
      const prompts = data.items.filter(item => 
        item.topicSlug === topic.slug || item.extraTopicSlugs?.includes(topic.slug)
      );
      return { topic, prompts };
    })
    .filter(shelf => shelf.prompts.length >= 3) // Снизили порог до 3
    .sort((a, b) => b.prompts.length - a.prompts.length)
    .slice(0, 2);

    // Фолбэк: если подходящих тем мало, но аудио промптов достаточно (>=6)
    if (topicsWithPrompts.length === 0 && data.items.length >= 6) {
      const popularPrompts = [...data.items]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 8);
      
      return [{
        topic: { 
          slug: 'popular', 
          title: 'Популярное в аудио',
          cardTitle: 'Популярное'
        } as any,
        prompts: popularPrompts,
        isFallback: true
      }];
    }

    return topicsWithPrompts;
  }, [isAudio, searchQuery, data.items]);

  const topicIcons: Record<string, any> = {
    'seo': Sparkles,
    'marketing': Zap,
    'coding': LayoutGrid,
    'education': Star,
  };
  
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
        (item.promptRu && item.promptRu.toLowerCase().includes(q))
      );
    }

    // Фильтр по темам (множественный выбор)
    if (selectedTopics.length > 0) {
      result = result.filter(item => 
        selectedTopics.includes(item.topicSlug) || 
        item.extraTopicSlugs?.some(slug => selectedTopics.includes(slug))
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
      <section className={cn(
        "pt-6 pb-4 px-6 max-w-7xl mx-auto w-full",
        isAudio && "pt-4 pb-2"
      )}>
        <nav className="flex items-center gap-2 text-[12px] text-muted-foreground mb-6 font-medium">
          <Link to="/prompts" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="w-3 h-3" /> Главная
          </Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground">{data.category?.cardTitle || data.topicSlug}</span>
        </nav>

        <div className={cn(
          "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8",
          isAudio && "mb-5"
        )}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-[32px] md:text-[42px] font-bold tracking-tight">
                {isVideo ? 'Промпты для видео' : data.category?.title}
              </h1>
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            </div>
            <p className={cn(
              "text-muted-foreground text-[15px] max-w-2xl leading-relaxed",
              isAudio && "line-clamp-1"
            )}>
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
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
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

          {/* ВТОРАЯ СТРОКА: Кнопка "Категории" и опциональные чипы тем */}
          <div className={cn(
            "flex items-center gap-3",
            isVideo ? "mt-4 pt-4 border-t border-border/40" : "mt-4 pt-0"
          )}>
            {categoryTopics.length >= 2 && (
              <div className="relative shrink-0" ref={panelRef}>
                <button
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                  className="h-11 px-5 rounded-full border border-border bg-card flex items-center gap-2.5 transition-all hover:bg-muted/50"
                >
                  <LayoutGrid className="w-4 h-4 text-foreground" />
                  <span className="text-[13px] font-semibold text-foreground">Категории</span>
                  {selectedTopics.length > 0 && (
                    <div className="flex items-center justify-center bg-primary text-white text-[11px] font-bold w-5 h-5 rounded-full">
                      {selectedTopics.length}
                    </div>
                  )}
                </button>

                {isPanelOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-[340px] rounded-2xl bg-card border border-border shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-[15px] font-bold mb-3">Категории</div>
                    <div className="max-h-[340px] overflow-y-auto no-scrollbar pr-1 flex flex-col gap-1">
                      {categoryTopics.map(topic => {
                        const Icon = topicIcons[topic.slug] || Sparkles;
                        const isSelected = selectedTopics.includes(topic.slug);
                        return (
                          <div 
                            key={topic.slug}
                            onClick={() => {
                              setSelectedTopics(prev => 
                                isSelected ? prev.filter(s => s !== topic.slug) : [...prev, topic.slug]
                              );
                            }}
                            className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <Icon className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 text-[14px] font-medium text-foreground">
                              {topic.cardTitle || topic.title}
                            </div>
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                              isSelected ? "bg-primary border-primary" : "border-border"
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between sticky bottom-0 bg-card">
                      {selectedTopics.length > 0 ? (
                        <button 
                          onClick={() => setSelectedTopics([])}
                          className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium"
                        >
                          Сбросить
                        </button>
                      ) : <div />}
                      <button 
                        onClick={() => setIsPanelOpen(false)}
                        className="h-9 px-5 rounded-xl bg-primary text-white text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all"
                      >
                        Показать
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ВТОРИЧНАЯ ЛЕНТА ФИЛЬТРОВ ДЛЯ ВИДЕО */}
            {isVideo && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar ml-3">
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
            )}
          </div>
        </div>
      </section>

      {/* 3. СТРОКА СОРТИРОВКИ */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        {/* АУДИО ПОЛКИ */}
        {isAudio && audioShelvesData.length > 0 && !searchQuery.trim() && (
          <div className="flex flex-col gap-10 mb-10">
            {(audioShelvesData as any[]).map((shelf, shelfIdx) => {
              const scrollRef = useRef<HTMLDivElement>(null);
              const gradients = [
                'from-indigo-500/80 to-purple-500/80',
                'from-emerald-500/80 to-teal-500/80',
                'from-orange-500/80 to-rose-500/80',
                'from-blue-500/80 to-cyan-500/80',
              ];
              const gradient = gradients[shelfIdx % gradients.length];

              return (
                <div key={shelf.topic.slug} className="group/shelf py-5 relative">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[20px] font-bold">{shelf.topic.title}</h2>
                    {!shelf.isFallback && (
                      <Link 
                        to="/prompts/$topic" 
                        params={{ topic: shelf.topic.slug }}
                        className="text-[13px] font-bold text-primary hover:underline"
                      >
                        Показать всё →
                      </Link>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div 
                      ref={scrollRef}
                      className="flex gap-[14px] overflow-x-auto no-scrollbar snap-x snap-mandatory w-[calc(100%+40px)] pb-4"
                    >
                      {shelf.prompts.map((item: PromptItem) => (
                        <Link
                          key={item.slug}
                          to="/prompts/$topic/$slug"
                          params={{ topic: item.topicSlug, slug: item.slug }}
                          className="flex-shrink-0 w-[190px] aspect-square rounded-2xl overflow-hidden relative group snap-start"
                        >
                          {/* Background Gradient */}
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br transition-transform duration-300 group-hover:scale-[1.04]",
                            gradient
                          )} />
                          
                          {/* Wave Pattern */}
                          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0,100 C20,80 40,120 60,100 C80,80 100,120 120,100 C140,80 160,120 180,100 C200,80 220,120 240,100" fill="none" stroke="white" strokeWidth="2" />
                            <path d="M0,120 C20,100 40,140 60,120 C80,100 100,140 120,120 C140,100 160,140 180,120 C200,100 220,140 240,120" fill="none" stroke="white" strokeWidth="2" />
                          </svg>

                          {/* Top Meta */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/10 backdrop-blur-sm">
                            <Heart className="w-3 h-3 text-white fill-white" />
                            <span className="text-[11px] font-bold text-white leading-none">{item.likes}</span>
                          </div>

                          {/* Bottom Title */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-[14px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                              {item.title}
                            </h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (scrollRef.current) {
                          scrollRef.current.scrollBy({ left: 190 * 3 + 14 * 3, behavior: 'smooth' });
                        }
                      }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-opacity z-10 hover:bg-background"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="text-[13px] font-medium text-muted-foreground">
            Найдено <span className="text-foreground font-bold ml-1">{filteredItems.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder={isAudio ? "Что хотите создать? Например: lo-fi для учёбы" : "Поиск в разделе..."}
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
        </div>
      </section>

      {/* 4. MIXED-GRID */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-20 flex-grow">
        {visibleItems.length > 0 ? (
          <div className={cn(
            "grid",
            params.topic === 'text' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" 
              : "grid-cols-12 gap-4 md:gap-6"
          )}>
            {visibleItems.map((item, idx) => {
              if (params.topic === 'text') {
                return (
                  <div key={`${item.slug}-${idx}`}>
                    <TextCategoryCard item={item} />
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