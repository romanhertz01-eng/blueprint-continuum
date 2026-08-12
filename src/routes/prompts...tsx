import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { ChevronRight, Eye, Heart, Bookmark, Share2, Copy } from 'lucide-react';
import { getPromptBySlug, getTopicBySlug } from '@/data/prompts';
import { PromptGallery } from '@/components/prompts/PromptGallery';
import { DiscoveryFeed } from '@/components/prompts/DiscoveryFeed';
import { TryPromptButton } from '@/components/prompts/TryPromptButton';
import { CopyPromptButton } from '@/components/prompts/CopyPromptButton';
import { Footer } from '@/components/shared/Footer';
import { ORIGIN } from '@/lib/origin';
import { cn } from '@/lib/utils';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';

export const Route = createFileRoute('/prompts/')({
  loader: ({ params }) => {
    const item = getPromptBySlug(params.slug);
    if (!item || item.topicSlug !== params.topic) throw notFound();
    const topic = getTopicBySlug(item.topicSlug);
    return { item, topic };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      title: `${loaderData.item.title} — Промпт для нейросетей | ERA2.ai`,
      meta: [
        { name: 'description', content: loaderData.item.promptRu.slice(0, 160) },
        { property: 'og:url', content: `${ORIGIN}/prompts/${loaderData.topic?.slug}/${loaderData.item.slug}` },
      ],
    };
  },
  component: PromptDetailPage,
});

function PromptDetailPage() {
  const { item, topic } = Route.useLoaderData();

  const getModelName = (providerId: string) => {
    const allProviders = [...imageProviders, ...videoProviders, ...textProviders];
    const provider = allProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const modelName = getModelName(item.providerId);
  const metadata = [
    modelName,
    item.params?.aspect,
    item.params?.quality || '1K'
  ].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow pt-16">
        <div className="max-w-[1280px] mx-auto px-4 pb-20">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8">
            <Link to="/prompts" className="hover:text-foreground transition-colors">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/prompts/$topic" params={{ topic: item.topicSlug }} className="hover:text-foreground transition-colors">
              {topic?.title || item.topicSlug}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70 truncate">{item.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-start mb-20">
            {/* Left: Gallery */}
            <div className="w-full">
              <PromptGallery media={item.media} title={item.title} />
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{item.title}</h1>
                <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-muted text-foreground font-medium uppercase tracking-wider text-[11px]">
                    {item.category}
                  </span>
                  <span>{metadata}</span>
                </div>
              </div>

              {/* Stats & Social */}
              <div className="flex items-center justify-between py-4 border-y border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.views || 0}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 hover:text-foreground transition-colors group">
                    <Heart className="w-5 h-5 group-hover:fill-current" />
                    <span className="text-sm font-medium">{item.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-foreground transition-colors group">
                    <Bookmark className="w-5 h-5 group-hover:fill-current" />
                    <span className="text-sm font-medium">{item.saves || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-foreground transition-colors group">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Промпт</h3>
                  <CopyPromptButton 
                    text={item.promptRu} 
                    className="h-8 px-3 text-xs bg-muted/50 hover:bg-muted border-none" 
                  />
                </div>
                <div className="p-5 rounded-xl bg-muted/30 border border-border relative group">
                  <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {item.promptRu}
                  </p>
                </div>
              </div>

              {/* Main CTA */}
              <TryPromptButton 
                item={item}
                label="Создать с этим промптом"
                className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20"
              />

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-muted/50 border border-border text-[13px] hover:bg-muted transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Discovery Zone */}
        <DiscoveryFeed currentItem={item} />
      </main>
      <Footer />
    </div>
  );
}
