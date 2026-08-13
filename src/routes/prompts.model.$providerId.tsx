import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ChevronRight, Home, Star, ArrowRight, Search, LayoutGrid, Heart, Play, MessageSquare, Scale, Calculator, TrendingUp, BarChart, Users, PenTool, Languages, BookOpen, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getPublishedTopics, PromptItem } from '@/data/prompts';
import { agentItems } from '@/data/prompts/agentItems';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { writePromptHandoff } from '@/lib/promptHandoff';
import { buildAuthHref } from '@/lib/authRedirect';

export const Route = createFileRoute('/prompts/model/$providerId')({
  component: ModelDetailPage,
  loader: ({ params }) => {
    const providerId = params.providerId.toLowerCase();
    
    // 1. Collect all prompts (editorial + agents)
    const allItems = [...getPublishedItems(), ...agentItems];
    
    // 2. Filter by providerId or subModelId
    const items = allItems.filter(item => 
      item.providerId.toLowerCase() === providerId || 
      item.subModelId?.toLowerCase() === providerId
    );
    
    // 3. Find provider info for metadata
    const allProviders = [
      ...textProviders.map(p => ({ ...p, category: 'text' as const })),
      ...imageProviders.map(p => ({ ...p, category: 'image' as const })),
      ...videoProviders.map(p => ({ ...p, category: 'video' as const }))
    ];
    
    const provider = allProviders.find(p => p.id.toLowerCase() === providerId);
    
    // Also check submodels if not found by provider ID
    let modelName = provider?.name || params.providerId;
    let modelDesc = (provider as any)?.description || '';

    if (!provider) {
      for (const p of allProviders) {
        const sub = p.subModels.find(s => s.id.toLowerCase() === providerId);
        if (sub) {
          modelName = sub.name;
          modelDesc = (sub as any)?.description || (sub as any)?.desc || '';
          break;
        }
      }
    }

    return { 
      items, 
      providerId: params.providerId,
      modelName,
      modelDesc,
      category: (provider as any)?.category
    };
  },
});

function TextCategoryCard({ item }: { item: PromptItem }) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const providerColors: Record<string, string> = {
    chatgpt: 'bg-[#10a37f]/7',
    claude: 'bg-[#d97757]/7',
    gemini: 'bg-[#4285f4]/7',
    deepseek: 'bg-[#60a5fa]/7',
  };
  
  const tintClass = providerColors[item.providerId.toLowerCase()] || 'bg-muted/7';

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    writePromptHandoff({
      prompt: item.promptRu,
      category: 'text',
      providerId: item.providerId,
      subModelId: item.subModelId,
      sourceSlug: item.slug,
    });
    const targetRoute = '/text';
    if (isAuthed) navigate({ to: targetRoute });
    else window.location.href = buildAuthHref(targetRoute);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col p-5 rounded-2xl border border-dashed border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-solid hover:border-primary/40 overflow-hidden cursor-pointer h-full",
        tintClass
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-muted/50 border border-border/60">
          {item.providerId}
        </span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="w-3.5 h-3.5" />
          <span className="text-[13px]">{item.likes}</span>
        </div>
      </div>
      <h3 className="mt-4 text-[17px] font-bold line-clamp-2 leading-tight">{item.title}</h3>
      <div className="mt-3 flex-1 text-[14px] text-muted-foreground italic leading-relaxed line-clamp-6">«{item.promptRu}»</div>
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
    writePromptHandoff({
      prompt: item.promptRu,
      category: 'audio',
      providerId: item.providerId,
      subModelId: item.subModelId,
      sourceSlug: item.slug,
    });
    const targetRoute = '/audio';
    if (isAuthed) navigate({ to: targetRoute });
    else window.location.href = buildAuthHref(targetRoute);
  };

  return (
    <div onClick={handleCardClick} className="group flex flex-col rounded-[20px] bg-card border border-border/50 h-[310px] transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 overflow-hidden cursor-pointer">
      <div className="relative flex-1 bg-muted/20 flex items-center justify-center overflow-hidden">
        <div className="absolute w-[142px] h-[142px] rounded-full bg-black/10 blur-sm translate-y-1" />
        <div className="relative w-[140px] h-[140px] transition-transform duration-400 group-hover:rotate-6">
          <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-lg">
            <circle cx="70" cy="70" r="70" fill="#222222" />
            {[0.4, 0.53, 0.66, 0.79, 0.92].map((r) => (
              <circle key={r} cx="70" cy="70" r={70 * r} fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.08" />
            ))}
            <circle cx="70" cy="70" r="21" fill={labelColor} />
            <circle cx="70" cy="70" r="4" fill="hsl(var(--card))" />
          </svg>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-[15px] font-semibold leading-snug line-clamp-2 h-[2.6em]">{item.title}</h3>
        <div className="text-[13px] text-muted-foreground truncate">{item.params?.duration || '0:00'} · {item.providerId}</div>
      </div>
    </div>
  );
}

function VideoCategoryCard({ item }: { item: PromptItem }) {
  const navigate = useNavigate();
  const isVertical = item.params?.aspect === '9:16';

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: '/prompts/$topic/$slug', params: { topic: item.topicSlug, slug: item.slug } });
  };

  return (
    <div onClick={handleCardClick} className="group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/50 transition-all duration-200 cursor-pointer h-auto">
      <div className={cn("relative overflow-hidden shrink-0", isVertical ? "aspect-[9/16]" : "aspect-video")}>
        {item.media?.[0]?.src && (
          <img src={item.media[0].src} alt={item.title} className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]" />
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm z-10">
          <Heart className="w-3 h-3 text-white fill-white" />
          <span className="text-[12px] font-bold text-white leading-none">{item.likes}</span>
        </div>
        {isVertical && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm z-10">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Вертикальное</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5 flex flex-col justify-center">
        <h3 className="text-[14px] font-semibold line-clamp-1 leading-tight">{item.title}</h3>
        <div className="mt-[2px] text-[11px] font-bold text-muted-foreground uppercase tracking-tight leading-none">{item.providerId}</div>
      </div>
    </div>
  );
}

function AgentCategoryCard({ item }: { item: PromptItem }) {
  const IconComponent = (LucideIcons as any)[item.agentIcon || 'MessageSquare'] || MessageSquare;
  const agentColors = ['bg-[#14b8a6]', 'bg-[#3b82f6]', 'bg-[#8b5cf6]', 'bg-[#d946ef]', 'bg-[#ef4444]', 'bg-[#f97316]', 'bg-[#eab308]', 'bg-[#22c55e]'];
  const bgClass = agentColors[item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % agentColors.length];

  return (
    <Link to="/prompts/agents/$slug" params={{ slug: item.slug }} className="group flex flex-col p-4 rounded-[22px] bg-card border border-border/60 min-h-[140px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", bgClass)}>
          <IconComponent className="w-[26px] h-[26px] text-white" />
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Heart className="w-[13px] h-[13px]" />
          <span className="text-[13px]">{item.likes}</span>
        </div>
      </div>
      <div className="mt-3 flex-1">
        <h3 className="text-[16px] font-bold truncate group-hover:text-primary transition-colors">{item.title}</h3>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 leading-normal">{item.agentRole}</p>
      </div>
    </Link>
  );
}

function ModelDetailPage() {
  const { items, modelName, modelDesc, category } = Route.useLoaderData();
  const [activeFilter, setActiveFilter] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'alpha'>('new');

  const availableTypes = useMemo(() => {
    const types = new Set(['Все']);
    items.forEach(item => {
      if (item.category === 'image') types.add('Изображения');
      if (item.category === 'video') types.add('Видео');
      if (item.category === 'audio') types.add('Аудио');
      if (item.category === 'text') types.add('Текст');
      if (item.category === 'agents') types.add('Агенты');
    });
    return Array.from(types);
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      if (activeFilter === 'Изображения' && item.category !== 'image') return false;
      if (activeFilter === 'Видео' && item.category !== 'video') return false;
      if (activeFilter === 'Аудио' && item.category !== 'audio') return false;
      if (activeFilter === 'Текст' && item.category !== 'text') return false;
      if (activeFilter === 'Агенты' && item.category !== 'agents') return false;
      
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.promptRu?.toLowerCase().includes(q);
      }
      return true;
    });

    if (sortBy === 'new') result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    else if (sortBy === 'popular') result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    else if (sortBy === 'alpha') result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [items, activeFilter, searchQuery, sortBy]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
        <h1 className="text-2xl font-bold mb-2">Здесь пока пусто</h1>
        <p className="text-muted-foreground mb-8">Для этой модели ещё не добавлено ни одного промпта.</p>
        <Link to="/prompts" className="h-11 px-6 rounded-xl bg-primary text-white font-bold flex items-center gap-2 transition-transform active:scale-95">
           <Home className="w-4 h-4" /> В каталог
        </Link>
        <div className="w-full mt-auto"><Footer /></div>
      </div>
    );
  }

  const fallbackDesc = category === 'text' ? 'Лучшие текстовые промпты для работы и творчества.' 
                    : category === 'video' ? 'Готовые сценарии и стили для генерации видео.'
                    : category === 'image' ? 'Креативные запросы для создания качественных изображений.'
                    : 'Специализированные запросы для достижения лучшего результата.';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <section className="pt-6 pb-8 px-6 max-w-7xl mx-auto w-full">
        <nav className="flex items-center gap-2 text-[12px] text-muted-foreground mb-6 font-medium">
          <Link to="/" className="hover:text-foreground flex items-center gap-1 transition-colors"><Home className="w-3 h-3" /> Главная</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link to="/prompts" className="hover:text-foreground transition-colors">Промпты</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link to="/prompts/model" className="hover:text-foreground transition-colors">По моделям</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground">{modelName}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-[32px] md:text-[42px] font-bold tracking-tight">Промпты для {modelName}</h1>
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            </div>
            <p className="text-muted-foreground text-[15px] max-w-2xl leading-relaxed line-clamp-2">{modelDesc || fallbackDesc}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-bold border border-border/50 text-muted-foreground flex items-center gap-1.5">
               <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {items.length} промптов
            </div>
            <div className="px-3 py-1.5 rounded-full bg-muted/40 text-[12px] font-bold border border-border/50 text-muted-foreground flex items-center gap-1.5">
               <ArrowRight className="w-3.5 h-3.5" /> Обновляется ежедневно
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {availableTypes.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border uppercase tracking-wider h-8 flex items-center justify-center",
                  activeFilter === filter ? "bg-primary text-white border-primary" : "bg-muted/20 border-border/50 hover:bg-muted/40 text-muted-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 w-full mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="text-[13px] font-bold text-muted-foreground uppercase">НАЙДЕНО {filteredItems.length}</div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Поиск по разделу..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-[13px] w-full md:w-[240px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div className="relative group/sort">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 pl-4 pr-10 rounded-xl border border-border bg-card text-[13px] font-bold appearance-none focus:outline-none cursor-pointer hover:bg-muted/30 transition-all"
              >
                <option value="new">Сначала новые</option>
                <option value="popular">По популярности</option>
                <option value="alpha">По алфавиту</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start mb-20">
          {filteredItems.map(item => {
            if (item.category === 'text') return <TextCategoryCard key={item.slug} item={item} />;
            if (item.category === 'audio') return <AudioCategoryCard key={item.slug} item={item} />;
            if (item.category === 'agents') return <AgentCategoryCard key={item.slug} item={item} />;
            return <VideoCategoryCard key={item.slug} item={item} />;
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}
