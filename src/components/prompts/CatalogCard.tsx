import { PromptItem } from '@/data/prompts/types';
import { LightPromptCard, ImagePromptCard, SoftPromptCard } from './BasePromptCards';

interface CatalogCardProps {
  item: PromptItem;
  index: number;
}

export function CatalogCard({ item, index }: CatalogCardProps) {
  const hasMedia = !!item.media?.[0]?.src && item.category !== 'text';
  
  // Logic to balance the grid
  if (hasMedia) {
    // Mostly images, but occasionally switch to Light for variety
    if (index % 7 === 0) return <LightPromptCard item={item} />;
    return <ImagePromptCard item={item} />;
  }
  
  // Non-media items (text, agents, audio)
  if (item.category === 'text' || item.category === 'agents') {
    if (index % 3 === 0) return <SoftPromptCard item={item} />;
    return <LightPromptCard item={item} />;
  }

  if (item.category === 'audio') {
    return <SoftPromptCard item={item} />;
  }

  return <LightPromptCard item={item} />;
}