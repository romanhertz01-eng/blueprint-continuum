import { useNavigate } from '@tanstack/react-router';
import { Heart, LucideIcon, Play } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromptItem } from '@/data/prompts/types';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

interface SectionCardProps {
  item: PromptItem;
}

// --- Image / Video Card ---
export function SectionMediaCard({ item }: SectionCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const imageUrl = item.media?.[0]?.src || '/placeholder.jpg';
  const isVideo = item.category === 'video';
  const isVertical = item.params?.aspect === '9:16';

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate({ to: '/prompts/$topic/$slug', params: { topic: item.topicSlug, slug: item.slug } });
  };

  const handleTry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    writePromptHandoff({
      prompt: item.promptRu,
      category: item.category,
      providerId: item.providerId,
      subModelId: item.subModelId,
      sourceSlug: item.slug,
    });
    const targetRoute = CATEGORY_ROUTE[item.category as keyof typeof CATEGORY_ROUTE] || '/prompts';
    if (isAuthed) navigate({ to: targetRoute });
    else window.location.href = buildAuthHref(targetRoute);
  };

  return (
    <div 
      onClick={handleAction}
      className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img 
          src={imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isVideo && isVertical && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
            Вертикальное
          </div>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg">
              <Heart className="w-4 h-4" />
           </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-[15px] font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <div className="text-[12px] text-muted-foreground font-medium mb-4 uppercase tracking-tight">
          {item.providerId} {item.params?.aspect ? `· ${item.params.aspect}` : ''}
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-[12px] font-bold">{item.likes || 0}</span>
          </div>
          <button 
            onClick={handleTry}
            className="h-8 px-4 rounded-full bg-muted border border-border/50 hover:bg-primary hover:text-white hover:border-primary text-[12px] font-bold transition-all"
          >
            Попробовать
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Text Card ---
export function SectionTextCard({ item }: SectionCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  
  const getGradient = (slug: string) => {
    // Saturated ERA2 tokens. Alternating light/dark is achieved by deterministic hues.
    const hues = [20, 200, 280, 150, 340, 45, 260]; // Orange, Blue, Purple, Green, Pink, Yellow, Indigo
    const charSum = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = charSum % hues.length;
    const hue = hues[index];
    
    // Saturation and lightness for ERA2 look
    const s = 70;
    const l = index % 2 === 0 ? 55 : 45; // Alternating lightness
    
    return `linear-gradient(135deg, hsl(${hue}, ${s}%, ${l}%), hsl(${hue + 20}, ${s}%, ${l - 10}%))`;
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    writePromptHandoff({
      prompt: item.promptRu,
      category: 'text',
      providerId: item.providerId,
      subModelId: item.subModelId,
      sourceSlug: item.slug,
    });
    if (isAuthed) navigate({ to: '/text' });
    else window.location.href = buildAuthHref('/text');
  };

  return (
    <div 
      onClick={handleAction}
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:-translate-y-1 transition-all"
      style={{ background: getGradient(item.slug) }}
    >
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="absolute top-4 right-4">
        <Heart className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
      </div>

      <div className="absolute inset-x-5 bottom-6 flex flex-col gap-4">
        <h3 className="text-[20px] font-bold text-white leading-tight drop-shadow-sm">
          {item.title}
        </h3>
        <button className="h-10 w-full rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white text-[13px] font-bold hover:bg-white/30 transition-all">
          Попробовать
        </button>
      </div>
    </div>
  );
}

// --- Audio Card ---
export function SectionAudioCard({ item }: SectionCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const getAudioGradient = (genre?: string, slug?: string) => {
    switch (genre) {
      case 'Lo-Fi': return 'linear-gradient(135deg, hsl(35, 70%, 60%), hsl(25, 60%, 50%))';
      case 'Epic': return 'linear-gradient(135deg, hsl(230, 40%, 30%), hsl(260, 50%, 20%))';
      case 'Nature': return 'linear-gradient(135deg, hsl(140, 50%, 50%), hsl(160, 40%, 40%))';
      case 'Podcast': return 'linear-gradient(135deg, hsl(210, 60%, 55%), hsl(200, 50%, 45%))';
      case 'Music': return 'linear-gradient(135deg, hsl(15, 70%, 55%), hsl(340, 60%, 50%))';
      default: return 'linear-gradient(135deg, hsl(260, 60%, 55%), hsl(280, 50%, 45%))';
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    writePromptHandoff({
      prompt: item.promptRu,
      category: 'audio',
      providerId: item.providerId,
      subModelId: item.subModelId,
      sourceSlug: item.slug,
    });
    if (isAuthed) navigate({ to: '/audio' });
    else window.location.href = buildAuthHref('/audio');
  };

  return (
    <div 
      onClick={handleAction}
      className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: getAudioGradient(item.params?.genre, item.slug) }}>
        {/* Waveform */}
        <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-8">
          {Array.from({ length: 15 }).map((_, i) => {
            const charSum = (item.slug + i).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const h = 20 + (charSum % 50);
            return (
              <div 
                key={i}
                className="w-[3px] bg-white/40 rounded-full transition-all group-hover:scale-y-125"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-[15px] font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <div className="text-[12px] text-muted-foreground font-medium mb-4 uppercase tracking-tight">
          {item.params?.duration} · {item.providerId}
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-[12px] font-bold">{item.likes || 0}</span>
          </div>
          <button className="h-8 px-4 rounded-full bg-primary text-white text-[12px] font-bold transition-all shadow-sm shadow-primary/20">
            Попробовать
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Agent Card ---
export function SectionAgentCard({ item }: SectionCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    writePromptHandoff({
      prompt: item.promptRu,
      category: 'agents',
      providerId: item.providerId,
      agentId: item.slug,
      sourceSlug: item.slug,
    });
    if (isAuthed) navigate({ to: '/agents' });
    else window.location.href = buildAuthHref('/agents');
  };

  const IconComponent = (LucideIcons as any)[item.agentIcon || 'Sparkles'] as LucideIcon;

  return (
    <div 
      onClick={handleAction}
      className="group flex items-center p-4 bg-card border border-border/50 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        {IconComponent && <IconComponent className="w-7 h-7" />}
      </div>
      <div className="ml-4 flex-grow min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-foreground truncate">{item.title}</h3>
          <Heart className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors ml-2 flex-shrink-0" />
        </div>
        <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5 font-medium leading-tight">
          {item.agentRole}
        </p>
      </div>
    </div>
  );
}
