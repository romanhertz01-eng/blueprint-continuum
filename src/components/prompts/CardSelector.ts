import { PromptItem } from '@/data/prompts/types';
import { LightPromptCard, ImagePromptCard, SoftPromptCard } from './BasePromptCards';

export const getBaseCardComponent = (item: PromptItem) => {
  const hasMedia = !!item.media?.[0]?.src && item.category !== 'text';
  
  if (hasMedia) {
    return ImagePromptCard;
  }
  
  if (item.category === 'audio' || item.category === 'agents') {
    return SoftPromptCard;
  }

  return LightPromptCard;
};
