import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getPublishedTopics, countItemsByCategory, getCategories, PromptItem } from '@/data/prompts';
import { CategoryCard } from '@/components/prompts/CategoryCard';
import { PromptCard } from '@/components/prompts/PromptCard';
import { useLoadMore } from '@/components/prompts/useLoadMore';
import { TopicCloud } from '@/components/prompts/TopicCloud';
import { useState, useMemo } from 'react';

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

function PromptsHub() {
  const allItems = getPublishedItems();
  const topics = getPublishedTopics();
  const categories = getCategories();
  const categoryCounts = countItemsByCategory();
  const [sortBy, setSortBy] = useState<'new' | 'alpha'>('new');

  const sortedItems = useMemo(() => {
    return [...allItems].sort((a, b) => {
      if (sortBy === 'new') return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      return a.title.localeCompare(b.title);
    });
  }, [allItems, sortBy]);

  const { visible, hasMore, remaining, showMore } = useLoadMore<PromptItem>(sortedItems);

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70">Промпты</span>
        </nav>
        <h1 className="text-4xl md:text-[48px] font-bold leading-tight mb-4 text-foreground">Библиотека промптов ЭРА2</h1>
      </section>

      <section className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Категории</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map(c => <CategoryCard key={c.slug} category={c} count={categoryCounts[c.slug as keyof typeof categoryCounts] || 0} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-medium">Все промпты <span className="text-muted-foreground ml-1">{allItems.length}</span></div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="new">Сначала новые</option>
            <option value="alpha">По алфавиту</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {visible.map(item => <PromptCard key={item.slug} item={item} topics={topics} />)}
        </div>

        {hasMore && (
          <div className="flex justify-center mb-20">
            <button onClick={showMore} className="h-11 px-8 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/30">
              Показать ещё ({remaining})
            </button>
          </div>
        )}
        <TopicCloud topics={topics} />
      </section>
      <Footer />
    </>
  );
}
