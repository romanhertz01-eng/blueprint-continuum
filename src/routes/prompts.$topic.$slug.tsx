import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { getPublishedItems, getPublishedTopics, getTopicBySlug, getItemBySlug, PromptItem } from '@/data/prompts';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';
import { CopyPromptButton } from '@/components/prompts/CopyPromptButton';
import { TryPromptButton } from '@/components/prompts/TryPromptButton';
import { PromptMasonry } from '@/components/prompts/PromptMasonry';
import { TopicCloud } from '@/components/prompts/TopicCloud';
import { Footer } from '@/components/shared/Footer';
import { ORIGIN } from '@/lib/origin';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/prompts/$topic/$slug')({
  component: PromptDetailPage,
  loader: ({ params }) => {
    const item = getItemBySlug(params.topic, params.slug);
    if (!item) throw new Error('Prompt not found');
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.item) return {};
    const { item } = loaderData;
    const title = `${item.title} — Библиотека промптов ERA2`;
    const description = item.body.overview.slice(0, 160);
    const canonical = `${ORIGIN}/prompts/${item.topicSlug}/${item.slug}`;

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'robots', content: 'index,follow' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonical },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  },
});

function getModelName(providerId: string, category: string): string {
  if (category === 'text') return textProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'image') return imageProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'video') return videoProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'audio') return providerId === 'elevenlabs' ? 'ElevenLabs' : 'Suno';
  return providerId;
}

function getCredits(providerId: string, subModelId?: string, category?: string): number | null {
  if (category === 'image') {
    const provider = imageProviders.find(p => p.id === providerId);
    const model = provider?.subModels.find(m => m.id === subModelId);
    return model?.credits || null;
  }
  if (category === 'video') {
    const provider = videoProviders.find(p => p.id === providerId);
    const model = provider?.subModels.find(m => m.id === subModelId);
    return model?.credits || null;
  }
  if (category === 'text') {
    const provider = textProviders.find(p => p.id === providerId);
    const model = provider?.subModels.find(m => m.id === subModelId);
    return model?.credits || null;
  }
  return null;
}

function PromptDetailPage() {
  const { item } = Route.useLoaderData();
  const topics = getPublishedTopics();
  const mainTopic = getTopicBySlug(item.topicSlug);
  // Removed lang state since we only show RU now
  
  const modelName = getModelName(item.providerId, item.category);
  const credits = getCredits(item.providerId, item.subModelId, item.category);
  const media = item.media[0];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Промпты", "item": `${ORIGIN}/prompts` },
      { "@type": "ListItem", "position": 2, "name": mainTopic?.title, "item": `${ORIGIN}/prompts/${item.topicSlug}` },
      { "@type": "ListItem", "position": 3, "name": item.title, "item": `${ORIGIN}/prompts/${item.topicSlug}/${item.slug}` }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": item.title,
    "description": item.body.overview,
    "image": media?.src,
    "author": { "@type": "Organization", "name": "ERA2" },
    "publisher": { "@type": "Organization", "name": "ERA2" }
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>

      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <nav className="flex items-center gap-1 text-[13px] text-muted-foreground mb-4">
          <Link to="/prompts" className="hover:text-foreground">Промпты</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/prompts/$topic" params={{ topic: item.topicSlug }} className="hover:text-foreground">
            {mainTopic?.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground/70 line-clamp-1">{item.title}</span>
        </nav>

        <h1 className="text-[36px] font-bold leading-tight mb-5 text-foreground">{item.title}</h1>
        
        <div className="border-t border-border w-full mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* LEFT COLUMN - Media */}
          <div className="space-y-6">
            <div className="overflow-hidden">
              {media?.src && (media.type === 'video' ? (
                <video src={media.src} poster={media.poster} controls className="max-w-full h-auto rounded-xl border border-border" />
              ) : (
                <img src={media.src} alt={item.title} className="max-w-full h-auto rounded-xl border border-border" />
              ))}
            </div>

            {item.negativePrompt && (
              <div className="space-y-2">
                <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-muted-foreground/80">
                  Негативный промпт
                </span>
                <div className="bg-muted/30 border border-border rounded-lg p-4 text-[14px] text-foreground/90 leading-relaxed italic">
                  {item.negativePrompt}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Prompt & Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[22px] font-semibold text-foreground">Промпт</h2>
              </div>

              <div className="bg-muted/30 border border-border rounded-xl p-5 text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
                {item.promptRu}
              </div>

              <div className="flex flex-wrap gap-3">
                <CopyPromptButton text={item.promptRu} />
                <TryPromptButton item={item} label="Открыть в генераторе" />
              </div>

              <div className="flex flex-col gap-1">
                {credits !== null && (
                  <div className="text-[13px] text-muted-foreground">
                    Стоимость: <span className="text-foreground font-medium">{credits} кр</span> за генерацию
                  </div>
                )}
                <div className="text-[13px] text-muted-foreground">
                  Теги: {' '}
                  <Link to="/prompts/$topic" params={{ topic: item.topicSlug }} className="underline hover:text-foreground">
                    {mainTopic?.title}
                  </Link>
                  {item.extraTopicSlugs?.map((slug: string) => {
                    const topic = topics.find(t => t.slug === slug);
                    return topic ? (
                      <span key={slug}>, <Link to="/prompts/$topic" params={{ topic: slug }} className="underline hover:text-foreground">{topic.title}</Link></span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>


        <div className="mt-14 pt-12 border-t border-border">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Ещё промпты
          </h2>
          
          <PromptMasonry 
            items={getPublishedItems()
              .filter((i: PromptItem) => i.slug !== item.slug)
              .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))} 
          />
        </div>

        <div className="mt-14">
          <TopicCloud topics={topics} />
        </div>
      </div>
      <Footer />
    </>
  );
}
