import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getItemsByProvider, getPublishedTopics } from '@/data/prompts';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { PromptMosaicTile } from '@/components/prompts/PromptMosaicTile';

export const Route = createFileRoute('/prompts/model/$providerId')({
  component: ModelDetailPage,
  loader: ({ params }) => {
    const items = getItemsByProvider(params.providerId);
    if (items.length === 0) throw notFound();
    return { items, providerId: params.providerId };
  },
});

function getProviderName(id: string) {
  const p = [...textProviders, ...imageProviders, ...videoProviders].find(provider => provider.id === id);
  return p?.name || id;
}

function ModelDetailPage() {
  const { items, providerId } = Route.useLoaderData();
  const name = getProviderName(providerId);
  const topics = getPublishedTopics();

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <nav className="flex items-center gap-1 text-[13px] text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Главная</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/prompts" className="hover:text-foreground">Промпты</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/prompts/model" className="hover:text-foreground">По моделям</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground/70">{name}</span>
        </nav>

        <h1 className="text-[36px] font-bold leading-tight mb-12 text-foreground">
          Промпты для {name}
        </h1>

        <div className="w-screen relative left-1/2 -translate-x-1/2 mb-12">
          <div style={{ columnWidth: '320px', columnGap: '3px', padding: '0 3px' }}>
            {items.map((item: any) => 
              item.category === 'text'
                ? <TextPromptCard key={item.slug} item={item} />
                : <PromptMosaicTile key={item.slug} item={item} topics={topics} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
