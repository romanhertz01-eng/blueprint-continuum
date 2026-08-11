import { Link } from '@tanstack/react-router';
import { PromptItem } from '@/data/prompts/types';
import { CopyPromptButton } from './CopyPromptButton';
import { TryPromptButton } from './TryPromptButton';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { getPublishedTopics } from '@/data/prompts';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';

interface PromptCardProps {
  item: PromptItem;
}

function getModelName(providerId: string, category: string): string {
  if (category === 'text') {
    return textProviders.find(p => p.id === providerId)?.name || providerId;
  }
  if (category === 'image') {
    return imageProviders.find(p => p.id === providerId)?.name || providerId;
  }
  if (category === 'video') {
    return videoProviders.find(p => p.id === providerId)?.name || providerId;
  }
  if (category === 'audio') {
    if (providerId === 'elevenlabs') return 'ElevenLabs';
    if (providerId === 'suno') return 'Suno';
  }
  return providerId;
}

export function PromptCard({ item }: PromptCardProps) {
  const modelName = getModelName(item.providerId, item.category);
  const media = item.media[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const topics = getPublishedTopics();
  const mainTopic = topics.find(t => t.slug === item.topicSlug);
  const otherTopics = topics.filter(t => item.extraTopicSlugs?.includes(t.slug)).slice(0, 2);
  const displayTopics = [mainTopic, ...otherTopics].filter(Boolean).slice(0, 3);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug, slug: item.slug }}
      className="group block rounded-2xl bg-card border border-border overflow-hidden transition-all hover:border-[hsl(var(--primary))/50] hover:shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Preview */}
      <div className="aspect-[16/10] relative bg-muted/20 overflow-hidden">
        {media.type === 'video' ? (
          <video
            ref={videoRef}
            src={media.src}
            poster={media.poster}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={media.src}
            alt={media.alt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        {/* Model Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border text-[10px] font-bold uppercase tracking-wider text-foreground/80">
          {modelName}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-foreground leading-snug line-clamp-2 mb-3 min-h-[2.5rem]">
          {item.title}
        </h3>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {displayTopics.map((topic, idx) => (
            <span 
              key={topic?.slug || idx}
              className="text-[11px] px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground border border-border/50"
            >
              {topic?.cardTitle || topic?.title}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <CopyPromptButton text={item.promptRu} className="w-full" />
          <TryPromptButton item={item} className="w-full" />
        </div>
      </div>
    </Link>
  );
}
