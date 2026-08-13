import { PromptItem, PromptTopic } from '@/data/prompts/types';
import { useNavigate } from '@tanstack/react-router';
import { Zap, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { writePromptHandoff } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

interface AudioPromptCardProps {
  item: PromptItem;
}

export function AudioPromptCard({ item }: AudioPromptCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const getGradient = (slug: string) => {
    const gradients = [
      'from-slate-800 to-slate-900',
      'from-zinc-800 to-zinc-900',
      'from-neutral-800 to-neutral-900',
    ];
    const index = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  const getLabelColor = (slug: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
    const index = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const handleAction = () => {
    writePromptHandoff({
      prompt: item.promptRu,
      category: 'audio',
      providerId: item.providerId,
      subModelId: item.subModelId,
      sourceSlug: item.slug
    });

    const target = '/audio';
    if (isAuthed) {
      navigate({ to: target });
    } else {
      window.location.href = buildAuthHref(target);
    }
  };

  return (
    <div 
      onClick={handleAction}
      className="group relative w-full aspect-[3/4] rounded-[20px] border border-border bg-card overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col"
    >
      {/* ПРЕВЬЮ: ВИНИЛ */}
      <div className={cn("relative flex-grow flex items-center justify-center overflow-hidden transition-all duration-300", getGradient(item.slug))}>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm text-white/90 text-[11px] font-medium">
          <Heart className="w-3 h-3" /> {item.likes}
        </div>
        
        {/* CSS ВИНИЛ */}
        <div className="w-[60%] aspect-square rounded-full bg-zinc-950 border-[8px] border-zinc-900 relative shadow-2xl transition-transform duration-1000 group-hover:rotate-[360deg] ease-linear">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-[15%] rounded-full border border-white/10" />
          <div className="absolute inset-[30%] rounded-full border border-white/10" />
          
          {/* Лейбл */}
          <div className={cn("absolute inset-[35%] rounded-full flex items-center justify-center", getLabelColor(item.slug))}>
            <div className="w-2 h-2 rounded-full bg-black/20" />
          </div>
        </div>
      </div>

      {/* ПОД ПЛАСТИНКОЙ */}
      <div className="p-4 flex flex-col">
        <h3 className="text-[14px] font-bold leading-snug line-clamp-2 mb-1.5">{item.title}</h3>
        <p className="text-[12px] text-muted-foreground mb-4">
          {item.params?.duration ? `${item.params.duration} · ` : ''}{item.providerId}
        </p>
        <button className="w-full h-9 rounded-xl bg-primary text-white text-[12px] font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 shadow-sm">
          Попробовать <Zap className="w-3 h-3 fill-current" />
        </button>
      </div>
    </div>
  );
}
