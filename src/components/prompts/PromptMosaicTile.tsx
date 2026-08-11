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
}

function getModelName(providerId: string, category: string): string {
  if (category === 'text') return textProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'image') return imageProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'video') return videoProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'audio') return providerId === 'elevenlabs' ? 'ElevenLabs' : 'Suno';
  return providerId;
}

export function PromptMosaicTile({ item }: PromptMosaicTileProps) {
  const modelName = getModelName(item.providerId, item.category);
  const media = item.media[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
      className="group relative block w-full overflow-hidden bg-muted/20 rounded-none break-inside-avoid"
      style={{ marginBottom: '3px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="sr-only">{item.title} — промпт для {modelName}</span>
      
      <div className="relative w-full h-auto overflow-hidden">
        {item.category === 'video' ? (
          <video
            ref={videoRef}
            src={media?.src}
            poster={media?.poster}
            muted
            loop
            playsInline
            className="w-full h-auto block"
          />
        ) : (
          <img
            src={media?.src}
            alt={media?.alt || item.title}
            loading="lazy"
            className="w-full h-auto block"
          />
        )}

        {/* Full Overlay on Hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Top Actions */}
          <div className="absolute top-3 left-3 flex gap-2">
            <div onClick={(e) => e.preventDefault()}>
              <TryPromptButton 
                item={item}
                className="w-[34px] h-[34px] p-0 flex items-center justify-center rounded-full bg-black/50 border-none text-white hover:bg-black/70 transition-colors"
              >
                <Zap className="w-4 h-4 fill-current" />
              </TryPromptButton>
            </div>
            <div onClick={(e) => e.preventDefault()}>
              <CopyPromptButton 
                text={item.promptRu} 
                className="w-[34px] h-[34px] p-0 flex items-center justify-center rounded-full bg-black/50 border-none text-white hover:bg-black/70 transition-colors"
              >
                 <Copy className="w-4 h-4" />
              </CopyPromptButton>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-4">
            <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight">
              {item.title}
            </h3>
            <div className="bg-white text-black text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap uppercase">
              {modelName}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
