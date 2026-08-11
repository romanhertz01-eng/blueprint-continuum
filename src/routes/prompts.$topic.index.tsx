import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
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
  MIN_ITEMS_FOR_INDEX
} from '@/data/prompts';
import { PromptCard } from '@/components/prompts/PromptCard';
import { useLoadMore } from '@/components/prompts/useLoadMore';
import { TopicCloud } from '@/components/prompts/TopicCloud';
import { useState, useMemo } from 'react';

export const Route = createFileRoute('/prompts/$topic/')({
  loader: ({ params }) => {
    if (isReservedPromptSlug(params.topic)) {
      const category = getCategoryBySlug(params.topic as any);
      if (category) {
        const items = getItemsByCategory(params.topic as any);
        const topics = getTopicsByCategory(params.topic as any);
        const allTopics = getPublishedTopics();
        return { type: 'category' as const, category, items, topics, allTopics };
      }
    }

    const topic = getTopicBySlug(params.topic);
    if (!topic) throw notFound();
    const items = getItemsByTopic(params.topic);
    const allTopics = getPublishedTopics();
    return { type: 'topic' as const, topic, items, allTopics };
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

function PromptHandoffPage() {
  const data = Route.useLoaderData();
  const [sortBy, setSortBy] = useState<'new' | 'alpha'>('new');
  
  const sortedItems = useMemo(() => {
    return [...data.items].sort((a, b) => {
      if (sortBy === 'new') return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      return a.title.localeCompare(b.title);
    });
  }, [data.items, sortBy]);

  const { visible, hasMore, remaining, showMore } = useLoadMore<PromptItem>(sortedItems);
  const title = data.type === 'category' ? data.category.title : data.topic.title;
  const topics = data.type === 'category' ? data.allTopics : data.allTopics;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow pt-16">
        <div className="max-w-[1360px] mx-auto px-4 pb-20">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8">
            <Link to="/prompts" className="hover:text-foreground">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70">{title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">{title}</h1>

          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-medium">Найдено <span className="text-muted-foreground ml-1">{data.items.length}</span></div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs outline-none">
              <option value="new">Сначала новые</option>
              <option value="alpha">По алфавиту</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {visible.map(item => <PromptCard key={item.slug} item={item} topics={topics} />)}
          </div>

          {hasMore && (
            <div className="flex justify-center mb-16">
              <button onClick={showMore} className="h-11 px-8 rounded-lg border border-border bg-card text-sm hover:bg-muted/30">
                Показать ещё ({remaining})
              </button>
            </div>
          )}
          <TopicCloud topics={data.allTopics} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
