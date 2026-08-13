import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, X, Sparkles, Star, PlusCircle, ArrowRight, Filter, ChevronLeft, ChevronRight, FileText, Music, Video, Bot, Heart, Image as ImageIcon } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getPublishedTopics, countItemsByCategory, getCategories, PromptItem, getProvidersWithPrompts, promptTopics } from '@/data/prompts';
import { CatalogCard } from '@/components/prompts/CatalogCard';
import { CollectionShelf } from '@/components/prompts/CollectionShelf';
import { EditorialBanner } from '@/components/prompts/EditorialBanner';

import { TopicCloud } from '@/components/prompts/TopicCloud';
import { useState, useMemo, useEffect, useRef } from 'react';
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
  const [sortBy, setSortBy] = useState<'new' | 'popular'>('new');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayItems = useMemo(() => {
    if (sortBy !== 'new') return allItems;

    // Interleave text and images to ensure mixed visual content
    const textItems = allItems.filter(i => i.category === 'text');
    const imageItems = allItems.filter(i => i.category === 'image');
    const otherItems = allItems.filter(i => i.category !== 'text' && i.category !== 'image');

    const result: PromptItem[] = [];
    let tIdx = 0, iIdx = 0, oIdx = 0;

    // To ensure variety, we mix them in a specific pattern
    // pattern: [image, text, image, other, image, text...]
    while (tIdx < textItems.length || iIdx < imageItems.length || oIdx < otherItems.length) {
      if (iIdx < imageItems.length) result.push(imageItems[iIdx++]);
      if (tIdx < textItems.length) result.push(textItems[tIdx++]);
      if (iIdx < imageItems.length) result.push(imageItems[iIdx++]);
      if (oIdx < otherItems.length) result.push(otherItems[oIdx++]);
    }
    return result;
  }, [allItems, sortBy]);

  // Категории (chips) для ленты на основе реальных данных
  const pillCategories = useMemo(() => {
    const base = [
      { label: 'Все темы', slug: null },
      { label: 'Популярное', slug: 'popular' },
    ];

    const activeTopics = promptTopics
      .filter(t => t.status === 'published')
      .map(topic => {
        const count = allItems.filter(item => item.topicSlug === topic.slug).length;
        return {
          label: topic.cardTitle || topic.title,
          slug: topic.slug,
          count
        };
      })
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 14);

    return [...base, ...activeTopics.map(({ label, slug }) => ({ label, slug }))];
  }, [allItems]);

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

    // Сортировка - disable standard sorting when using displayItems (interleaved)
    if (sortBy === 'new') {
      // displayItems are already interleaved, we preserve that order
      return result;
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return result;
  }, [displayItems, searchQuery, selectedTopic, sortBy]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, page * PAGE_SIZE);
  }, [filteredItems, page]);

  // Rhythm logic for long feed
  const feedElements = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const itemsPerRow = 5;
    
    // Split items into chunks of 5 (one row)
    const rows: PromptItem[][] = [];
    for (let i = 0; i < visibleItems.length; i += itemsPerRow) {
      rows.push(visibleItems.slice(i, i + itemsPerRow));
    }

    // Logic for inserting shelf/banner between rows
    rows.forEach((row, rowIndex) => {
      // Add the row of cards
      elements.push(
        <div key={`row-${rowIndex}`} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-[20px] gap-y-[24px] mb-[24px]">
          {row.map((item, idx) => (
            <CatalogCard key={`${item.slug}-${rowIndex}-${idx}`} item={item} index={idx} />
          ))}
        </div>
      );

      // Rhythm: shelf after row 2, 5, 8... banner after row 4, 9...
      // Real row index starts at 0. Row index 1 is the 2nd row.
      
      // Shelf approx every 3 rows (2, 5, 8, 11...)
      if ((rowIndex + 1) % 3 === 2) {
        // Selection of items for the shelf
        const shelfItems = [...allItems].sort(() => 0.5 - Math.random()).slice(0, 8);
        const titles = ["Популярное в маркетинге", "Лучшие для работы", "Топ в дизайне", "Креативные идеи"];
        const title = titles[Math.floor((rowIndex / 3) % titles.length)];
        
        elements.push(
          <CollectionShelf 
            key={`shelf-${rowIndex}`}
            title={title}
            subtitle="Подборка промптов, которые экономят время"
            items={shelfItems}
            ctaHref="/prompts"
          />
        );
      }

      // Banner approx every 5 rows (4, 9, 14...)
      if ((rowIndex + 1) % 5 === 4) {
        const banners = [
          {
            label: "КУРС",
            title: "Как писать промпты на уровне Pro",
            subtitle: "Бесплатный мини-курс по архитектуре запросов от команды ERA2",
            ctaLabel: "Пройти курс",
            bgSrc: "/community/05.jpg"
          },
          {
            label: "НОВОЕ",
            title: "Генерация видео теперь в ERA2",
            subtitle: "Лучшие видео-модели доступны для ваших творческих экспериментов",
            ctaLabel: "Смотреть примеры",
            bgSrc: "/community/06.jpg"
          },
          {
            label: "ПОДБОРКА",
            title: "ERA2 Featured: Выбор редакции",
            subtitle: "Каждую неделю мы отбираем лучшие работы нашего сообщества",
            ctaLabel: "Смотреть подборку",
            bgSrc: "/community/08.jpg"
          }
        ];
        const banner = banners[Math.floor((rowIndex / 5) % banners.length)];

        elements.push(
          <EditorialBanner 
            key={`banner-${rowIndex}`}
            {...banner}
            ctaHref="/prompts"
          />
        );
      }
    });

    return elements;
  }, [visibleItems, allItems]);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* 0. HERO CAROUSEL */}
      <HeroCarousel allItems={allItems} />

      {/* 1. INTRO-ЗОНА */}
      <section className="pt-5 pb-4 px-6 max-w-[1520px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight">Каталог промптов</h1>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <p className="text-[14px] md:text-[15px] text-muted-foreground mb-4 max-w-2xl leading-relaxed line-clamp-1">
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
      <section className="max-w-[1520px] mx-auto px-6 w-full mb-10">
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
                to={href as any}
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

      {/* 2. ЛЕНТА КАТЕГОРИЙ (STICKY) */}
      <section className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-[1520px] mx-auto px-6 py-2.5 flex items-center gap-3">
          <div className="flex-grow overflow-x-auto no-scrollbar">
            <div className="flex gap-2.5">
              {pillCategories.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => handleTopicClick(cat.slug)}
                  className={cn(
                    "px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all border",
                    selectedTopic === cat.slug
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                      : "bg-muted/40 border-border/40 hover:bg-muted/70 text-muted-foreground/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ГАЗ S — ПОЛКА МЕЛКИХ КАРТОЧЕК */}
      <SmallCardsShelf allItems={allItems} searchQuery={searchQuery} />

      {/* 3. СТРОКА СОРТИРОВКИ */}
      <section className="max-w-[1520px] mx-auto px-6 w-full flex items-center justify-between mb-4">
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
          </select>
        </div>
      </section>

      {/* 4. 5-COLUMN GRID WITH RHYTHM */}
      <section className="max-w-[1520px] mx-auto px-6 w-full mb-12">
        {feedElements.length > 0 ? (
          <div className="flex flex-col">
            {feedElements}
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

      <section className="max-w-[1520px] mx-auto px-6 w-full mb-20">
        <TopicCloud topics={topics} />
      </section>

      <Footer />
    </div>
  );
}

export default PromptsHub;
function HeroCarousel({ allItems }: { allItems: PromptItem[] }) {
  const slides = useMemo(() => {
    return promptTopics
      .filter(t => t.status === 'published')
      .map(topic => {
        const firstItem = allItems.find(item => item.topicSlug === topic.slug && item.media && item.media.length > 0 && item.media[0].src);
        if (!firstItem) return null;
        const promptCount = allItems.filter(item => item.topicSlug === topic.slug).length;
        return {
          topic,
          firstItem,
          promptCount
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => b.promptCount - a.promptCount)
      .slice(0, 4)
      .map(s => ({
        title: s.topic.title,
        subtitle: s.topic.intro.split(/[.!?]/)[0].slice(0, 90),
        image: s.firstItem.media[0].src,
        href: `/prompts/${s.topic.slug}`
      }));
  }, [allItems]);

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => setCurrent(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      timerRef.current = setInterval(nextSlide, 7000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length, current]);

  if (slides.length === 0) return null;

  return (
    <section 
      className="max-w-[1520px] mx-auto w-full mt-8 px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[240px] md:h-[320px] rounded-3xl bg-muted/40 border border-border overflow-hidden">
        {slides.map((slide, idx) => (
          <div 
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-[400ms] ease-in-out",
              idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Left Content */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-fit w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center z-20">
              <h2 className="text-[24px] md:text-[36px] font-bold leading-tight mb-3 line-clamp-2">
                {slide.title}
              </h2>
              <p className="text-[14px] md:text-[15px] text-muted-foreground mb-6 line-clamp-2 max-w-[440px]">
                {slide.subtitle}
              </p>
              
              <div className="flex items-center gap-3">
                <Link 
                  to={slide.href as any}
                  className="bg-primary text-white h-11 px-7 rounded-xl font-bold flex items-center justify-center transition-opacity hover:opacity-90 shadow-sm"
                >
                  Попробовать
                </Link>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-background/60 border border-border flex items-center justify-center hover:bg-background/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-background/60 border border-border flex items-center justify-center hover:bg-background/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:block absolute right-0 top-0 h-full w-[50%]">
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute left-0 top-0 h-full w-[40%] bg-gradient-to-r from-muted/40 via-muted/40 to-transparent" />
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                idx === current ? "bg-foreground" : "bg-foreground/25 hover:bg-foreground/40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SmallCardsShelf({ allItems, searchQuery }: { allItems: PromptItem[], searchQuery: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const textTopic = useMemo(() => {
    if (searchQuery.trim()) return null;

    const topicsWithCounts = promptTopics
      .filter(t => t.status === 'published' && t.category === 'text')
      .map(t => ({
        topic: t,
        count: allItems.filter(item => item.topicSlug === t.slug).length
      }))
      .filter(t => t.count >= 6)
      .sort((a, b) => b.count - a.count);

    return topicsWithCounts[0] || null;
  }, [allItems, searchQuery]);

  const items = useMemo(() => {
    if (!textTopic) return [];
    return allItems
      .filter(item => item.topicSlug === textTopic.topic.slug)
      .slice(0, 10);
  }, [allItems, textTopic]);

  if (!textTopic || items.length < 6) return null;

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = (175 + 12) * 3;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const intro = textTopic.topic.intro.split(/[.!?]/)[0].slice(0, 90);

  const gradientPairs = [
    'from-orange-500/30 to-rose-600/30',
    'from-blue-600/30 to-indigo-700/30',
    'from-emerald-600/30 to-teal-700/30',
    'from-fuchsia-600/30 to-purple-700/30',
    'from-amber-500/30 to-orange-600/30',
    'from-sky-500/30 to-blue-600/30',
    'from-violet-600/30 to-fuchsia-700/30',
    'from-slate-600/30 to-gray-700/30',
  ];

  return (
    <section className="max-w-[1520px] mx-auto px-6 w-full mb-10">
      <div className="rounded-3xl bg-muted/40 border border-border py-6 px-8 overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h2 className="text-[22px] font-bold leading-tight">{textTopic.topic.title}</h2>
            <p className="text-[13px] text-muted-foreground line-clamp-1 mt-1">{intro}</p>
          </div>
          <Link
            to={`/prompts/${textTopic.topic.slug}` as any}
            className="shrink-0 bg-primary text-white h-10 px-5 rounded-xl text-[13px] font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            Перейти к подборке
          </Link>
        </div>

        <div className="relative group/shelf">
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory w-[calc(100%+40px)] pb-2"
          >
            {items.map((item, idx) => {
              const gradient = gradientPairs[idx % gradientPairs.length];
              return (
                <Link
                  key={item.slug}
                  to={`/prompts/${item.topicSlug}/${item.slug}` as any}
                  className="w-[175px] aspect-[3/4] shrink-0 rounded-2xl overflow-hidden relative group/card snap-start"
                >
                  {/* Background Gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-transform duration-300 group-hover/card:scale-[1.05]",
                    gradient
                  )} />
                  
                  {/* SVG Pattern */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="30" fill="white" />
                      <circle cx="90" cy="80" r="40" fill="white" />
                      <path d="M-10 60 Q 30 40 110 60" stroke="white" strokeWidth="1" />
                      <path d="M-10 70 Q 30 50 110 70" stroke="white" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Dark Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/55 via-black/15 to-transparent z-10" />

                  {/* Top Meta */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-20 text-white drop-shadow-sm">
                    <Heart className="w-[11px] h-[11px] fill-white" />
                    <span className="text-[11px] font-bold leading-none">{item.likes || 0}</span>
                  </div>

                  {/* Bottom Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                    <h3 className="text-[13px] font-bold text-white line-clamp-3 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <button
            onClick={scrollRight}
            className="absolute right-10 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center z-30 opacity-0 group-hover/shelf:opacity-100 transition-opacity hover:bg-muted"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
