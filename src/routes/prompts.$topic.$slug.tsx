import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronRight, Copy, Check } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { 
  getItemBySlug, 
  getTopicBySlug, 
  getRelatedItems, 
  PromptItem,
  getPublishedTopics as getAllTopics,
  getPublishedItems,
  promptCategories
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
import { cn } from '@/lib/utils';

const CATEGORY_ASPECTS: Record<string, string> = {
  image: 'aspect-[3/4]',
  video: 'aspect-video',
  audio: 'aspect-video',
  text: '',
  agents: ''
};

function getModelName(providerId: string, category: string): string {
  if (category === 'text') return textProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'image') return imageProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'video') return videoProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'audio') return providerId === 'elevenlabs' ? 'ElevenLabs' : 'Suno';
  return providerId;
}

function getCredits(item: PromptItem): number | null {
  const { providerId, subModelId, category } = item;
  if (!subModelId) return null;

  if (category === 'image') {
    const provider = imageProviders.find(p => p.id === providerId);
    return provider?.subModels.find(s => s.id === subModelId)?.credits ?? null;
  } else if (category === 'video') {
    const provider = videoProviders.find(p => p.id === providerId);
    return provider?.subModels.find(s => s.id === subModelId)?.credits ?? null;
  } else if (category === 'text') {
    const provider = textProviders.find(p => p.id === providerId);
    return provider?.subModels.find(s => s.id === subModelId)?.credits ?? null;
  }
  return null;
}

export const Route = createFileRoute('/prompts/$topic/$slug')({
  loader: ({ params }) => {
    const item = getItemBySlug(params.topic, params.slug);
    if (!item) throw notFound();
    const topic = getTopicBySlug(params.topic);
    if (!topic) throw notFound();
    const allTopics = getAllTopics();
    
    // Получение всех промптов для Masonry (исключая текущий, сортировка по publishedAt)
    const masonryItems = getPublishedItems()
      .filter(i => i.slug !== item.slug)
      .sort((a, b) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime());

    return { item, topic, allTopics, masonryItems };
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
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  },
});

function PromptItemPage() {
  const { item, topic, allTopics, masonryItems } = Route.useLoaderData();
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  
  const displayPrompt = lang === 'ru' ? item.promptRu : (item.promptEn || item.promptRu);
  const credits = getCredits(item);
  const modelName = getModelName(item.providerId, item.category);
  const categoryDef = promptCategories.find(c => c.slug === item.category);
  const aspectClass = CATEGORY_ASPECTS[item.category] || 'aspect-[4/3]';

  const metaRows = [
    { label: 'Модель', value: modelName },
    { label: 'Категория', value: categoryDef?.cardTitle },
    { label: 'Формат', value: item.params?.aspect },
    { label: 'Качество', value: item.params?.quality },
    { label: 'Длительность', value: item.params?.duration },
    { label: 'Стоимость', value: credits ? `${credits} кр` : null },
    { label: 'Опубликовано', value: new Date(item.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }
  ].filter(row => row.value);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow pt-16">
        <div className="max-w-[1200px] mx-auto px-4 pb-20">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8">
            <Link to="/prompts" className="hover:text-foreground">Промпты</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/prompts/$topic" params={{ topic: topic.slug }} className="hover:text-foreground">
              {topic.title}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70">{item.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">{item.title}</h1>

          <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-8 mb-16">
            {/* Левая колонка */}
            <div className="min-w-0">
              <div className={cn("w-full overflow-hidden rounded-xl border border-border mb-4 bg-muted/30", aspectClass)}>
                {item.media[0].type === 'video' ? (
                  <video src={item.media[0].src} poster={item.media[0].poster} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={item.media[0].src} alt={item.media[0].alt} className="w-full h-full object-cover" />
                )}
              </div>
              
              <div className="text-[14px] text-muted-foreground mb-8">{item.body.overview}</div>

              {/* Блок промпта */}
              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden mb-8">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Промпт</span>
                  <div className="flex items-center gap-4">
                    {item.promptEn && (
                      <div className="flex bg-muted/50 rounded-lg p-0.5">
                        <button onClick={() => setLang('ru')} className={cn("px-2 py-0.5 text-[10px] rounded transition-all", lang === 'ru' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>RU</button>
                        <button onClick={() => setLang('en')} className={cn("px-2 py-0.5 text-[10px] rounded transition-all", lang === 'en' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>EN</button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CopyPromptButton text={displayPrompt} />
                      <TryPromptButton item={item} label="Открыть в генераторе" className="h-8 px-3 text-xs" />
                    </div>
                  </div>
                </div>
                <div className="p-4 font-mono text-[14px] leading-relaxed whitespace-pre-wrap break-words text-foreground">
                  {displayPrompt}
                </div>
                {item.negativePrompt && (
                  <div className="border-t border-border p-4 bg-card/20">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Негативный промпт</div>
                    <div className="font-mono text-[14px] leading-relaxed text-red-500/80 break-words">{item.negativePrompt}</div>
                  </div>
                )}
              </div>

              {/* Аккордеон Разбор */}
              <details className="group border border-border rounded-xl bg-card overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors list-none">
                  <span className="font-bold">Разбор промпта</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="p-6 border-t border-border bg-card space-y-8">
                  <div>
                    <h3 className="text-lg font-bold mb-3">Разбор промпта</h3>
                    <div className="text-muted-foreground leading-relaxed">{item.body.breakdown}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3">Как изменить под себя</h3>
                    <div className="text-muted-foreground leading-relaxed">{item.body.howToChange}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-red-500/90">Частые ошибки</h3>
                    <div className="text-muted-foreground leading-relaxed">{item.body.mistakes}</div>
                  </div>
                </div>
              </details>
            </div>

            {/* Правая колонка (Sidebar) */}
            <aside className="space-y-6">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {metaRows.map((row, i) => (
                    <div key={row.label} className={cn("flex justify-between items-center p-4 text-sm", i !== 0 && "border-t border-border")}>
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Темы</h4>
                  <div className="flex flex-wrap gap-2">
                    {[item.topicSlug, ...(item.extraTopicSlugs || [])].map(slug => {
                      const t = allTopics.find((x: { slug: string }) => x.slug === slug);
                      if (!t) return null;
                      return (
                        <Link 
                          key={slug} 
                          to="/prompts/$topic" 
                          params={{ topic: slug }}
                          className="px-3 py-1.5 rounded-full bg-muted/30 border border-border text-xs hover:border-primary/50 transition-colors"
                        >
                          {t.cardTitle}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <PromptMasonry items={masonryItems} heading={`Ещё промпты по теме ${topic.title}`} />
          <TopicCloud topics={allTopics} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
