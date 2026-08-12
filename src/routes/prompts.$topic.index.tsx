import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronRight, Sparkles, Star, PlusCircle, ArrowRight, X } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { 
  getTopicBySlug, 
  getItemsByTopic, 
  getPublishedTopics, 
  PromptItem, 
  isReservedPromptSlug, 
  getCategoryBySlug, 
  getItemsByCategory, 
  getTopicsByCategory,
  getCategories,
  MIN_ITEMS_FOR_INDEX
} from '@/data/prompts';
import { EditorialPromptCard } from '@/components/prompts/EditorialPromptCard';
import { TopicCloud } from '@/components/prompts/TopicCloud';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/prompts/$topic/')({
  loader: ({ params }) => {
    if (isReservedPromptSlug(params.topic)) {
      const category = getCategoryBySlug(params.topic as any);
      if (category) {
        const items = getItemsByCategory(params.topic as any);
        const topics = getTopicsByCategory(params.topic as any);
        const allTopics = getPublishedTopics();
        const allCategories = getCategories();
        return { type: 'category' as const, category, items, topics, allTopics, allCategories };
      }
    }

    const topic = getTopicBySlug(params.topic);
    if (!topic) throw notFound();
    const items = getItemsByTopic(params.topic);
    const allTopics = getPublishedTopics();
    const allCategories = getCategories();
    return { type: 'topic' as const, topic, items, allTopics, allCategories };
  },
  component: PromptHandoffPage,
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const title = loaderData.type === 'category' ? loaderData.category.seoTitle : `${loaderData.topic.title} — Промпты | ERA2.ai`;
    const robots = loaderData.type === 'topic' && loaderData.items.length < MIN_ITEMS_FOR_INDEX ? 'noindex,follow' : 'index,follow';
    return {
      meta: [
        { title },
        { name: 'robots', content: robots },
        { property: 'og:url', content: `${ORIGIN}/prompts/${params.topic}` },
      ],
    };
  },
});

const PAGE_SIZE = 30;

function PromptHandoffPage() {
  const data = Route.useLoaderData();
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'alpha'>('new');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const sortedItems = useMemo(() => {
    let result = [...data.items];
    if (sortBy === 'new') {
      result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [data.items, sortBy]);

  const visibleItems = useMemo(() => {
    return sortedItems.slice(0, page * PAGE_SIZE);
  }, [sortedItems, page]);

  const hasMore = visibleItems.length < sortedItems.length;

  const handleShowMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 600);
  };

  const getCardType = (index: number, item: PromptItem): 'A' | 'B' | 'C' | 'D' | 'E' => {
    const hasMedia = !!item.media?.[0]?.src && item.category !== 'text';
    const cycle = index % 15;
    if (cycle === 4) return 'D';
    if (cycle === 9) return 'E';
    if (hasMedia) {
      if (cycle === 2 || cycle === 12) return 'B';
      return 'A';
    }
    return 'C';
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

  const title = data.type === 'category' ? data.category.title : data.topic.title;
  const description = data.type === 'category' ? data.category.description : "";

  const pillCategories = useMemo(() => {
    const base = [{ label: 'Все промпты', slug: null }];
    const cats = data.allCategories.map(c => ({
      label: c.cardTitle || c.title,
      slug: c.slug
    }));
    return [...base, ...cats];
  }, [data.allCategories]);

  const currentCategorySlug = data.type === 'category' ? data.category.slug : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow pt-16">
        {/* 1. INTRO-ЗОНА */}
        <section className="pt-8 pb-6 px-6 max-w-7xl mx-auto w-full">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6">
            <Link to="/prompts" className="hover:text-foreground">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70">{title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight">{title}</h1>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              {description && (
                <p className="text-[14px] md:text-[15px] text-muted-foreground mb-5 max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-medium text-muted-foreground border border-border/50">
                  <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {data.items.length * 12} использований
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-medium text-muted-foreground border border-border/50">
                  <PlusCircle className="w-3.5 h-3.5" /> {data.items.length} промптов
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ЛЕНТА КАТЕГОРИЙ (PILLS) */}
        <section className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border mb-6">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="flex-grow overflow-x-auto no-scrollbar">
              <div className="flex gap-2">
                {pillCategories.map(cat => {
                  const isActive = cat.slug === currentCategorySlug || (cat.slug === null && data.type === 'topic');
                  const href = cat.slug ? `/prompts/${cat.slug}` : '/prompts';
                  
                  return (
                    <Link
                      key={cat.label}
                      to={href}
                      className={cn(
                        "px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border block",
                        isActive
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "bg-muted/30 border-border/50 hover:bg-muted/60 text-muted-foreground"
                      )}
                    >
                      {cat.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3. СТРОКА СОРТИРОВКИ */}
        <section className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between mb-4">
          <div className="text-[13px] font-medium text-muted-foreground">
            Найдено <span className="text-foreground font-bold ml-1">{data.items.length}</span>
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
              <option value="alpha">По алфавиту</option>
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
              <p className="text-muted-foreground mb-6">В этой категории пока нет промптов</p>
              <Link to="/prompts" className="h-10 px-6 rounded-xl bg-primary text-white font-bold inline-flex items-center justify-center">
                Вернуться в каталог
              </Link>
            </div>
          )}

          {/* ПОКАЗАТЬ ЕЩЁ */}
          {hasMore && (
            <div className="mt-12 flex flex-col items-center">
              <button 
                onClick={handleShowMore} 
                disabled={isLoadingMore}
                className={cn(
                  "h-12 px-10 rounded-2xl border border-border bg-card text-[14px] font-bold transition-all hover:bg-muted/50 flex items-center gap-2",
                  isLoadingMore && "opacity-70 cursor-not-allowed"
                )}
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    Показать ещё
                    <span className="text-muted-foreground font-normal ml-1">({data.items.length - visibleItems.length})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-20">
          <TopicCloud topics={data.allTopics} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

