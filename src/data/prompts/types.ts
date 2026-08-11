export type PromptCategory = 'image' | 'video' | 'audio' | 'text' | 'agents';

export interface PromptTopic {
  slug: string;
  title: string;            // H1 подборки
  cardTitle: string;        // короткое имя для чипа/карточки
  category: PromptCategory;
  intro: string;            // вводный текст подборки, 700-1200 знаков
  seoTitle: string;
  seoDescription: string;
  status: 'published' | 'draft';
  relatedToolSlugs?: string[];    // слаги, реально существующие в src/data/toolPages.ts
  relatedTopicSlugs?: string[];
  updatedAt: string;              // YYYY-MM-DD
}

export interface PromptItem {
  slug: string;
  topicSlug: string;              // основная тема, она же в URL
  extraTopicSlugs?: string[];
  category: PromptCategory;
  title: string;                  // описание РЕЗУЛЬТАТА, не текст промпта
  promptRu: string;
  promptEn?: string;
  negativePrompt?: string;
  providerId: string;             // id из src/data/imageModels.ts и аналогов
  subModelId?: string;
  agentId?: string;               // для category: 'agents'
  params?: {
    aspect?: string; quality?: string; quantity?: number;
    duration?: string; resolution?: string;
  };
  chain?: { label: string; prompt: string }[];  // каскадные, пока не используется
  media: { type: 'image' | 'video' | 'audio'; src: string; poster?: string; alt: string }[];
  body: {
    overview: string;      // что на результате, 2-3 предложения
    breakdown: string;     // разбор промпта по смысловым блокам
    howToChange: string;   // что менять под себя
    mistakes: string;      // частые ошибки
  };
  status: 'published' | 'draft';
  source: 'editorial' | 'user';   // сейчас всегда 'editorial'
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  saves: number;
  shares: number;
}

export interface PromptCategoryDef {
  slug: PromptCategory;
  title: string;        // «Промпты для видео»
  cardTitle: string;    // «Видео»
  description: string;  // 200-400 знаков, для карточки категории
  route: string;        // адрес движка
  seoTitle: string;
  seoDescription: string;
}


