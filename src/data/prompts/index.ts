import { PromptTopic, PromptItem, PromptCategory, PromptCategoryDef } from './types';
import { promptTopics } from './topics';
import { promptItems } from './items';
import { promptCategories } from './categories';


export * from './types';
export { promptTopics } from './topics';
export { promptItems } from './items';
export { promptCategories } from './categories';

export const RESERVED_PROMPT_SLUGS: readonly string[] = ['image', 'video', 'audio', 'text', 'agents', 'model'];

export function isReservedPromptSlug(slug: string): boolean {
  return RESERVED_PROMPT_SLUGS.includes(slug);
}

// Защита: ни один слаг темы не должен совпасть с зарезервированным
function validateTopicSlugs() {
  if (typeof promptTopics === 'undefined') return;
  promptTopics.forEach(topic => {
    if (isReservedPromptSlug(topic.slug)) {
      console.error(`CRITICAL: Prompt topic slug "${topic.slug}" is reserved and cannot be used.`);
      if (typeof process !== 'undefined') process.exit(1);
      throw new Error(`CRITICAL: Prompt topic slug "${topic.slug}" is reserved and cannot be used.`);
    }
  });
}

// Выполняем проверку немедленно при инициализации модуля
validateTopicSlugs();


export const getCategories = (): PromptCategoryDef[] => {
  return [...promptCategories];
};

export const getCategoryBySlug = (slug: string): PromptCategoryDef | undefined => {
  return promptCategories.find(cat => cat.slug === slug);
};

export const getPublishedTopics = (): PromptTopic[] => {
  return promptTopics.filter(topic => topic.status === 'published');
};

export const getTopicBySlug = (slug: string): PromptTopic | undefined => {
  return promptTopics.find(topic => topic.slug === slug && topic.status === 'published');
};

export const getPublishedItems = (): PromptItem[] => {
  return promptItems.filter(item => item.status === 'published');
};

export const getItemsByCategory = (category: PromptCategory): PromptItem[] => {
  return promptItems.filter(item => item.status === 'published' && item.category === category);
};

export const getTopicsByCategory = (category: PromptCategory): PromptTopic[] => {
  return promptTopics.filter(topic => topic.status === 'published' && topic.category === category);
};

export const getItemsByTopic = (topicSlug: string): PromptItem[] => {
  return promptItems.filter(item => 
    item.status === 'published' && 
    (item.topicSlug === topicSlug || item.extraTopicSlugs?.includes(topicSlug))
  );
};

export const getItemBySlug = (topicSlug: string, slug: string): PromptItem | undefined => {
  return promptItems.find(item => 
    item.status === 'published' && 
    item.topicSlug === topicSlug && 
    item.slug === slug
  );
};

export const getItemsByProvider = (providerId: string): PromptItem[] => {
  return promptItems.filter(item => 
    item.status === 'published' && 
    item.providerId === providerId
  );
};

export const getProvidersWithPrompts = (): { providerId: string; count: number }[] => {
  const publishedItems = getPublishedItems();
  const counts: Record<string, number> = {};
  
  publishedItems.forEach(item => {
    counts[item.providerId] = (counts[item.providerId] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([providerId, count]) => ({ providerId, count }))
    .sort((a, b) => b.count - a.count);
};

export const countItemsByCategory = (): Record<PromptCategory, number> => {
  const publishedItems = getPublishedItems();
  const counts: Record<PromptCategory, number> = {
    image: 0,
    video: 0,
    audio: 0,
    text: 0,
    agents: 0
  };
  
  publishedItems.forEach(item => {
    if (counts.hasOwnProperty(item.category)) {
      counts[item.category]++;
    }
  });
  
  return counts;
};

export const getItemsForTool = (toolSlug: string): PromptItem[] => {
  const toolTopics = promptTopics.filter(t => t.relatedToolSlugs?.includes(toolSlug));
  const topicSlugs = toolTopics.map(t => t.slug);
  
  return promptItems.filter(item => 
    item.status === 'published' && 
    (topicSlugs.includes(item.topicSlug) || item.extraTopicSlugs?.some(s => topicSlugs.includes(s)))
  );
};

export const getRelatedItems = (item: PromptItem, limit: number = 4): PromptItem[] => {
  return promptItems
    .filter(i => 
      i.status === 'published' && 
      i.slug !== item.slug && 
      (i.topicSlug === item.topicSlug || i.category === item.category)
    )
    .slice(0, limit);
};

