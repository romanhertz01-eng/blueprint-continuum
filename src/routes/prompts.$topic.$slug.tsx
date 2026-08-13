import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { ChevronRight, Eye, Heart, Bookmark, Share2, Copy, Maximize2, X, ChevronLeft } from 'lucide-react';
import { getItemBySlug, getTopicBySlug, getPublishedItems } from '@/data/prompts';
import { Footer } from '@/components/shared/Footer';
import { ORIGIN } from '@/lib/origin';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';
import { TryPromptButton } from '@/components/prompts/TryPromptButton';
import { CopyPromptButton } from '@/components/prompts/CopyPromptButton';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

export const Route = createFileRoute('/prompts/$topic/$slug')({
  loader: ({ params }) => {
    const item = getItemBySlug(params.topic, params.slug);
    if (!item) throw notFound();
    const topic = getTopicBySlug(item.topicSlug);
    return { item, topic };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { item } = loaderData as { item: any };
    const description = item.body?.overview || item.promptRu.slice(0, 160);
    return {
      title: `${item.title} — Промпт для нейросетей | ERA2.ai`,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: item.title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'robots', content: 'index, follow' },
      ],
      links: [
        { rel: 'canonical', href: `${ORIGIN}/prompts/${item.topicSlug}/${item.slug}` }
      ]
    };
  },
  component: PromptDetailPage,
});

function PromptDetailPage() {
  const { item, topic } = Route.useLoaderData();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Filter valid media
  const validMedia = useMemo(() => (item.media || []).filter((m: any) => m.src), [item.media]);
  const hasMultiple = validMedia.length > 1;

  useEffect(() => {
    const liked = localStorage.getItem(`era2_liked_${item.slug}`) === 'true';
    setIsLiked(liked);
  }, [item.slug]);

  const toggleLike = () => {
    const newState = !isLiked;
    setIsLiked(newState);
    localStorage.setItem(`era2_liked_${item.slug}`, String(newState));
  };

  const getModelName = (providerId: string) => {
    const allProviders = [...imageProviders, ...videoProviders, ...textProviders];
    const provider = allProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const nextSlide = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % validMedia.length);
  }, [validMedia.length]);

  const prevSlide = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + validMedia.length) % validMedia.length);
  }, [validMedia.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, nextSlide, prevSlide]);

  const modelName = getModelName(item.providerId);
  const aspect = item.params?.aspect || '1:1';
  const metadataStr = [modelName, aspect].filter(Boolean).join(' · ');

  // Related items for the discovery zone
  const morePrompts = useMemo(() => {
    return getPublishedItems()
      .filter(i => i.slug !== item.slug)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [item.slug]);

  const displayPrompts = showMore ? morePrompts : morePrompts.slice(0, 15);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'image': return 'Промпт для изображения';
      case 'video': return 'Промпт для видео';
      case 'audio': return 'Промпт для аудио';
      case 'text': return 'Промпт для текста';
      case 'agents': return 'ИИ-Агент';
      default: return 'Промпт';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow pt-20">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* 1. Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8">
            <Link to="/prompts" className="hover:text-foreground transition-colors">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/prompts/$topic" params={{ topic: item.topicSlug }} className="hover:text-foreground transition-colors">
              {topic?.title || item.topicSlug}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70 truncate">{item.title}</span>
          </nav>

          {/* 2 & 3. Badge and H1 */}
          <div className="mb-8">
            <span className="inline-block px-2.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">
              {getCategoryLabel(item.category)}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{item.title}</h1>
            <div className="h-px bg-border w-full" />
          </div>

          {/* 4. Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            {/* LEFT: Media */}
            <div className="space-y-6">
              {validMedia.length > 0 ? (
                <div className="relative group max-w-[520px] mx-auto lg:mx-0">
                  <div 
                    className="relative rounded-xl border border-border overflow-hidden bg-muted"
                    style={{ aspectRatio: aspect.replace(':', '/') }}
                  >
                    {validMedia[activeIdx].type === 'video' ? (
                      <video 
                        src={validMedia[activeIdx].src} 
                        className="w-full h-full object-cover" 
                        controls 
                        autoPlay 
                        muted 
                        loop 
                      />
                    ) : (
                      <img 
                        src={validMedia[activeIdx].src} 
                        alt={validMedia[activeIdx].alt || item.title}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Controls */}
                    {hasMultiple && (
                      <>
                        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 text-white text-[12px] font-medium z-10">
                          {activeIdx + 1}/{validMedia.length}
                        </div>
                        <button 
                          onClick={prevSlide}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={nextSlide}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    <button 
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnails */}
                  {hasMultiple && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                      {validMedia.map((m: any, i: number) => (
                        <button 
                          key={i}
                          onClick={() => setActiveIdx(i)}
                          className={cn(
                            "w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all",
                            activeIdx === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={m.src} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-[520px] aspect-square rounded-xl bg-muted border border-dashed border-border flex items-center justify-center text-muted-foreground">
                  Медиа отсутствует
                </div>
              )}
            </div>

            {/* RIGHT: Prompt */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Промпт</h2>
                <div className="relative p-6 rounded-xl bg-muted/30 border border-border group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyPromptButton text={item.promptRu} className="h-8 w-8 p-0 border-none bg-background/50 hover:bg-background/80">
                      <Copy className="w-4 h-4" />
                    </CopyPromptButton>
                  </div>
                  <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap pr-8">
                    {item.promptRu}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <TryPromptButton 
                  item={item}
                  label="Создать с этим промптом"
                  className="w-full h-14 text-base font-bold rounded-xl"
                />

                {/* Counters row */}
                <div className="flex items-center justify-between text-muted-foreground border-y border-border py-4">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={toggleLike}
                      className={cn(
                        "flex items-center gap-2 hover:text-foreground transition-colors",
                        isLiked && "text-primary"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                      <span className="text-sm font-semibold">{item.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm font-semibold">{item.views || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="p-2 hover:text-foreground transition-colors"><Bookmark className="w-5 h-5" /></button>
                    <button className="p-2 hover:text-foreground transition-colors"><Share2 className="w-5 h-5" /></button>
                  </div>
                </div>

                {/* Meta & Tags */}
                <div className="space-y-4">
                  <div className="text-[13px] text-muted-foreground font-medium">
                    {metadataStr}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/prompts/$topic" 
                      params={{ topic: item.topicSlug }}
                      className="px-3 py-1 rounded-full bg-muted/50 border border-border text-[12px] font-medium hover:bg-muted transition-colors"
                    >
                      #{topic?.title || item.topicSlug}
                    </Link>
                  </div>
                  <div className="text-[13px] font-bold text-primary">
                    {item.category === 'image' ? '1 кр за генерацию' : '5 кр за генерацию'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. More prompts feed */}
          <section className="mt-16 border-t border-border pt-12 pb-20">
            <h2 className="text-2xl font-bold mb-8">Ещё промпты</h2>
            <div className="[column-width:300px] [column-gap:12px] space-y-3">
              {displayPrompts.map((p, idx) => (
                <Link 
                  key={`${p.slug}-${idx}`} 
                  to="/prompts/$topic/$slug" 
                  params={{ topic: p.topicSlug, slug: p.slug }}
                  className="block break-inside-avoid relative group rounded-lg overflow-hidden border border-border/50"
                >
                  <img 
                    src={p.media[0]?.src || '/placeholder.svg'} 
                    alt={p.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4">
                    <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                      {p.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {!showMore && morePrompts.length > 15 && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setShowMore(true)}
                  className="px-8 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-sm font-bold transition-all"
                >
                  Показать ещё
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />

      {/* Lightbox */}
      {isLightboxOpen && validMedia.length > 0 && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div 
            className="w-full h-full p-4 md:p-12 flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            {validMedia[activeIdx].type === 'video' ? (
              <video src={validMedia[activeIdx].src} className="max-w-full max-h-full object-contain" controls autoPlay loop />
            ) : (
              <img src={validMedia[activeIdx].src} className="max-w-full max-h-full object-contain" alt="" />
            )}
          </div>
          {hasMultiple && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
