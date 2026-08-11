import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getPublishedTopics, countItemsByCategory, getCategories, PromptItem, getProvidersWithPrompts, getItemsByCategory } from '@/data/prompts';
import { CategoryTile } from '@/components/prompts/CategoryTile';
import { PromptMosaicTile } from '@/components/prompts/PromptMosaicTile';
import { useLoadMore } from '@/components/prompts/useLoadMore';
import { TopicCloud } from '@/components/prompts/TopicCloud';
import { useState, useMemo } from 'react';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';

const TITLE = 'Библиотека промптов для нейросетей — готовые примеры | ERA2.ai';
const DESCRIPTION = 'Библиотека лучших промптов для ChatGPT, Midjourney, Claude и других нейросетей. Бесплатные примеры, копирование без регистрации, быстрый старт генерации в ERA2.';
const CANONICAL = `${ORIGIN}/prompts`;

export const Route = createFileRoute('/prompts/')({
  component: PromptsHub,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { name: 'robots', content: 'index,follow' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: CANONICAL },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: CANONICAL }],
  }),
});

function PromptsHub() {
  const allItems = getPublishedItems();
  const topics = getPublishedTopics();
  const categories = getCategories();
  const categoryCounts = countItemsByCategory();
  const providersWithCounts = useMemo(() => getProvidersWithPrompts().slice(0, 5), []);
  
  const categoryImages = useMemo(() => {
    const usedSrcs = new Set<string>();
    const images = categories.map(cat => {
      const items = getItemsByCategory(cat.slug as any);
      let selectedSrc: string | null = null;
      for (const item of items) {
        const src = item.media?.[0]?.src;
        if (src && !usedSrcs.has(src)) {
          selectedSrc = src;
          usedSrcs.add(src);
          break;
        }
      }
      if (!selectedSrc && items[0]?.media?.[0]?.src) {
        selectedSrc = items[0].media[0].src;
      }
      return selectedSrc;
    });

    // шестая плитка (По моделям) - берем из самой популярной модели (kling)
    const providers = getProvidersWithPrompts();
    const topProviderId = providers[0]?.providerId;
    const providerItems = topProviderId ? getPublishedItems().filter(i => i.providerId === topProviderId) : [];
    let modelSrc: string | null = null;
    for (const item of providerItems) {
      const src = item.media?.[0]?.src;
      if (src && !usedSrcs.has(src)) {
        modelSrc = src;
        usedSrcs.add(src);
        break;
      }
    }
    if (!modelSrc && providerItems[0]?.media?.[0]?.src) {
      modelSrc = providerItems[0].media[0].src;
    }

    return [...images, modelSrc];
  }, [categories]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'new' | 'alpha'>('new');

  const filteredItems = useMemo(() => {
    let result = allItems;

    if (selectedProvider) {
      result = result.filter(item => item.providerId === selectedProvider);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        const topic = topics.find(t => t.slug === item.topicSlug);
        return (
          item.title.toLowerCase().includes(q) ||
          item.promptRu.toLowerCase().includes(q) ||
          (topic?.title.toLowerCase().includes(q))
        );
      });
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'new') return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      return a.title.localeCompare(b.title);
    });
  }, [allItems, searchQuery, selectedProvider, sortBy, topics]);

  const { visible, hasMore, remaining, showMore } = useLoadMore<PromptItem>(filteredItems);

  const getProviderName = (id: string) => {
    const p = [...textProviders, ...imageProviders, ...videoProviders].find(provider => provider.id === id);
    return p?.name || id;
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedProvider(null);
  };

  return (
    <>
      <section className="relative w-screen h-[420px] md:h-[520px] flex items-center justify-center overflow-hidden">
        <img 
          src="/community/03.jpg" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
        
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-[34px] md:text-[56px] font-bold text-white mb-2 md:mb-4 leading-tight">
            Библиотека промптов
          </h1>
          <p className="text-lg md:text-[22px] text-white mb-4 md:mb-6 font-medium">
            Готовые промпты для всех нейросетей ЭРА2
          </p>
          <p className="text-[15px] text-white/75 max-w-xl mx-auto mb-8 leading-relaxed">
            копировать без регистрации, открывать в генераторе одной кнопкой, оплата в рублях без VPN.
          </p>

          <div className="relative max-w-2xl mx-auto mb-8">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по промптам и темам"
              className="w-full h-14 pl-6 pr-32 bg-white rounded-full text-black placeholder:text-muted-foreground outline-none text-lg border-none"
            />
            <button className="absolute right-1.5 top-1.5 h-11 px-8 bg-black text-white rounded-full font-medium hover:bg-black/80 transition-colors">
              Найти
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[12px] text-white/60 font-bold tracking-[0.2em] uppercase">
              ПОИСК ПО МОДЕЛИ
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {providersWithCounts.map(({ providerId }) => (
                <button
                  key={providerId}
                  onClick={() => setSelectedProvider(selectedProvider === providerId ? null : providerId)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selectedProvider === providerId 
                      ? 'bg-white text-black border-white' 
                      : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                  }`}
                >
                  {getProviderName(providerId)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-12 mb-12">
        <h2 className="text-2xl font-bold mb-[20px] text-foreground">Категории</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c, idx) => (
            <CategoryTile 
              key={c.slug} 
              category={c} 
              count={categoryCounts[c.slug as keyof typeof categoryCounts] || 0} 
              imageSrc={categoryImages[idx]}
            />
          ))}
          <CategoryTile 
            category={{
              slug: 'model',
              cardTitle: 'По моделям',
              description: 'Промпты, отобранные под конкретную нейросеть: Nano Banana, Seedream, Kling и другие модели ЭРА2',
            }}
            count={getProvidersWithPrompts().length}
            imageSrc={categoryImages[categories.length]}
          />
        </div>
      </section>

      <section className="w-screen pb-20 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-medium">
              {searchQuery || selectedProvider ? 'Найдено промптов' : 'Все промпты'} 
              <span className="text-muted-foreground ml-1">{filteredItems.length}</span>
            </div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="new">Сначала новые</option>
              <option value="alpha">По алфавиту</option>
            </select>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="w-screen mb-12">
            <div style={{ columnWidth: '320px', columnGap: '3px', padding: '0 3px' }}>
              {visible.map((item) => <PromptMosaicTile key={item.slug} item={item} topics={topics} />)}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <p className="text-xl text-muted-foreground mb-6">Ничего не найдено</p>
            <button 
              onClick={handleReset}
              className="h-11 px-8 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            >
              <X className="w-4 h-4" />
              Сбросить
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6">
          {hasMore && (
            <div className="flex justify-center mb-20">
              <button onClick={showMore} className="h-11 px-8 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/30">
                Показать ещё ({remaining})
              </button>
            </div>
          )}
          <TopicCloud topics={topics} />
        </div>
      </section>
      <Footer />
    </>
  );
}
