import { Link } from '@tanstack/react-router';
import { PromptItem } from '@/data/prompts/types';
import { useLoadMore } from './useLoadMore';
import { cn } from '@/lib/utils';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { textProviders } from '@/data/textModels';

interface PromptMasonryProps {
  items: PromptItem[];
  heading?: string;
  initialCount?: number;
  step?: number;
}

function getModelName(providerId: string, category: string): string {
  if (category === 'text') return textProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'image') return imageProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'video') return videoProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'audio') return providerId === 'elevenlabs' ? 'ElevenLabs' : 'Suno';
  return providerId;
}

const MasonryItem = ({ item }: { item: PromptItem }) => {
  const media = item.media?.[0];
  if (!media?.src) return null;

  const modelName = getModelName(item.providerId, item.category);

  return (
    <Link
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug, slug: item.slug }}
      className="group relative block w-full overflow-hidden rounded-none break-inside-avoid"
      style={{ marginBottom: '3px' }}
    >
      <div className="w-full relative">
        <img
          src={media.src}
          alt={media.alt || item.title}
          loading="lazy"
          className="w-full h-auto block"
        />
        
        <span className="sr-only">{item.title}</span>

        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 flex flex-col justify-end p-4 z-10",
          "group-hover:opacity-100"
        )}>
          <div className="flex items-end justify-between gap-2">
            <h3 className="text-[13px] font-medium text-white line-clamp-2 leading-snug">
              {item.title}
            </h3>
            <span className="shrink-0 rounded-full bg-white px-[10px] py-[4px] text-[11px] font-bold text-black uppercase">
              {modelName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const PromptMasonry = ({ 
  items, 
  heading, 
  initialCount = 12, 
  step = 12 
}: PromptMasonryProps) => {
  const { visible, hasMore, remaining, showMore } = useLoadMore(items, initialCount, step);

  if (items.length === 0) return null;

  return (
    <section className="py-0">
      {heading && (
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {heading}
          </h2>
        </div>
      )}
      
      <div 
        className="w-full"
        style={{ columnWidth: '300px', columnGap: '3px', padding: '0 3px' }}
      >
        {visible.map((item) => (
          <MasonryItem key={item.slug} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 mb-12 flex justify-center w-full">
          <div className="max-w-[1200px] w-full px-4 flex justify-center">
            <button
              onClick={showMore}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Показать ещё ({remaining})
            </button>
          </div>
        </div>
      )}
    </section>
  );
};