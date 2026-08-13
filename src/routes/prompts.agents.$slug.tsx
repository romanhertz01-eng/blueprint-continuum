import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Home, ChevronRight, Heart, Eye, Copy, ArrowLeft, Users, MessageSquare } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { agentItems } from '@/data/prompts/agentItems';
import { getItemsByTopic, PromptItem } from '@/data/prompts';
import { cn } from '@/lib/utils';
import { ORIGIN } from '@/lib/origin';
import * as LucideIcons from 'lucide-react';
import { TryPromptButton } from '@/components/prompts/TryPromptButton';
import { CopyPromptButton } from '@/components/prompts/CopyPromptButton';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

export const Route = createFileRoute('/prompts/agents/$slug')({
  component: AgentDetailPage,
  loader: ({ params }) => {
    const item = agentItems.find(i => i.slug === params.slug);
    if (!item) return { item: null };
    
    // Получаем похожих агентов той же темы
    const related = agentItems
      .filter(i => i.topicSlug === item.topicSlug && i.slug !== item.slug)
      .slice(0, 8);
      
    return { item, related };
  },
  head: (options) => {
    const data = options.loaderData as any;
    if (!data?.item) return { title: 'Агент не найден — ERA2.ai' };
    
    const title = `${data.item.title} — ИИ-агент | ERA2.ai`;
    const description = data.item.agentRole;
    const canonical = `${ORIGIN}/prompts/agents/${data.item.slug}`;

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonical },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  }
});

const AGENT_COLORS = [
  'bg-[#14b8a6]', // бирюзовый
  'bg-[#3b82f6]', // синий
  'bg-[#8b5cf6]', // фиолетовый
  'bg-[#d946ef]', // розовый
  'bg-[#ef4444]', // красный
  'bg-[#f97316]', // оранжевый
  'bg-[#eab308]', // жёлтый
  'bg-[#22c55e]', // зелёный
];

function getAgentColor(slug: string) {
  const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AGENT_COLORS[hash % AGENT_COLORS.length];
}

function AgentDetailPage() {
  const { item, related } = Route.useLoaderData();

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Агент не найден</h1>
          <p className="text-muted-foreground mb-8">Запрашиваемый агент не существует или был удален.</p>
          <Link to="/prompts/agents" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Назад к списку агентов
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = (LucideIcons as any)[item.agentIcon || 'MessageSquare'] || MessageSquare;
  const bgClass = getAgentColor(item.slug);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[12px] text-muted-foreground mb-8 font-medium">
          <Link to="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="w-3 h-3" /> Главная
          </Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link to="/prompts" className="hover:text-foreground transition-colors">
            Промпты
          </Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link to="/prompts/agents" className="hover:text-foreground transition-colors">
            Агенты
          </Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground">{item.title}</span>
        </nav>

        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 mb-16">
          <div className={cn("w-[320px] h-[320px] rounded-[32px] flex items-center justify-center shrink-0 shadow-inner", bgClass)}>
            <IconComponent className="w-24 h-24 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[36px] font-bold tracking-tight mb-2 leading-tight">
              {item.title}
            </h1>
            <p className="text-[16px] text-muted-foreground mb-6">
              {item.agentRole}
            </p>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Heart className="w-5 h-5" />
                <span>{item.likes}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Eye className="w-5 h-5" />
                <span>{item.views}</span>
              </div>
            </div>

            <TryPromptButton 
              item={item} 
              label="Попробовать" 
              className="h-14 px-8 text-[16px] font-bold w-fit" 
            />
          </div>
        </section>

        {/* System Prompt Section */}
        <section className="mb-12">
          <h2 className="text-[22px] font-bold mb-4">Системный промпт</h2>
          <div className="relative group">
            <div className="rounded-xl bg-muted/30 border border-border p-6 text-[15px] leading-relaxed whitespace-pre-wrap font-mono text-muted-foreground/90">
              {item.promptRu}
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyPromptButton text={item.promptRu} />
            </div>
          </div>
        </section>

        {/* Body Sections */}
        <div className="space-y-12 mb-20">
          {item.body?.overview && (
            <section>
              <h2 className="text-[22px] font-bold mb-4">Что умеет</h2>
              <div className="text-[16px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.body.overview}
              </div>
            </section>
          )}

          {item.body?.howToChange && (
            <section>
              <h2 className="text-[22px] font-bold mb-4">Как настроить под себя</h2>
              <div className="text-[16px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.body.howToChange}
              </div>
            </section>
          )}

          {item.body?.mistakes && (
            <section>
              <h2 className="text-[22px] font-bold mb-4">Частые ошибки</h2>
              <div className="text-[16px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.body.mistakes}
              </div>
            </section>
          )}
        </div>

        {/* Related Agents */}
        {related.length > 0 && (
          <section className="pt-16 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[24px] font-bold">Другие агенты</h2>
              <Link to="/prompts/agents" className="text-[14px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                Все агенты <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[18px]">
              {related.map((agent: PromptItem) => (
                <AgentCard key={agent.slug} item={agent} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function AgentCard({ item }: { item: PromptItem }) {
  const IconComponent = (LucideIcons as any)[item.agentIcon || 'MessageSquare'] || MessageSquare;
  const bgClass = getAgentColor(item.slug);

  return (
    <Link
      to="/prompts/agents/$slug"
      params={{ slug: item.slug }}
      className="group flex flex-col p-4 rounded-[22px] bg-card border border-border/60 min-h-[140px] transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 hover:border-border shadow-sm hover:shadow-md"
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

      <div className="mt-3 flex-1">
        <h3 className="text-[16px] font-bold truncate leading-snug group-hover:text-primary transition-colors">{item.title}</h3>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 leading-normal">{item.agentRole}</p>
      </div>
    </Link>
  );
}
