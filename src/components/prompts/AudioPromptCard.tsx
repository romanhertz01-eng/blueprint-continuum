import { PromptItem } from '@/data/prompts/types';
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

  const getAccentColor = (slug: string) => {
    // Палитра ERA2: мягкий фиолетово-сиреневый / тёплый синий / бирюза / коралл / мягкий оранжевый
    const colors = [
      'bg-[#A855F7]', // Purple
      'bg-[#3B82F6]', // Blue
      'bg-[#06B6D4]', // Cyan
      'bg-[#F43F5E]', // Rose/Coral
      'bg-[#F59E0B]', // Orange
    ];
    const index = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      className="group relative w-full aspect-[3/4.2] rounded-[24px] border border-border bg-card overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col shadow-sm"
    >
      {/* 1. ВЕРХ-ПРАВО: ЛАЙК В МАЛЕНЬКОЙ CAPSULE */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground/70 text-[11px] font-bold">
        <Heart className="w-3 h-3 transition-colors group-hover:text-rose-500" /> {item.likes}
      </div>
      
      {/* 2. ЦЕНТР: ЛЁГКИЙ AUDIO-VISUAL */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-muted/5">
        <div className="relative w-[45%] aspect-square flex items-center justify-center">
          {/* Тонкие полупрозрачные кольца (2-3 слоя) */}
          <div className="absolute inset-0 rounded-full border border-primary/10 animate-[pulse_3s_infinite]" />
          <div className="absolute inset-[15%] rounded-full border border-primary/5 animate-[pulse_4s_infinite]" />
          <div className="absolute inset-[-10%] rounded-full border border-primary/5 animate-[pulse_5s_infinite]" />
          
          {/* Нежный glow/свечение */}
          <div className={cn(
            "absolute inset-[20%] rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40",
            getAccentColor(item.slug)
          )} />

          {/* Мягкий круг/диск */}
          <div className="absolute inset-0 rounded-full bg-background border border-border/40 shadow-inner flex items-center justify-center overflow-hidden">
             {/* Progress-ring или waveform деталь */}
             <div className="absolute inset-[10%] rounded-full border-t-2 border-primary/20 animate-spin" style={{ animationDuration: '8s' }} />
             
             {/* Маленький цветной центр */}
             <div className={cn("w-4 h-4 rounded-full shadow-sm z-10", getAccentColor(item.slug))} />
             
             {/* Тонкие линии-насечки для характера */}
             <div className="absolute w-full h-[1px] bg-border/20 rotate-45" />
             <div className="absolute w-full h-[1px] bg-border/20 -rotate-45" />
          </div>
        </div>
      </div>

      {/* 3. ТЕКСТ И МЕТАДАННЫЕ */}
      <div className="px-5 pt-2 pb-5 flex flex-col">
        <h3 className="text-[17px] font-semibold leading-[1.3] line-clamp-2 mb-2 text-foreground h-[44px]">
          {item.title}
        </h3>
        <p className="text-[13px] text-muted-foreground font-medium mb-4">
          {item.params?.duration ? `${item.params.duration} · ` : ''}{item.providerId}
        </p>
        
        {/* 4. КОМПАКТНЫЙ CTA */}
        <button className="h-[42px] px-6 rounded-full bg-primary text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-95 shadow-md shadow-primary/10 w-fit">
          Попробовать <Zap className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>
    </div>
  );
}
