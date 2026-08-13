import { PromptItem } from '@/data/prompts/types';
import { LightPromptCard } from './BasePromptCards';

interface CatalogCardProps {
  item: PromptItem;
  index: number;
}

export function CatalogCard({ item }: CatalogCardProps) {
  // PHASE A: Only the informative light card is used now, replacing images and colored gradients.
  return <LightPromptCard item={item} />;
}
