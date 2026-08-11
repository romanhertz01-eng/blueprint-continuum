import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronRight, Copy, Check, Info } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { 
  getItemBySlug, 
  getTopicBySlug, 
  getRelatedItems, 
  getPublishedTopics, 
  PromptItem,
  getPublishedTopics as getAllTopics,
  getPublishedItems
} from '@/data/prompts';
import { CopyPromptButton } from '@/components/prompts/CopyPromptButton';
import { TryPromptButton } from '@/components/prompts/TryPromptButton';
import { PromptCard } from '@/components/prompts/PromptCard';
import { PromptMasonry } from '@/components/prompts/PromptMasonry';
import { TopicCloud } from '@/components/prompts/TopicCloud';
import { useState } from 'react';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';

export const Route = createFileRoute('/prompts/$topic/$slug')({
  loader: ({ params }) => {
    const item = getItemBySlug(params.topic, params.slug);
    if (!item) throw notFound();
    const topic = getTopicBySlug(params.topic);
    if (!topic) throw notFound();
    const relatedItems = getRelatedItems(item, 6);
    const allTopics = getAllTopics();
    
    // Получение стоимости
    let credits: number | null = null;
    const { providerId, subModelId, category } = item;
    
    if (category === 'image') {
      const provider = imageProviders.find(p => p.id === providerId);
      const subModel = provider?.subModels.find(s => s.id === subModelId);
      if (subModel) credits = subModel.credits;
    } else if (category === 'video') {
      const provider = videoProviders.find(p => p.id === providerId);
      const subModel = provider?.subModels.find(s => s.id === subModelId);
      if (subModel) credits = subModel.credits;
    } else if (category === 'text') {
      const provider = textProviders.find(p => p.id === providerId);
      const subModel = provider?.subModels.find(s => s.id === subModelId);
      if (subModel) credits = subModel.credits;
    }
    
    // Получение всех промптов для Masonry (исключая текущий, сортировка по publishedAt)
    const masonryItems = getPublishedItems()
      .filter(i => i.slug !== item.slug)
      .sort((a, b) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime());

    return { item, topic, relatedItems, allTopics, credits, masonryItems };
  },
  component: PromptItemPage,
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { item } = loaderData;
    const title = `${item.title} — Промпт для нейросети | ERA2.ai`;
    const description = item.body.overview.slice(0, 160);
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
  const { item, topic, relatedItems, allTopics, credits, masonryItems } = Route.useLoaderData();
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [copied, setCopied] = useState(false);

  const displayPrompt = lang === 'ru' ? item.promptRu : (item.promptEn || item.promptRu);

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": ORIGIN },
      { "@type": "ListItem", "position": 2, "name": "Промпты", "item": `${ORIGIN}/prompts` },
      { "@type": "ListItem", "position": 3, "name": topic.title, "item": `${ORIGIN}/prompts/${topic.slug}` },
      { "@type": "ListItem", "position": 4, "name": item.title, "item": `${ORIGIN}/prompts/${topic.slug}/${item.slug}` }
    ]
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": item.title,
    "image": item.media[0].src,
    "datePublished": item.publishedAt,
    "dateModified": item.updatedAt,
    "author": { "@type": "Organization", "name": "ERA2.ai" }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      
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

          <div className="grid lg:grid-cols-[1fr,480px] gap-12 mb-16">
            <div>
              {item.media[0].type === 'video' ? (
                <video 
                  src={item.media[0].src} 
                  poster={item.media[0].poster} 
                  controls 
                  className="w-full aspect-[4/3] object-cover rounded-2xl border border-border" 
                />
              ) : (
                <img 
                  src={item.media[0].src} 
                  alt={item.media[0].alt} 
                  className="w-full aspect-[4/3] object-cover rounded-2xl border border-border" 
                />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-6">{item.title}</h1>

              {/* Промпт блок */}
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex bg-muted/30 rounded-lg p-1">
                    <button 
                      onClick={() => setLang('ru')}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${lang === 'ru' ? 'bg-card shadow-sm text-foreground font-medium' : 'text-muted-foreground'}`}
                    >
                      RU
                    </button>
                    <button 
                      onClick={() => setLang('en')}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${lang === 'en' ? 'bg-card shadow-sm text-foreground font-medium' : 'text-muted-foreground'}`}
                      disabled={!item.promptEn}
                    >
                      EN
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(displayPrompt);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
                
                <div className="font-mono text-sm leading-relaxed mb-6 whitespace-pre-wrap break-words">
                  {displayPrompt}
                </div>

                {item.negativePrompt && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Negative Prompt</div>
                    <div className="font-mono text-xs text-red-500/80 break-words">
                      {item.negativePrompt}
                    </div>
                  </div>
                )}
              </div>

              {/* Параметры и Стоимость */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {Object.keys(item.params || {}).length > 0 && (
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Параметры</div>
                    <div className="space-y-1.5">
                      {item.params?.aspect && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Формат</span>
                          <span className="font-medium">{item.params.aspect}</span>
                        </div>
                      )}
                      {item.params?.quality && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Качество</span>
                          <span className="font-medium">{item.params.quality}</span>
                        </div>
                      )}
                      {item.params?.quantity && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Кол-во</span>
                          <span className="font-medium">{item.params.quantity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {credits !== null && (
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Стоимость</div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-foreground">
                        {credits} <span className="text-sm font-normal text-muted-foreground">кр</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">за генерацию</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <TryPromptButton item={item} className="flex-1 h-12 text-base font-semibold" />
              </div>
            </div>
          </div>

          {/* Текстовые блоки */}
          <div className="grid lg:grid-cols-[1fr,480px] gap-12 mb-20">
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-bold mb-4">Обзор результата</h2>
                <div className="text-muted-foreground leading-relaxed text-lg">
                  {item.body.overview}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Разбор промпта</h2>
                <div className="text-muted-foreground leading-relaxed text-lg">
                  {item.body.breakdown}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Как изменить под себя</h2>
                <div className="text-muted-foreground leading-relaxed text-lg">
                  {item.body.howToChange}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-red-500/90">Частые ошибки</h2>
                <div className="text-muted-foreground leading-relaxed text-lg">
                  {item.body.mistakes}
                </div>
              </section>
            </div>

            <aside className="space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Темы промпта</h3>
                <div className="flex flex-wrap gap-2">
                  {[item.topicSlug, ...(item.extraTopicSlugs || [])].map(slug => {
                    const t = allTopics.find((x: any) => x.slug === slug);
                    if (!t) return null;
                    return (
                      <Link 
                        key={slug}
                        to="/prompts/$topic"
                        params={{ topic: slug }}
                        className="px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/50 transition-colors text-xs"
                      >
                        {t.cardTitle}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-muted/30 border border-border border-dashed">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">Готовы попробовать?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Нажмите кнопку ниже, чтобы открыть этот промпт в движке генерации.
                    </p>
                  </div>
                </div>
                <TryPromptButton item={item} className="w-full" />
              </div>
            </aside>
          </div>

          {relatedItems.length > 0 && (
            <section className="pt-20 border-t border-border">
              <h2 className="text-2xl font-bold mb-8">Похожие промпты</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {relatedItems.map((relItem: PromptItem) => (
                  <PromptCard key={relItem.slug} item={relItem} topics={allTopics} />
                ))}
              </div>
            </section>
          )}

          <PromptMasonry items={masonryItems} heading="Другие промпты" />
          <TopicCloud topics={allTopics} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
