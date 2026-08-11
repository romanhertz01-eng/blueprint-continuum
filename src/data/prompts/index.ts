import { PromptTopic, PromptItem } from './types';
import { promptTopics } from './topics';
import { promptItems } from './items';

export * from './types';
export { promptTopics } from './topics';
export { promptItems } from './items';

export const getPublishedTopics = (): PromptTopic[] => {
  return promptTopics.filter(topic => topic.status === 'published');
};

export const getTopicBySlug = (slug: string): PromptTopic | undefined => {
  return promptTopics.find(topic => topic.slug === slug && topic.status === 'published');
};

export const getPublishedItems = (): PromptItem[] => {
  return promptItems.filter(item => item.status === 'published');
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
