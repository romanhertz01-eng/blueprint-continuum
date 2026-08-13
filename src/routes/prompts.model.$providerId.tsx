import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ChevronRight, Search, Heart, Play, Zap, MessageSquare, AudioLines, FileText, LayoutGrid, ArrowRight, ArrowLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getCategories, PromptItem } from '@/data/prompts';
import { agentItems } from '@/data/prompts/agentItems';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { useAuth } from '@/contexts/AuthContext';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { buildAuthHref } from '@/lib/authRedirect';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/prompts/model/$providerId')({
  component: ModelDetailPage,
  loader: ({ params }) => {
    const providerId = params.providerId;
    
    // Поиск во всех источниках (providerId или subModelId)
    const allPrompts = [...getPublishedItems(), ...agentItems];
    const items = allPrompts.filter(item => 
      item.providerId === providerId || item.subModelId === providerId
    );

    // Находим название и описание модели
    const allProviders = [
      ...textProviders, 
      ...imageProviders, 
      ...videoProviders,
      { id: 'suno', name: 'Suno', description: 'Генерация музыки и песен по текстовому описанию.' },
      { id: 'elevenlabs', name: 'ElevenLabs', description: 'Профессиональная озвучка и клонирование голоса.' },
      { id: 'udio', name: 'Udio', description: 'Создание полноценных музыкальных композиций высокого качества.' }
    ];

    const providerInfo = allProviders.find(p => p.id === providerId);
    let name = providerInfo?.name || providerId;
    let description = '';

    if (providerInfo) {
      if ('description' in providerInfo) {
        description = providerInfo.description;
      }
    }

    // Если не нашли в провайдерах, ищем в подмоделях (для субмоделей)
    if (!providerInfo) {
      for (const p of [textProviders, imageProviders, videoProviders]) {
        const sub = (p as any).subModels?.find((s: any) => s.id === providerId);
        if (sub) {
          name = sub.name;
          description = sub.description || sub.desc || '';
          break;
        }
      }
    }

    // Текст-заглушка по категории, если описания нет
    if (!description && items.length > 0) {
      const cat = items[0].category;
      const fallbacks: Record<string, string> = {
        image: 'Библиотека профессиональных промптов для генерации реалистичных изображений и графики.',
        video: 'Коллекция готовых сценариев и запросов для создания динамичных видеороликов и анимации.',
        audio: 'Лучшие промпты для создания музыки, звуковых эффектов и качественной озвучки текста.',
        text: 'Эффективные инструкции и шаблоны для решения бизнес-задач и написания текстов любой сложности.',
        agents: 'Специализированные роли и промпты для настройки автономных ИИ-помощников.'
      };
      description = fallbacks[cat] || '';
    }

    return { items, providerId, modelName: name, modelDescription: description };
  },
});

function ModelDetailPage() {
  const { items, providerId, modelName, modelDescription } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('Все');
  const [sortBy, setSortBy] = useState<'new' | 'popular'>('new');
  
  const catMap: Record<string, string> = {
    'Изображения': 'image',
    'Видео': 'video',
    'Аудио': 'audio',
    'Текст': 'text',
    'Агенты': 'agents'
  };

  // Определяем, какие категории реально есть у модели
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      const label = Object.keys(catMap).find(key => catMap[key] === item.category);
      if (label) set.add(label);
    });
    return ['Все', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filter !== 'Все') {
      result = result.filter(item => item.category === catMap[filter]);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.promptRu.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    return result;
  }, [items, filter, searchQuery, sortBy]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <LayoutGrid className="w-8 h-8 text-muted-foreground opacity-20" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Здесь пока пусто</h1>
          <p className="text-muted-foreground mb-8">Для модели «{modelName}» пока нет опубликованных промптов.</p>
          <Link to="/prompts" className="h-11 px-6 rounded-xl bg-primary text-white font-bold flex items-center gap-2 transition-transform active:scale-95">
             <ArrowLeft className="w-4 h-4" /> Назад в каталог
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-1 text-[13px] text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Главная</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/prompts" className="hover:text-foreground">Промпты</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/prompts/model" className="hover:text-foreground">По моделям</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground/70">{modelName}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex-1">
            <h1 className="text-[32px] md:text-[40px] font-bold leading-tight mb-3">
              Промпты для {modelName}
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl line-clamp-2">
              {modelDescription}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-[13px] font-bold">
              {items.length} промптов
            </div>
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[13px] font-bold">
              Обновляется ежедневно
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "h-8 px-4 rounded-full text-[13px] font-bold transition-all whitespace-nowrap",
                  filter === cat 
                    ? "bg-foreground text-background" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="text-[14px] font-medium text-muted-foreground">
            Найдено {filteredItems.length}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Поиск по разделу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted/50 border border-border/50 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 pl-4 pr-10 rounded-xl bg-muted/50 border border-border/50 text-[14px] font-medium focus:outline-none appearance-none cursor-pointer hover:bg-muted transition-colors w-full sm:w-auto"
            >
              <option value="new">Сначала новые</option>
              <option value="popular">По популярности</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
          {filteredItems.map(item => (
            <ModelPromptCard key={item.slug} item={item} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ModelPromptCard({ item }: { item: PromptItem }) {
  if (item.category === 'text') return <TextCategoryCard item={item} />;
  if (item.category === 'audio') return <AudioCategoryCard item={item} />;
  if (item.category === 'agents') return <AgentCategoryCard item={item} />;
  return <MediaPromptCard item={item} />;
}

function MediaPromptCard({ item }: { item: PromptItem }) {
  const navigate = useNavigate();
  const media = item.media?.[0];
  const isVideo = item.category === 'video';

  return (
    <Link 
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug, slug: item.slug }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/50 transition-all duration-200 cursor-pointer h-auto"
    >
      <div className={cn(
        "relative overflow-hidden shrink-0",
        item.params?.aspect === '9:16' ? "aspect-[9/16]" : "aspect-video"
      )}>
        {media?.src && (
          <img 
            src={media.src} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm z-10">
          <Heart className="w-3 h-3 text-white fill-white" />
          <span className="text-[12px] font-bold text-white leading-none">{item.likes}</span>
        </div>
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5 flex flex-col justify-center">
        <h3 className="text-[14px] font-semibold line-clamp-1 leading-tight">{item.title}</h3>
        <div className="mt-[2px] text-[11px] font-bold text-muted-foreground uppercase tracking-tight leading-none">{item.providerId}</div>
      </div>
    </Link>
  );
}

// Переиспользуем логику карточек из основного каталога (копии для автономности файла)
function TextCategoryCard({ item }: { item: PromptItem }) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    writePromptHandoff({ prompt: item.promptRu, category: 'text', providerId: item.providerId, subModelId: item.subModelId, sourceSlug: item.slug });
    const targetRoute = '/text';
    if (isAuthed) navigate({ to: targetRoute });
    else window.location.href = buildAuthHref(targetRoute);
  };

  return (
    <div onClick={handleCardClick} className="group relative flex flex-col p-5 rounded-2xl border border-dashed border-border bg-card aspect-[4/5] transition-all duration-200 hover:-translate-y-0.5 hover:border-solid hover:border-primary/40 overflow-hidden cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-muted/50 border border-border/60">{item.providerId}</span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="w-3.5 h-3.5" />
          <span className="text-[13px]">{item.likes}</span>
        </div>
      </div>
      <h3 className="mt-4 text-[16px] font-bold line-clamp-2 leading-tight">{item.title}</h3>
      <div className="mt-3 flex-1 text-[13px] text-muted-foreground italic leading-relaxed line-clamp-6">«{item.promptRu}»</div>
      <div className="mt-4 flex items-center gap-2 text-primary font-bold text-[13px]"><Zap className="w-3.5 h-3.5" /> Попробовать</div>
    </div>
  );
}

function AudioCategoryCard({ item }: { item: PromptItem }) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const labelColors = ['#f97316', '#3b82f6', '#8b5cf6', '#14b8a6', '#ef4444', '#eab308'];
  const hash = item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const labelColor = labelColors[hash % labelColors.length];

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    writePromptHandoff({ prompt: item.promptRu, category: 'audio', providerId: item.providerId, subModelId: item.subModelId, sourceSlug: item.slug });
    const targetRoute = '/audio';
    if (isAuthed) navigate({ to: targetRoute });
    else window.location.href = buildAuthHref(targetRoute);
  };

  return (
    <div onClick={handleCardClick} className="group flex flex-col rounded-[20px] bg-card border border-border/50 h-[300px] transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 overflow-hidden cursor-pointer">
      <div className="relative flex-1 bg-muted/20 flex items-center justify-center overflow-hidden">
        <div className="absolute w-[122px] h-[122px] rounded-full bg-black/10 blur-sm translate-y-1" />
        <div className="relative w-[120px] h-[120px] transition-transform duration-400 group-hover:rotate-6">
          <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-lg"><circle cx="70" cy="70" r="70" fill="#222222" />{[0.4, 0.53, 0.66, 0.79, 0.92].map((r) => (<circle key={r} cx="70" cy="70" r={70 * r} fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.08" />))}<circle cx="70" cy="70" r="21" fill={labelColor} /><circle cx="70" cy="70" r="4" fill="hsl(var(--card))" /></svg>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-[14px] font-semibold leading-snug line-clamp-2 h-[2.6em]">{item.title}</h3>
        <div className="text-[12px] text-muted-foreground truncate">{item.params?.duration || '0:00'} · {item.providerId}</div>
        <div className="mt-3"><div className="h-8 px-4 rounded-full bg-primary text-white text-[12px] font-semibold flex items-center gap-2 w-fit"><Play className="w-[12px] h-[12px] fill-current" /> Попробовать</div></div>
      </div>
    </div>
  );
}

function AgentCategoryCard({ item }: { item: PromptItem }) {
  const IconComponent = (LucideIcons as any)[item.agentIcon || 'MessageSquare'] || LucideIcons.MessageSquare;
  const agentColors = ['bg-[#14b8a6]', 'bg-[#3b82f6]', 'bg-[#8b5cf6]', 'bg-[#d946ef]', 'bg-[#ef4444]', 'bg-[#f97316]', 'bg-[#eab308]', 'bg-[#22c55e]'];
  const bgClass = agentColors[item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % agentColors.length];

  return (
    <Link to="/prompts/agents/$slug" params={{ slug: item.slug }} className="group flex flex-col p-4 rounded-[22px] bg-card border border-border/60 min-h-[140px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40">
      <div className="flex items-start justify-between">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", bgClass)}><IconComponent className="w-[22px] h-[22px] text-white" /></div>
        <div className="flex items-center gap-1 text-muted-foreground"><Heart className="w-[13px] h-[13px]" /><span className="text-[13px]">{item.likes}</span></div>
      </div>
      <div className="mt-3 flex-1">
        <h3 className="text-[15px] font-bold truncate group-hover:text-primary transition-colors">{item.title}</h3>
        <p className="text-[12px] text-muted-foreground line-clamp-2 mt-1 leading-normal">{item.agentRole}</p>
      </div>
    </Link>
  );
}
