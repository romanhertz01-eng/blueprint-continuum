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

  const getAudioGradient = (genre?: string, slug?: string) => {
    // ERA2 Theme tokens based gradients
    switch (genre) {
      case 'Lo-Fi': 
        return 'linear-gradient(135deg, hsl(35, 30%, 92%), hsl(25, 25%, 85%))';
      case 'Epic':
      case 'Trailer':
        return 'linear-gradient(135deg, hsl(230, 20%, 25%), hsl(260, 25%, 15%))';
      case 'Nature':
        return 'linear-gradient(135deg, hsl(140, 25%, 90%), hsl(160, 20%, 82%))';
      case 'Podcast':
      case 'Voice':
        return 'linear-gradient(135deg, hsl(210, 30%, 92%), hsl(200, 25%, 85%))';
      case 'Meditation':
      case 'Calm':
        return 'linear-gradient(135deg, hsl(280, 25%, 92%), hsl(260, 20%, 86%))';
      case 'Music':
        return 'linear-gradient(135deg, hsl(15, 40%, 90%), hsl(340, 30%, 85%))';
      default:
        const hues = [210, 260, 280, 310, 340, 15, 40];
        const charSum = (slug || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hues[charSum % hues.length];
        return `linear-gradient(135deg, hsl(${hue}, 40%, 95%), hsl(${hue + 20}, 40%, 90%))`;
    }
  };

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
      agentId: item.slug,
      sourceSlug: item.slug,
    });
    const targetRoute = CATEGORY_ROUTE[item.category as keyof typeof CATEGORY_ROUTE] || '/prompts';
    if (isAuthed) navigate({ to: targetRoute });
    else window.location.href = buildAuthHref(targetRoute);
  };

  const IconComponent = (LucideIcons as any)[item.agentIcon || 'Sparkles'] || Sparkles;
  const isAudio = item.category === 'audio';

  return (
    <div 
      className="group relative flex flex-col h-[400px] p-5 rounded-2xl border border-border/20 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
      style={{ background: isAudio ? getAudioGradient(item.params?.genre, item.slug) : getGradient(item.slug) }}
    >
      {/* Visual Header - Like & Category */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md",
          isAudio && (item.params?.genre === 'Epic' || item.params?.genre === 'Trailer') 
            ? "bg-white/10 text-white/80 border border-white/5" 
            : "bg-white/50 text-slate-600 border border-white/20"
        )}>
          <CategoryIcon category={item.category} />
        </div>
        <div className={cn(
          "px-2 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-md border",
          isAudio && (item.params?.genre === 'Epic' || item.params?.genre === 'Trailer')
            ? "bg-white/10 border-white/5 text-white/90"
            : "bg-white/50 border-white/20 text-slate-600"
        )}>
          <Heart className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">{item.likes || 0}</span>
        </div>
      </div>

      {/* Media / Icon Area */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-2 z-10">
        {isAudio ? (
          <div className="relative w-full aspect-[4/3] mb-6 rounded-xl overflow-hidden shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
            {/* Background Cover */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-gradient-to-br from-white/20 to-transparent" />
            
            {/* Waveform Visualization */}
            <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-8">
              {Array.from({ length: 12 }).map((_, i) => {
                const charSum = item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0) * (i + 1), 0);
                const height = 15 + (charSum % 40);
                return (
                  <div 
                    key={i}
                    className={cn(
                      "w-[3px] rounded-full transition-all duration-500 group-hover:scale-y-125",
                      (item.params?.genre === 'Epic' || item.params?.genre === 'Trailer') ? "bg-white/40" : "bg-primary/30"
                    )}
                    style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}
                  />
                );
              })}
            </div>

            {/* Subtle Center Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-white/80 shadow-sm group-hover:scale-110 transition-transform duration-500">
            <IconComponent className="w-8 h-8 text-primary/70" />
          </div>
        )}
        
        <div className="flex flex-col items-center gap-1">
          <span className={cn(
            "text-[12px] font-bold uppercase tracking-widest",
            isAudio && (item.params?.genre === 'Epic' || item.params?.genre === 'Trailer') ? "text-white/50" : "text-slate-500"
          )}>
            {isAudio ? `${item.params?.duration || '0:00'} · ${item.providerId?.replace('-', ' ')}` : item.providerId?.replace('-', ' ')}
          </span>
          <h3 className={cn(
            "text-[18px] font-semibold leading-[1.3] line-clamp-2 mt-1 px-2",
            isAudio && (item.params?.genre === 'Epic' || item.params?.genre === 'Trailer') ? "text-white" : "text-slate-900"
          )}>
            {item.title}
          </h3>
        </div>
      </div>

      <div className="mt-4 flex justify-center z-10">
        <CompactCTA label="Попробовать" onClick={handleAction} />
      </div>
      
      {/* Decorative Glow for Audio */}
      {isAudio && (
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-[80px]" />
      )}
    </div>
  );
}
