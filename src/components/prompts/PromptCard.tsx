import { Link } from '@tanstack/react-router';
import { PromptItem, PromptTopic } from '@/data/prompts/types';
import { CopyPromptButton } from './CopyPromptButton';
import { TryPromptButton } from './TryPromptButton';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { Play } from 'lucide-react';

interface PromptCardProps {
  item: PromptItem;
  topics: PromptTopic[];
}

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

const getWaveHeights = (slug: string) => {
  const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 24 }).map((_, i) => 20 + ((hash + i * 17) % 60));
};

export function PromptCard({ item, topics }: PromptCardProps) {
  const modelName = getModelName(item.providerId, item.category);
  const media = item.media[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mainTopic = topics.find(t => t.slug === item.topicSlug);
  const categoryAspect = CATEGORY_ASPECTS[item.category] || '';

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const renderMedia = () => {
    if (item.category === 'text' || item.category === 'agents') return null;

    return (
      <div className={cn("relative w-full overflow-hidden bg-muted/30", categoryAspect)}>
        {item.category === 'video' ? (
          <video ref={videoRef} src={media.src} poster={media.poster} muted loop playsInline className="w-full h-full object-cover" />
        ) : item.category === 'audio' ? (
          <div className="w-full h-full flex items-center justify-center gap-0.5">
            {getWaveHeights(item.slug).map((h, i) => (
              <div key={i} className="w-1 bg-primary/40 rounded-full" style={{ height: `${h}%` }} />
            ))}
            <Play className="absolute w-8 h-8 fill-foreground text-foreground" />
          </div>
        ) : (
          <img src={media.src} alt={media.alt} loading="lazy" className="w-full h-full object-cover" />
        )}
        
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-card text-[11px] font-bold uppercase tracking-wider">{modelName}</div>
        {item.category === 'video' && <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-card/80 text-[10px]">{item.params?.duration}</div>}
        
        <div className={cn("absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-2 transition-opacity duration-300", isHovered ? "opacity-100" : "opacity-0")}>
           <CopyPromptButton text={item.promptRu} />
           <TryPromptButton item={item} />
        </div>
      </div>
    );
  };

  return (
    <Link to="/prompts/$topic/$slug" params={{ topic: item.topicSlug, slug: item.slug }} 
      className="group block rounded-2xl bg-card border border-border overflow-hidden"
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
    >
      {renderMedia()}
      <div className="p-4">
        <h3 className="text-[14px] font-semibold text-foreground line-clamp-2 mb-2">{item.title}</h3>
        {item.category === 'text' && (
          <div className="text-[11px] font-mono bg-muted/30 p-2 rounded mb-2 line-clamp-5">{item.promptRu}</div>
        )}
        <div className="text-[11px] text-muted-foreground">{mainTopic?.title} · {item.category === 'text' ? `${item.promptRu.length} знаков` : item.params?.aspect || ''}</div>
      </div>
    </Link>
  );
}
