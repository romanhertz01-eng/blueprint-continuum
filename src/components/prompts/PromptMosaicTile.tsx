import { Link } from '@tanstack/react-router';
import { PromptItem, PromptTopic } from '@/data/prompts/types';
import { CopyPromptButton } from './CopyPromptButton';
import { TryPromptButton } from './TryPromptButton';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { Play, Copy, Zap } from 'lucide-react';

interface PromptMosaicTileProps {
  item: PromptItem;
  topics: PromptTopic[];
}

const ASPECT_MAP: Record<string, string> = {
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
};

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
  const [isHovered, setIsHovered] = useState(false);
  const aspectClass = ASPECT_MAP[item.params?.aspect || ''] || 'aspect-[4/3]';

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (item.category === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (item.category === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug, slug: item.slug }}
      className="group relative block w-full overflow-hidden break-inside-avoid mb-1 bg-muted/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="sr-only">{item.title} — промпт для {modelName}</span>
      
      <div className={cn("relative w-full overflow-hidden", aspectClass)}>
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

        {/* Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent transition-opacity duration-200 flex flex-col justify-end p-3",
          "opacity-0 group-hover:opacity-100",
          "@media (hover: none) { opacity-100 }"
        )}>
          <div className="pr-10">
            <h3 className="text-[13px] font-medium text-white line-clamp-2 leading-snug">
              {item.title}
            </h3>
            <div className="text-[11px] text-white/70 mt-1">
              {modelName}
            </div>
          </div>

          <div className={cn(
            "absolute bottom-2 right-2 flex flex-col gap-1.5 transition-opacity duration-200",
            "@media (hover: hover) { opacity-0 group-hover:opacity-100 }",
            "@media (hover: none) { display: none }"
          )}>
            <div onClick={(e) => e.preventDefault()}>
              <CopyPromptButton 
                text={item.promptRu} 
                className="w-[30px] h-[30px] p-0 flex items-center justify-center rounded-full bg-black/40 border border-white/20 text-white hover:bg-black/60"
              >
                 <Copy className="w-3.5 h-3.5" />
              </CopyPromptButton>
            </div>
            <div onClick={(e) => e.preventDefault()}>
              <TryPromptButton 
                item={item}
                className="w-[30px] h-[30px] p-0 flex items-center justify-center rounded-full bg-[hsl(var(--primary))] border-none text-white hover:brightness-110"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
              </TryPromptButton>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
