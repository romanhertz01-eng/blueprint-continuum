import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, X, Sparkles, Star, PlusCircle, ArrowRight, Filter } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getPublishedTopics, countItemsByCategory, getCategories, PromptItem, getProvidersWithPrompts } from '@/data/prompts';
import { EditorialPromptCard } from '@/components/prompts/EditorialPromptCard';
import { TopicCloud } from '@/components/prompts/TopicCloud';
import { useState, useMemo, useEffect } from 'react';
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

const PAGE_SIZE = 30;

function PromptsHub() {
  const allItems = getPublishedItems();
  const topics = getPublishedTopics();
  const promptCategories = getCategories();
  const categoryCounts = countItemsByCategory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'used' | 'saved'>('new');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayItems = useMemo(() => {
    if (sortBy === 'new') {
      //Interleave logic - handled by sorting and getCardType mapping in the view
    }
    return allItems;
  }, [allItems, sortBy]);

  // Категории (chips) для ленты
  const pillCategories = [
    { label: 'Все темы', slug: null },
    { label: 'Популярное', slug: 'popular' },
    { label: 'Для работы', slug: 'rabota' },
    { label: 'Маркетинг', slug: 'marketing' },
    { label: 'Образование', slug: 'obrazovanie' },
    { label: 'Саморазвитие', slug: 'samorazvitie' },
    { label: 'Креатив', slug: 'kreativ' },
    { label: 'Нейросети', slug: 'neyroseti' },
    { label: 'Код', slug: 'kod' },
    { label: 'Бизнес', slug: 'biznes' },
    { label: 'Дизайн', slug: 'dizayn' },
    { label: 'Аналитика', slug: 'analitika' },
  ];

  const filteredItems = useMemo(() => {
    let result = [...displayItems];

    if (selectedTopic && selectedTopic !== 'popular') {
       result = result.filter(item => item.topicSlug === selectedTopic || item.category === selectedTopic);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.promptRu.toLowerCase().includes(q)
      );
    }

    // Сортировка
    if (sortBy === 'new') {
      result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return result;
  }, [allItems, searchQuery, selectedTopic, sortBy]);

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

  const handleTopicClick = (slug: string | null) => {
    setSelectedTopic(slug);
    setPage(1);
  };

  // Определение типа карточки на основе индекса для mixed-grid
  const getCardType = (index: number, item: PromptItem): 'A' | 'B' | 'C' | 'D' | 'E' => {
    const hasMedia = !!item.media?.[0]?.src && item.category !== 'text';
    const cycle = index % 15;
    
    if (cycle === 4) return 'D'; // Большая подборка
    if (cycle === 9) return 'E'; // Мини-курс
    
    // Если есть медиа, пробуем дать тип B (image-first)
    if (hasMedia && (cycle === 2 || cycle === 7 || cycle === 12)) return 'B';
    
    // Если нет медиа (или тип C по циклу), даем тип C (текстовый)
    if (!hasMedia || cycle === 5 || cycle === 10) return 'C';
    
    return 'A'; // Обычный
  };

  const getCardSpan = (type: 'A' | 'B' | 'C' | 'D' | 'E'): string => {
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
      {/* 1. INTRO-ЗОНА */}
      <section className="pt-8 pb-6 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight">Каталог промптов</h1>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <p className="text-[14px] md:text-[15px] text-muted-foreground mb-5 max-w-md leading-relaxed">
              Идеи и рабочие сценарии для любых задач с ERA2. Оптимизируйте работу и творчество.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-medium text-muted-foreground border border-border/50">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" /> 12 540 использований
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-medium text-muted-foreground border border-border/50">
                <PlusCircle className="w-3.5 h-3.5" /> 8 632 промпта
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-medium text-muted-foreground border border-border/50">
                <ArrowRight className="w-3.5 h-3.5" /> Обновления каждый день
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-4 shrink-0">
            {/* Featured A */}
            <div className="flex-1 sm:w-64 p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between group cursor-pointer hover:bg-muted/50 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary fill-current" />
                  </div>
                  <span className="text-[13px] font-bold">Подборка дня</span>
                </div>
                <p className="text-[12px] text-muted-foreground mb-3 leading-snug">
                  10 лучших промптов, отобранных командой ERA2
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted overflow-hidden">
                       <img src={`/community/0${i}.jpg`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-background bg-muted-foreground/10 flex items-center justify-center text-[10px] font-bold">+7</div>
                </div>
                <span className="text-[12px] font-bold text-primary group-hover:translate-x-1 transition-transform">Смотреть →</span>
              </div>
            </div>

            {/* Featured B */}
            <div className="flex-1 sm:w-64 p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between group cursor-pointer hover:bg-muted/50 transition-colors">
               <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <PlusCircle className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-[13px] font-bold">Ваш помощник</span>
                </div>
                <p className="text-[12px] text-muted-foreground mb-3 leading-snug">
                  Создайте свой промпт под любые задачи
                </p>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[12px] font-bold text-orange-500 group-hover:translate-x-1 transition-transform">Создать промпт</span>
                 <div className="text-orange-500 font-bold text-xl leading-none">⚡️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ЗАДАЧА 1: 6 БЛОКОВ КАТЕГОРИЙ */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-10">
        <h2 className="text-[20px] font-bold mb-5 flex items-center gap-2">
          Категории
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {[...promptCategories, { slug: 'model', cardTitle: 'По моделям', title: 'По моделям' } as any].map((cat) => {
            const count = cat.slug === 'model' ? 1 : (categoryCounts[cat.slug as keyof typeof categoryCounts] || 0);
            const isSoon = count === 0;
            const firstItem = allItems.find(i => i.category === cat.slug);
            const image = firstItem?.media?.[0]?.src || `/community/0${Math.floor(Math.random() * 8) + 1}.jpg`;
            const href = cat.slug === 'model' ? '/prompts/model' : `/prompts/${cat.slug}`;

            if (isSoon) {
              return (
                <div 
                  key={cat.slug} 
                  className="relative h-[140px] rounded-[18px] overflow-hidden bg-muted/20 border border-border/50 opacity-60 grayscale cursor-not-allowed group"
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                    <span className="text-white font-bold text-[14px] mb-1">{cat.cardTitle || cat.title}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider">Скоро</span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={cat.slug}
                to={href}
                className="relative h-[140px] rounded-[18px] overflow-hidden group border border-border/20 shadow-sm"
              >
                <img 
                  src={image} 
                  alt={cat.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <span className="text-white font-bold text-[15px] mb-0.5 leading-tight">{cat.cardTitle || cat.title}</span>
                  <span className="text-white/60 text-[11px] font-medium">{cat.slug === 'model' ? 'Модели' : `${count} промптов`}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. ЛЕНТА КАТЕГОРИЙ */}
      <section className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="flex-grow overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {pillCategories.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => handleTopicClick(cat.slug)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border",
                    selectedTopic === cat.slug
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-muted/30 border-border/50 hover:bg-muted/60 text-muted-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <button className="shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted/50 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. СТРОКА СОРТИРОВКИ */}
      <section className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between mb-4">
        <div className="text-[13px] font-medium text-muted-foreground">
          Все промпты <span className="text-foreground font-bold ml-1">{filteredItems.length}</span>
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
            <option value="used">Используемые</option>
            <option value="saved">Сохранённые</option>
          </select>
        </div>
      </section>

      {/* 4. MIXED-GRID */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-12">
        {visibleItems.length > 0 ? (
          <div className="grid grid-cols-12 gap-4 md:gap-5">
              {visibleItems.map((item, idx) => {
                const type = getCardType(idx, item);
              const span = getCardSpan(type);
              return (
                <div key={`${item.slug}-${idx}`} className={span}>
                  <EditorialPromptCard item={item} type={type} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <X className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Ничего не найдено</h3>
            <p className="text-muted-foreground mb-6">Попробуйте изменить параметры поиска или фильтры</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedTopic(null);}}
              className="h-10 px-6 rounded-xl bg-primary text-white font-bold"
            >
              Сбросить всё
            </button>
          </div>
        )}

        {/* 8. ДЛИННАЯ ЛЕНТА + ПОКАЗАТЬ ЕЩЁ */}
        {hasMore && (
          <div className="mt-12 flex flex-col items-center">
             <button 
              onClick={handleShowMore} 
              disabled={isLoadingMore}
              className={cn(
                "h-12 w-full max-w-[420px] rounded-xl border border-border bg-card text-[14px] font-bold transition-all flex items-center justify-center gap-2 hover:bg-muted/30",
                isLoadingMore && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Загружаем...
                </>
              ) : (
                <>Показать ещё ({filteredItems.length - visibleItems.length}) ↓</>
              )}
            </button>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 w-full mb-20">
        <TopicCloud topics={topics} />
      </section>

      <Footer />
    </div>
  );
}
