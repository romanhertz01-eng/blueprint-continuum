import { PromptCategory } from '../data/prompts/types';

export const PROMPT_HANDOFF_KEY = 'era2_prompt_handoff';
export const PROMPT_HANDOFF_TTL_MS = 30 * 60 * 1000;

export interface PromptHandoff {
  prompt: string;
  category: PromptCategory;
  providerId?: string;
  subModelId?: string;
  aspect?: string;
  quality?: string;
  quantity?: number;
  duration?: string;
  resolution?: string;
  sourceSlug?: string;   // слаг промпта, откуда пришли — для аналитики
  ts: number;
}

export const CATEGORY_ROUTE: Record<PromptCategory, string> = {
  text: '/text',
  image: '/design',
  video: '/video',
  audio: '/audio',
};

export function writePromptHandoff(data: Omit<PromptHandoff, 'ts'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const handoff: PromptHandoff = {
      ...data,
      ts: Date.now()
    };
    window.sessionStorage.setItem(PROMPT_HANDOFF_KEY, JSON.stringify(handoff));
  } catch (e) {
    console.error('Failed to write prompt handoff to sessionStorage', e);
  }
}

export function readPromptHandoff(category: PromptCategory): PromptHandoff | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = window.sessionStorage.getItem(PROMPT_HANDOFF_KEY);
    if (!stored) return null;
    
    const data: PromptHandoff = JSON.parse(stored);
    const now = Date.now();
    
    // Check TTL and category match
    if (now - data.ts > PROMPT_HANDOFF_TTL_MS || data.category !== category) {
      clearPromptHandoff();
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Failed to read prompt handoff from sessionStorage', e);
    clearPromptHandoff();
    return null;
  }
}

export function clearPromptHandoff(): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.sessionStorage.removeItem(PROMPT_HANDOFF_KEY);
  } catch (e) {
    console.error('Failed to clear prompt handoff', e);
  }
}
