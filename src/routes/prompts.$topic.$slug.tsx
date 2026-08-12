import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronRight, Heart, Bookmark, Share2, Eye, MessageSquare, Star, Check } from 'lucide-react';
import { getPublishedItems, getPublishedTopics, getTopicBySlug, getItemBySlug, getItemsByProvider, PromptItem } from '@/data/prompts';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';
import { CopyPromptButton } from '@/components/prompts/CopyPromptButton';
import { TryPromptButton } from '@/components/prompts/TryPromptButton';
import { PromptMasonry } from '@/components/prompts/PromptMasonry';
import { TopicCloud } from '@/components/prompts/TopicCloud';

import { PromptGallery } from '@/components/prompts/PromptGallery';
import { Footer } from '@/components/shared/Footer';
import { ORIGIN } from '@/lib/origin';
import { useState, useMemo, useEffect } from 'react';
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

function PromptDetailPage() {
  const { item } = Route.useLoaderData();
  const topics = getPublishedTopics();
  const mainTopic = getTopicBySlug(item.topicSlug);
  
  const modelName = getModelName(item.providerId, item.category);
  const itemsByProvider = useMemo(() => getItemsByProvider(item.providerId).filter(i => i.slug !== item.slug), [item.providerId, item.slug]);

  // Reactions Logic
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [localViews, setLocalViews] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const likes = JSON.parse(localStorage.getItem('era2_prompt_likes') || '[]');
      setIsLiked(likes.includes(item.slug));
      const saves = JSON.parse(localStorage.getItem('era2_prompt_saves') || '[]');
      setIsSaved(saves.includes(item.slug));
      const viewsMap = JSON.parse(localStorage.getItem('era2_prompt_views') || '{}');
      if (!viewsMap[item.slug]) {
        viewsMap[item.slug] = 1;
        localStorage.setItem('era2_prompt_views', JSON.stringify(viewsMap));
      }
      setLocalViews(viewsMap[item.slug] || 0);
    } catch (e) {}
  }, [item.slug]);

  const toggleLike = () => {
    if (typeof window === 'undefined') return;
    try {
      const likes = JSON.parse(localStorage.getItem('era2_prompt_likes') || '[]');
      const newLikes = isLiked ? likes.filter((s: string) => s !== item.slug) : [...likes, item.slug];
      localStorage.setItem('era2_prompt_likes', JSON.stringify(newLikes));
      setIsLiked(!isLiked);
    } catch (e) {}
  };

  const toggleSave = () => {
    if (typeof window === 'undefined') return;
    try {
      const saves = JSON.parse(localStorage.getItem('era2_prompt_saves') || '[]');
      const newSaves = isSaved ? saves.filter((s: string) => s !== item.slug) : [...saves, item.slug];
      localStorage.setItem('era2_prompt_saves', JSON.stringify(newSaves));
      setIsSaved(!isSaved);
    } catch (e) {}
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    try {
      navigator.clipboard.writeText(window.location.href);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } catch (e) {}
  };

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <nav className="flex items-center gap-1 text-[13px] text-muted-foreground mb-4">
          <Link to="/prompts" className="hover:text-foreground">Промпты</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/prompts/$topic" params={{ topic: item.topicSlug }} className="hover:text-foreground">
            {mainTopic?.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground/70 truncate max-w-[200px] sm:max-w-[300px]" title={item.title}>
            {item.title}
          </span>
        </nav>

        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-primary/10 text-primary mb-3">
          {item.category === 'image' ? 'Промпт для изображения' : 
           item.category === 'video' ? 'Промпт для видео' : 
           item.category === 'text' ? 'Текстовый промпт' : 'Промпт'}
        </div>

        <h1 className="text-[36px] font-bold leading-tight mb-5 text-foreground">{item.title}</h1>
        
        <div className="border-t border-border w-full mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          {/* LEFT COLUMN - Media */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-[520px]">
              <PromptGallery media={item.media} title={item.title} />
            </div>
          </div>

          {/* RIGHT COLUMN - Prompt & Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-[18px] font-bold text-foreground">Промпт</h2>
              
              <div className="relative bg-muted/30 border border-border rounded-xl p-5 text-[15px] leading-relaxed text-foreground whitespace-pre-wrap group">
                {item.promptRu}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyPromptButton text={item.promptRu} className="h-8 w-8 p-0" variant="secondary" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <CopyPromptButton text={item.promptRu} />
                <TryPromptButton item={item} label="Создать с этим промптом" />
              </div>

              <div className="flex items-center justify-between text-[13px] text-muted-foreground pt-4 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 opacity-70">
                    <Eye className="w-4 h-4" />
                    <span>{item.views + localViews}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleLike}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg border border-border transition-all hover:bg-muted/50 active:scale-90",
                      isLiked && "bg-primary/10 border-primary/20"
                    )}
                    title={isLiked ? "Убрать лайк" : "Поставить лайк"}
                  >
                    <Heart className={cn("w-4.5 h-4.5 transition-colors", isLiked ? "text-primary fill-primary" : "text-muted-foreground")} />
                  </button>
                  
                  <button 
                    onClick={toggleSave}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg border border-border transition-all hover:bg-muted/50 active:scale-90",
                      isSaved && "bg-primary/10 border-primary/20"
                    )}
                    title={isSaved ? "Удалить из сохраненных" : "Сохранить"}
                  >
                    <Bookmark className={cn("w-4.5 h-4.5 transition-colors", isSaved ? "text-primary fill-primary" : "text-muted-foreground")} />
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg border border-border transition-all hover:bg-muted/50 active:scale-90",
                      isShared && "bg-primary/10 border-primary/20"
                    )}
                    title="Поделиться"
                  >
                    {isShared ? <Check className="w-4.5 h-4.5 text-primary" /> : <Share2 className="w-4.5 h-4.5 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Модель</span>
                <span className="font-medium text-foreground">
                  {modelName} {item.params?.quality && `· ${item.params.quality}`}
                </span>
              </div>
              
              {item.params?.aspect && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Формат</span>
                  <span className="font-medium text-foreground">{item.params.aspect}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-foreground">Тема</h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/prompts/$topic"
                  params={{ topic: item.topicSlug }}
                  className="px-3 py-1 rounded-full text-[12px] bg-muted/40 border border-border text-foreground/80 hover:bg-muted/60 transition-colors"
                >
                  {mainTopic?.title}
                </Link>
                {item.extraTopicSlugs?.map((slug: string) => {
                  const topic = topics.find(t => t.slug === slug);
                  return topic ? (
                    <Link
                      key={slug}
                      to="/prompts/$topic"
                      params={{ topic: slug }}
                      className="px-3 py-1 rounded-full text-[12px] bg-muted/40 border border-border text-foreground/80 hover:bg-muted/60 transition-colors"
                    >
                      {topic.title}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>

            {item.extraTopicSlugs && item.extraTopicSlugs.length > 0 && (
              <div className="pt-4 space-y-3">
                <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-muted-foreground/80 block">
                  Смотрите также
                </span>
                <div className="flex flex-wrap gap-2">
                  {item.extraTopicSlugs?.map((slug: string) => {
                    const topic = topics.find(t => t.slug === slug);
                    return topic ? (
                      <Link 
                        key={slug} 
                        to="/prompts/$topic" 
                        params={{ topic: slug }}
                        className="bg-muted/40 border border-border rounded-full px-4 py-1.5 text-[13px] text-foreground hover:bg-muted/60 transition-colors"
                      >
                        {topic.title}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            )}
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

        {itemsByProvider.length > 0 && (
          <div className="mt-14 pt-12 border-t border-border">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Ещё от {modelName}
            </h2>
            <PromptMasonry items={itemsByProvider} />
          </div>
        )}

        <div className="mt-14">
          <TopicCloud topics={topics} />
        </div>
      </div>
      <Footer />
    </>
  );
}
