import { Link } from '@tanstack/react-router';
import { PromptItem, PromptTopic } from '@/data/prompts/types';
import { CopyPromptButton } from './CopyPromptButton';
import { TryPromptButton } from './TryPromptButton';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { Copy, Zap } from 'lucide-react';

interface PromptMosaicTileProps {
  item: PromptItem;
  topics: PromptTopic[];
  index: number;
}

const SPAN_MAP: Record<string, number> = {
  '1:1': 26,
  '3:4': 34,
  '4:3': 20,
  '16:9': 15,
  '9:16': 46,
};

function getModelName(providerId: string, category: string): string {
  if (category === 'text') return textProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'image') return imageProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'video') return videoProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'audio') return providerId === 'elevenlabs' ? 'ElevenLabs' : 'Suno';
  return providerId;
}

export function PromptMosaicTile({ item, index }: PromptMosaicTileProps) {
  const modelName = getModelName(item.providerId, item.category);
  const media = item.media[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const aspect = item.params?.aspect || '4:3';
  const rowSpan = SPAN_MAP[aspect] || 20;
  const isWide = index % 4 === 0;

  const handleMouseEnter = () => {
    if (item.category === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (item.category === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug, slug: item.slug }}
      className={cn(
        "group relative block w-full overflow-hidden bg-muted/20 rounded-none",
        isWide && "col-span-2"
      )}
      style={{ gridRowEnd: `span ${rowSpan}` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="sr-only">{item.title} — промпт для {modelName}</span>
      
      <div className="relative w-full h-full overflow-hidden">
        {item.category === 'video' ? (
          <video
            ref={videoRef}
            src={media?.src}
            poster={media?.poster}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={media?.src}
            alt={media?.alt || item.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        )}

        {/* Minimal Overlay on Hover */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <div onClick={(e) => e.preventDefault()}>
            <CopyPromptButton 
              text={item.promptRu} 
              className="w-[34px] h-[34px] p-0 flex items-center justify-center rounded-full bg-black/40 border border-white/40 text-white hover:bg-black/60 transition-colors"
            >
               <Copy className="w-4 h-4" />
            </CopyPromptButton>
          </div>
          <div onClick={(e) => e.preventDefault()}>
            <TryPromptButton 
              item={item}
              className="w-[34px] h-[34px] p-0 flex items-center justify-center rounded-full bg-[hsl(var(--primary))] border-none text-white hover:brightness-110 transition-transform"
            >
              <Zap className="w-4 h-4 fill-current" />
            </TryPromptButton>
          </div>
        </div>
      </div>
    </Link>
  );
}
