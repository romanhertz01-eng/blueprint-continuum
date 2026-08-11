import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getItemBySlug, getTopicBySlug } from '@/data/prompts';
import { CopyPromptButton } from '@/components/prompts/CopyPromptButton';
import { TryPromptButton } from '@/components/prompts/TryPromptButton';

export const Route = createFileRoute('/prompts/$topic/$slug')({
  loader: ({ params }) => {
    const item = getItemBySlug(params.slug);
    if (!item || item.topicSlug !== params.topic) throw notFound();
    const topic = getTopicBySlug(params.topic);
    if (!topic) throw notFound();
    return { item, topic };
  },
  component: PromptItemPage,
  head: ({ params }) => {
    const item = getItemBySlug(params.slug);
    if (!item) return {};
    const title = `${item.title} — Промпт для нейросети | ERA2.ai`;
    const description = item.promptRu.slice(0, 160);
    const canonical = `${ORIGIN}/prompts/${params.topic}/${params.slug}`;
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

function PromptItemPage() {
  const { item, topic } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow pt-16">
        <div className="max-w-[1360px] mx-auto px-4 pb-20">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/prompts" className="hover:text-foreground transition-colors">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/prompts/$topic" params={{ topic: topic.slug }} className="hover:text-foreground transition-colors">
              {topic.title}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70">{item.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              {item.media[0].type === 'video' ? (
                <video 
                  src={item.media[0].src} 
                  poster={item.media[0].poster} 
                  controls 
                  className="w-full rounded-2xl border border-border" 
                />
              ) : (
                <img 
                  src={item.media[0].src} 
                  alt={item.media[0].alt} 
                  className="w-full rounded-2xl border border-border" 
                />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-6">{item.title}</h1>
              <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <p className="text-foreground text-lg mb-6 leading-relaxed">
                  {item.promptRu}
                </p>
                <div className="flex gap-4">
                  <CopyPromptButton text={item.promptRu} className="flex-1" />
                  <TryPromptButton item={item} className="flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
