import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronRight, ArrowRight } from 'lucide-react';
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
import { toolPages } from '@/data/toolPages';

export const Route = createFileRoute('/prompts/$topic/')({
  loader: ({ params }) => {
    // 1. Проверяем, не категория ли это
    if (isReservedPromptSlug(params.topic)) {
      const category = getCategoryBySlug(params.topic as any);
      if (category) {
        const items = getItemsByCategory(params.topic as any);
        const topics = getTopicsByCategory(params.topic as any);
        const allTopics = getPublishedTopics();
        return { type: 'category' as const, category, items, topics, allTopics };
      }
    }

    // 2. Иначе это тема
    const topic = getTopicBySlug(params.topic);
    if (!topic) throw notFound();
    const items = getItemsByTopic(params.topic);
    const allTopics = getPublishedTopics();
    
    // Блок соседних тем (relatedTopicSlugs)
    const relatedTopics = (topic.relatedTopicSlugs || [])
      .map(slug => allTopics.find(t => t.slug === slug))
      .filter((t): t is NonNullable<typeof t> => !!t);

    // Инструменты по теме
    const relatedTools = (topic.relatedToolSlugs || [])
      .map(slug => toolPages.find(p => p.slug === slug))
      .filter(p => !!p);

    return { 
      type: 'topic' as const, 
      topic, 
      items, 
      allTopics, 
      relatedTopics,
      relatedTools
    };
  },
  component: PromptHandoffPage,
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};

    if (loaderData.type === 'category') {
      const { category } = loaderData;
      const title = category.seoTitle;
      const description = category.seoDescription;
      const canonical = `${ORIGIN}/prompts/${params.topic}`;
      return {
        meta: [
          { title },
          { name: 'description', content: description },
          { name: 'robots', content: 'index,follow' },
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          { property: 'og:url', content: canonical },
        ],
        links: [{ rel: 'canonical', href: canonical }],
      };
    } else {
      const { topic, items } = loaderData;
      const title = `${topic.title} — Промпты для нейросетей | ERA2.ai`;
      const description = topic.seoDescription || `Библиотека промптов по теме ${topic.title}.`;
      const canonical = `${ORIGIN}/prompts/${params.topic}`;
      
      // ТОНКИЕ ПОДБОРКИ: если меньше 8 промптов — noindex
      const robots = items.length < MIN_ITEMS_FOR_INDEX ? 'noindex,follow' : 'index,follow';
      
      return {
        meta: [
          { title },
          { name: 'description', content: description },
          { name: 'robots', content: robots },
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          { property: 'og:url', content: canonical },
        ],
        links: [{ rel: 'canonical', href: canonical }],
      };
    }
  },
});

function PromptHandoffPage() {
  const data = Route.useLoaderData();

  if (data.type === 'category') {
    return <CategoryPage data={data} />;
  }

  return <TopicPage data={data} />;
}

function CategoryPage({ data }: { data: Extract<ReturnType<typeof Route.useLoaderData>, { type: 'category' }> }) {
  const { category, items, topics, allTopics } = data;
  const { visible, hasMore, remaining, showMore } = useLoadMore(items);
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.title,
    "description": category.description,
    "url": `${ORIGIN}/prompts/${category.slug}`
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": ORIGIN },
      { "@type": "ListItem", "position": 2, "name": "Промпты", "item": `${ORIGIN}/prompts` },
      { "@type": "ListItem", "position": 3, "name": category.title, "item": `${ORIGIN}/prompts/${category.slug}` }
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <main className="flex-grow pt-16">
        <div className="max-w-[1360px] mx-auto px-4 pb-20">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/prompts" className="hover:text-foreground transition-colors">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70">{category.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {category.title}
          </h1>
          <p className="text-muted-foreground max-w-3xl mb-12 text-lg">
            {category.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {visible.map((item: PromptItem) => (
              <PromptCard key={item.slug} item={item} topics={allTopics} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mb-16">
              <button
                onClick={showMore}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Показать ещё ({remaining})
              </button>
            </div>
          )}

          {topics.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Темы в этой категории</h2>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic: any) => (
                  <Link 
                    key={topic.slug}
                    to="/prompts/$topic"
                    params={{ topic: topic.slug }}
                    className="px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 transition-colors text-sm"
                  >
                    {topic.cardTitle}
                  </Link>
                ))}
              </div>
            </section>
          )}
          <TopicCloud topics={allTopics} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TopicPage({ data }: { data: Extract<ReturnType<typeof Route.useLoaderData>, { type: 'topic' }> }) {
  const { topic, items, allTopics, relatedTopics, relatedTools } = data;
  const { visible, hasMore, remaining, showMore } = useLoadMore(items);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": topic.title,
    "description": topic.seoDescription,
    "url": `${ORIGIN}/prompts/${topic.slug}`
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": ORIGIN },
      { "@type": "ListItem", "position": 2, "name": "Промпты", "item": `${ORIGIN}/prompts` },
      { "@type": "ListItem", "position": 3, "name": topic.title, "item": `${ORIGIN}/prompts/${topic.slug}` }
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <main className="flex-grow pt-16">
        <div className="max-w-[1360px] mx-auto px-4 pb-20">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/prompts" className="hover:text-foreground transition-colors">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70">{topic.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {topic.title}
          </h1>
          
          <div className="max-w-4xl prose prose-invert mb-12">
            <p className="text-muted-foreground text-lg leading-relaxed">
              {topic.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {visible.map((item: PromptItem) => (
              <PromptCard key={item.slug} item={item} topics={allTopics} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mb-20">
              <button
                onClick={showMore}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Показать ещё ({remaining})
              </button>
            </div>
          )}

          {relatedTools.length > 0 && (
            <section className="mb-20">
              <h2 className="text-2xl font-bold mb-8">Инструменты по теме</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTools.map((tool: any) => (
                  <Link 
                    key={tool.slug}
                    to="/tools/$slug"
                    params={{ slug: tool.slug }}
                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-muted/30 text-muted-foreground">
                        Инструмент
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {tool.heroTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tool.heroDescription}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedTopics.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Похожие темы</h2>
              <div className="flex flex-wrap gap-2">
                {relatedTopics.map((t: any) => (
                  <Link 
                    key={t.slug}
                    to="/prompts/$topic"
                    params={{ topic: t.slug }}
                    className="px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 transition-colors text-sm"
                  >
                    {t.cardTitle}
                  </Link>
                ))}
              </div>
            </section>
          )}
          <TopicCloud topics={allTopics} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
