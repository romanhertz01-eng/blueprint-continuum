import { useNavigate } from '@tanstack/react-router';
import { Heart, Image as ImageIcon, MessageSquare, Music, User, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromptItem } from '@/data/prompts/types';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

interface BaseCardProps {
  item: PromptItem;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
    case 'text': return <MessageSquare className="w-3.5 h-3.5" />;
    case 'audio': return <Music className="w-3.5 h-3.5" />;
    case 'agents': return <User className="w-3.5 h-3.5" />;
    default: return <Sparkles className="w-3.5 h-3.5" />;
  }
};

const ModelChip = ({ providerId }: { providerId?: string }) => {
  if (!providerId) return null;
  return (
    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
      {providerId.replace('-', ' ')}
    </span>
  );
};

const LikeButton = ({ likes }: { likes?: number }) => (
  <div className="flex items-center gap-1 text-muted-foreground/60">
    <Heart className="w-3.5 h-3.5" />
    <span className="text-[11px] font-bold">{likes || 0}</span>
  </div>
);

const CompactCTA = ({ label, onClick }: { label: string; onClick: (e: any) => void }) => (
  <button 
    onClick={onClick}
    className="h-9 px-5 rounded-full bg-primary text-white text-[13px] font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
  >
    {label}
  </button>
);

export function LightPromptCard({ item }: BaseCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  
  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    writePromptHandoff({
      prompt: item.promptRu,
      category: item.category,
      providerId: item.providerId,
      subModelId: item.subModelId,
      agentId: item.slug,
      sourceSlug: item.slug,
    });
    const targetRoute = CATEGORY_ROUTE[item.category as keyof typeof CATEGORY_ROUTE] || '/prompts';
    if (isAuthed) navigate({ to: targetRoute });
    else window.location.href = buildAuthHref(targetRoute);
  };

  const IconComponent = (LucideIcons as any)[item.agentIcon || 'Sparkles'] || Sparkles;

  return (
    <div className="group relative flex flex-col h-[400px] p-5 rounded-2xl border border-border bg-card hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-6">
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <CategoryIcon category={item.category} />
        </div>
        <LikeButton likes={item.likes} />
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center px-2">
        <div className={cn(
          "w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-inner",
          "bg-muted/50 text-muted-foreground group-hover:scale-110 transition-transform duration-500"
        )}>
          <IconComponent className="w-8 h-8" />
        </div>
        
        <ModelChip providerId={item.providerId} />
        <h3 className="text-[17px] font-semibold text-foreground leading-[1.3] mt-2 line-clamp-3">
          {item.title}
        </h3>
      </div>

      <div className="mt-4 flex justify-center">
        <CompactCTA label="Попробовать" onClick={handleAction} />
      </div>
    </div>
  );
}

export function ImagePromptCard({ item }: BaseCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const imageUrl = item.media?.[0]?.src || '/placeholder.jpg';

  const handleAction = (e: React.MouseEvent) => {
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
    <div className="group relative h-[400px] rounded-2xl overflow-hidden border border-border/50 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all cursor-pointer">
      <img 
        src={imageUrl} 
        alt={item.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Type Badge & Like at Top */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <div className="w-7 h-7 rounded-lg bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
          <CategoryIcon category={item.category} />
        </div>
        <div className="px-2 py-1 rounded-lg bg-black/30 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-white/90">
          <Heart className="w-3.5 h-3.5 fill-white/20" />
          <span className="text-[11px] font-bold">{item.likes || 0}</span>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
        <ModelChip providerId={item.providerId} />
        <h3 className="text-[17px] font-semibold text-white leading-[1.3] mt-1 mb-4 line-clamp-2">
          {item.title}
        </h3>
        <div>
          <CompactCTA label="Создать" onClick={handleAction} />
        </div>
      </div>
    </div>
  );
}

export function SoftPromptCard({ item }: BaseCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const getGradient = (slug: string) => {
    const hues = [210, 260, 280, 310, 340, 15, 40];
    const charSum = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hues[charSum % hues.length];
    return `linear-gradient(135deg, hsl(${hue}, 40%, 95%), hsl(${hue + 20}, 40%, 90%))`;
  };

  const handleAction = (e: React.MouseEvent) => {
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

  const IconComponent = (LucideIcons as any)[item.agentIcon || 'Sparkles'] || Sparkles;

  return (
    <div 
      className="group relative flex flex-col h-[400px] p-5 rounded-2xl border border-border/20 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all cursor-pointer"
      style={{ background: getGradient(item.slug) }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-7 h-7 rounded-lg bg-white/50 flex items-center justify-center text-slate-600">
          <CategoryIcon category={item.category} />
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <Heart className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">{item.likes || 0}</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center px-2">
        <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-white/80 shadow-sm group-hover:scale-110 transition-transform duration-500">
          <IconComponent className="w-8 h-8 text-primary/70" />
        </div>
        
        <ModelChip providerId={item.providerId} />
        <h3 className="text-[17px] font-semibold text-slate-900 leading-[1.3] mt-2 line-clamp-3">
          {item.title}
        </h3>
      </div>

      <div className="mt-4 flex justify-center">
        <CompactCTA label="Попробовать" onClick={handleAction} />
      </div>
    </div>
  );
}
