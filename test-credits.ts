import { imageProviders } from './src/data/imageModels';
import { PromptItem } from './src/data/prompts/types';

function getCredits(item: any): number | null {
  const { providerId, subModelId, category } = item;
  if (!subModelId) return null;

  if (category === 'image') {
    const provider = imageProviders.find(p => p.id === providerId);
    return provider?.subModels.find(s => s.id === subModelId)?.credits ?? null;
  }
  return null;
}

const item1 = { providerId: 'nano-banana', subModelId: 'nb-2-1k', category: 'image' };
const item2 = { providerId: 'seedream', subModelId: 'seedream-5-lite', category: 'image' };

console.log('nano-banana/nb-2-1k:', getCredits(item1));
console.log('seedream/seedream-5-lite:', getCredits(item2));
