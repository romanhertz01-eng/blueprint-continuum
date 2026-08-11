import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getTopicBySlug, getItemsByTopic, getPublishedTopics, PromptItem } from '@/data/prompts';
import { PromptCard } from '@/components/prompts/PromptCard';

export const Route = createFileRoute('/prompts/$topic/')({
  loader: ({ params }) => {
    const topic = getTopicBySlug(params.topic);
    if (!topic) throw notFound();
    const items = getItemsByTopic(params.topic);
    const allTopics = getPublishedTopics();
    return { topic, items, allTopics };
  },
  component: TopicPage,
  head: ({ params }) => {
    const topic = getTopicBySlug(params.topic);
    if (!topic) return {};
    const title = `${topic.title} — Промпты для нейросетей | ERA2.ai`;
    const description = topic.seoDescription || `Библиотека промптов по теме ${topic.title}.`;
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
  },
});

function TopicPage() {
  const { topic, items, allTopics } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow pt-16">
        <div className="max-w-[1360px] mx-auto px-4 pb-20">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/prompts" className="hover:text-foreground transition-colors">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70">{topic.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {topic.title}
          </h1>
          {topic.seoDescription && (
            <p className="text-muted-foreground max-w-2xl mb-12">
              {topic.seoDescription}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item: PromptItem) => (
              <PromptCard key={item.slug} item={item} topics={allTopics} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
