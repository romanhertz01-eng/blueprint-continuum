import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems } from '@/data/prompts';
import { agentItems } from '@/data/prompts/agentItems';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { ORIGIN } from '@/lib/origin';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const TITLE = 'Промпты по моделям — библиотека ЭРА2 | ERA2.ai';
const DESCRIPTION = 'Коллекция лучших промптов, отобранных для конкретных нейросетей. Nano Banana, Seedream, Kling и другие модели — один и тот же запрос на разных моделях даёт разный результат.';
const CANONICAL = `${ORIGIN}/prompts/model`;

export const Route = createFileRoute('/prompts/model/')({
  component: ModelsListPage,
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

function getProviderDisplayName(id: string) {
  const p = [
    ...textProviders, 
    ...imageProviders, 
    ...videoProviders,
    { id: 'suno', name: 'Suno' },
    { id: 'elevenlabs', name: 'ElevenLabs' },
    { id: 'udio', name: 'Udio' }
  ].find(provider => provider.id.toLowerCase() === id.toLowerCase());
  
  if (p) return p.name;
  
  const names: Record<string, string> = {
    'chatgpt': 'ChatGPT',
    'claude': 'Claude',
    'gemini': 'Gemini',
    'deepseek': 'DeepSeek',
    'flux': 'Flux',
    'midjourney': 'Midjourney',
    'stable-diffusion': 'Stable Diffusion',
    'kling': 'Kling AI',
    'luma': 'Luma Dream Machine',
    'sora': 'Sora',
    'wan': 'Wan AI',
    'hailuo': 'Hailuo AI',
    'heygen': 'HeyGen',
    'veo': 'Veo'
  };
  
  return names[id.toLowerCase()] || id;
}

function ModelsListPage() {
  const allPrompts = [...getPublishedItems(), ...agentItems];
  
  const providers = useMemo(() => {
    const counts: Record<string, number> = {};
    const firstMedias: Record<string, string | undefined> = {};

    allPrompts.forEach(item => {
      const pId = item.providerId.toLowerCase();
      counts[pId] = (counts[pId] || 0) + 1;
      if (!firstMedias[pId]) {
        const media = item.media?.find((m: any) => m.src);
        if (media) firstMedias[pId] = media.src;
      }
    });

    return Object.entries(counts)
      .map(([providerId, count]) => ({
        providerId,
        count,
        imageSrc: firstMedias[providerId],
        name: getProviderDisplayName(providerId)
      }))
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [allPrompts]);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": ORIGIN },
      { "@type": "ListItem", "position": 2, "name": "Промпты", "item": `${ORIGIN}/prompts` },
      { "@type": "ListItem", "position": 3, "name": "По моделям", "item": CANONICAL }
    ]
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": TITLE,
    "description": DESCRIPTION,
    "url": CANONICAL
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <nav className="flex items-center gap-1 text-[13px] text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Главная</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/prompts" className="hover:text-foreground">Промпты</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground/70">По моделям</span>
        </nav>

        <h1 className="text-[36px] md:text-[48px] font-bold leading-tight mb-4 text-foreground">
          Промпты по моделям
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          Под каждую модель нужны свои формулировки. Один и тот же запрос на разных моделях даёт разный результат. Мы отобрали лучшие примеры для каждой нейросети в ЭРА2.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {providers.map(({ providerId, count, imageSrc, name }: any) => {
            return (
              <Link
                key={providerId}
                to="/prompts/model/$providerId"
                params={{ providerId }}
                className="group h-[200px] rounded-[16px] overflow-hidden relative flex flex-col justify-end p-6 border border-border/50"
              >
                {imageSrc ? (
                  <>
                    <img
                      src={imageSrc}
                      alt={name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
                    
                    <div className="absolute top-6 right-6 bg-white text-black text-[13px] px-3 py-1 rounded-full font-bold">
                      {count} {getPromptWord(count)}
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-[26px] font-bold text-white leading-tight">
                        {name}
                      </h3>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center">
                    <div className="text-[64px] font-bold text-muted-foreground/30 select-none">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="absolute top-6 right-6 bg-foreground text-background text-[13px] px-3 py-1 rounded-full font-bold">
                      {count} {getPromptWord(count)}
                    </div>

                    <div className="absolute bottom-6 left-6">
                      <h3 className="text-[26px] font-bold text-foreground leading-tight">
                        {name}
                      </h3>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}

function getPromptWord(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'промптов';
  if (lastDigit === 1) return 'промпт';
  if (lastDigit >= 2 && lastDigit <= 4) return 'промпта';
  return 'промптов';
}
