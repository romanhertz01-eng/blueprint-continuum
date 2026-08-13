import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Home, ChevronRight, Star, ArrowRight, Heart } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getCategories, getTopicsByCategory, getItemsByTopic, PromptItem } from '@/data/prompts';
import { cn } from '@/lib/utils';
import { ORIGIN } from '@/lib/origin';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

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

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
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
      <section className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border mb-5">
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
      <section className="max-w-7xl mx-auto px-6 w-full mb-20 space-y-8">
        {data.topics.map((topic: any) => {
          const items = getItemsByTopic(topic.slug);
          if (items.length === 0) return null;
          
          return (
            <div key={topic.slug} className="space-y-4">
              <div className="flex items-end justify-between border-b border-border/50 pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{topic.title}</h2>
                  <p className="text-muted-foreground text-[14px] mt-1">{topic.intro}</p>
                </div>
                <button className="text-[13px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                  Показать все <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
                {items.map((item: PromptItem) => (
                  <AgentCard key={item.slug} item={item} />
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

function AgentCard({ item }: { item: PromptItem }) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const IconComponent = (LucideIcons as any)[item.agentIcon || 'MessageSquare'] || LucideIcons.MessageSquare;

  const agentColors = [
    'bg-teal-500/20 text-teal-600',
    'bg-blue-500/20 text-blue-600',
    'bg-purple-500/20 text-purple-600',
    'bg-pink-500/20 text-pink-600',
    'bg-red-500/20 text-red-600',
    'bg-orange-500/20 text-orange-600',
    'bg-yellow-500/20 text-yellow-600',
    'bg-green-500/20 text-green-600',
  ];
  const colorClass = agentColors[item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % agentColors.length];
  const [bgClass, textClass] = colorClass.split(' ');

  const handleAction = () => {
    writePromptHandoff({
      prompt: item.promptRu,
      category: 'agents',
      providerId: item.providerId,
      subModelId: item.subModelId,
      agentId: item.slug,
      sourceSlug: item.slug,
    });

    const targetRoute = CATEGORY_ROUTE.agents;
    if (isAuthed) {
      navigate({ to: targetRoute });
    } else {
      window.location.href = buildAuthHref(targetRoute);
    }
  };

  return (
    <div
      onClick={handleAction}
      className="group flex flex-col p-4 rounded-[22px] bg-card border border-border/60 min-h-[140px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 hover:border-border"
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", bgClass)}>
          <IconComponent className="w-[26px] h-[26px] text-white" />
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Heart className="w-[13px] h-[13px]" />
          <span className="text-[13px]">{item.likes}</span>
        </div>
      </div>

      <div className="mt-3 flex-1 flex flex-col justify-end">
        <h3 className="text-[16px] font-bold truncate">{item.title}</h3>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1">{item.agentRole}</p>
      </div>
    </div>
  );
}
