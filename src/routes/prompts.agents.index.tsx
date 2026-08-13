import { createFileRoute, Link } from '@tanstack/react-router';
import { Home, ChevronRight, Star, ArrowRight, PlusCircle, Search } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getCategories, getTopicsByCategory, getItemsByTopic } from '@/data/prompts';
import { AgentPromptCard } from '@/components/prompts/AgentPromptCard';
import { cn } from '@/lib/utils';
import { ORIGIN } from '@/lib/origin';
import { useState } from 'react';

export const Route = createFileRoute('/prompts/agents/')({
  component: AgentsHubPage,
  loader: () => {
    const categories = getCategories();
    const currentCategory = categories.find(c => c.slug === 'agents');
    const topics = getTopicsByCategory('agents');
    
    return {
      category: currentCategory,
      topics,
      allCategories: categories
    };
  },
  head: (options) => {
    const data = options.loaderData as any;
    if (!data) return {};
    
    const title = data.category?.seoTitle || 'ИИ-агенты — ERA2.ai';
    const description = data.category?.seoDescription || 'Библиотека готовых промптов для ИИ-агентов.';
    const canonical = `${ORIGIN}/prompts/agents`;

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

function AgentsHubPage() {
  const data = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState('');

  const totalPrompts = data.topics.reduce((acc: number, topic: any) => acc + getItemsByTopic(topic.slug).length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. ШАПКА / BREADCRUMBS */}
      <section className="pt-6 pb-4 px-6 max-w-7xl mx-auto w-full">
        <nav className="flex items-center gap-2 text-[12px] text-muted-foreground mb-6 font-medium">
          <Link to="/prompts" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="w-3 h-3" /> Главная
          </Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground">Агенты</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-[32px] md:text-[42px] font-bold tracking-tight">
                Промпты для агентов
              </h1>
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            </div>
            <p className="text-muted-foreground text-[15px] max-w-2xl leading-relaxed">
              Готовые сценарии поведения для специализированных ИИ-ассистентов
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-bold border border-border/50 text-muted-foreground flex items-center gap-1.5">
               <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {totalPrompts} промптов
            </div>
            <div className="px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-bold border border-border/50 text-muted-foreground flex items-center gap-1.5">
               <ArrowRight className="w-3.5 h-3.5" /> Обновляется ежедневно
            </div>
          </div>
        </div>
      </section>

      {/* 2. ЛЕНТА КАТЕГОРИЙ (PILLS) */}
      <section className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border mb-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Link
              to="/prompts"
              className="px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border bg-muted/30 border-border/50 hover:bg-muted/60 text-muted-foreground"
            >
              Все темы
            </Link>
            {data.allCategories.map((cat: any) => (
              <Link
                key={cat.slug}
                to="/prompts/$topic"
                params={{ topic: cat.slug }}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border",
                  cat.slug === 'agents'
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-muted/30 border-border/50 hover:bg-muted/60 text-muted-foreground"
                )}
              >
                {cat.cardTitle}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. СЕКЦИИ ПО ГРУППАМ */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-20 space-y-16">
        {data.topics.map((topic: any) => {
          const items = getItemsByTopic(topic.slug);
          if (items.length === 0) return null;
          
          return (
            <div key={topic.slug} className="space-y-6">
              <div className="flex items-end justify-between border-b border-border/50 pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{topic.title}</h2>
                  <p className="text-muted-foreground text-[14px] mt-1">{topic.intro}</p>
                </div>
                <button className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1">
                  Показать все <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item: any) => (
                  <AgentPromptCard key={item.slug} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Footer />
    </div>
  );
}
