import { Link } from '@tanstack/react-router';
import { PromptItem } from '@/data/prompts/types';
import { useLoadMore } from './useLoadMore';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';

interface PromptMasonryProps {
  items: PromptItem[];
  heading?: string;
  initialCount?: number;
  step?: number;
}

const getAspectClass = (aspect?: string) => {
  switch (aspect) {
    case '1:1': return 'aspect-square';
    case '3:4': return 'aspect-[3/4]';
    case '4:3': return 'aspect-[4/3]';
    case '16:9': return 'aspect-video';
    case '9:16': return 'aspect-[9/16]';
    default: return 'aspect-[4/3]';
  }
};

const MasonryItem = ({ item }: { item: PromptItem }) => {
  const media = item.media?.[0];
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (media?.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (media?.type === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug, slug: item.slug }}
      className="group relative block w-full overflow-hidden rounded-xl border border-border bg-card break-inside-avoid mb-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn("w-full relative", getAspectClass(item.params?.aspect))}>
        {media?.type === 'video' ? (
          <video
            ref={videoRef}
            src={media.src}
            poster={media.poster}
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={media?.src}
            alt={media?.alt || item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        {/* Model Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md border border-white/10 uppercase tracking-wider">
            {item.providerId.replace('-', ' ')}
          </span>
        </div>

        {/* Hover Gradient and Title */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 flex flex-col justify-end p-4",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug">
            {item.title}
          </h3>
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
    <section className="py-12">
      {heading && (
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {heading}
        </h2>
      )}
      
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {visible.map((item) => (
          <MasonryItem key={item.slug} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={showMore}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Показать ещё ({remaining})
          </button>
        </div>
      )}
    </section>
  );
};
