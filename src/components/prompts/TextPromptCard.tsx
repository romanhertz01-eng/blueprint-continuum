import { useNavigate } from '@tanstack/react-router';
import { Heart, Zap } from 'lucide-react';
import { PromptItem } from '@/data/prompts/types';
import { writePromptHandoff } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';
import { cn } from '@/lib/utils';

interface TextPromptCardProps {
  item: PromptItem;
}

export function TextPromptCard({ item }: TextPromptCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  // Детерминированный градиент на основе слага (только токены темы, мягкие оттенки)
  const getGradient = (slug: string) => {
    const gradients = [
      'from-blue-500/10 to-indigo-500/10',
      'from-emerald-500/10 to-teal-500/10',
      'from-orange-500/10 to-rose-500/10',
      'from-purple-500/10 to-fuchsia-500/10',
      'from-amber-500/10 to-yellow-500/10',
    ];
    const index = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    writePromptHandoff({
      prompt: item.promptRu,
      category: 'text',
      providerId: item.providerId,
      subModelId: item.subModelId,
      sourceSlug: item.slug
    });

    const target = '/text';
    if (isAuthed) {
      navigate({ to: target });
    } else {
      window.location.href = buildAuthHref(target);
    }
  };

  return (
    <div 
      onClick={handleAction}
      className="group relative w-full aspect-[3/4] rounded-2xl border border-border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 flex flex-col bg-card"
    >
      {/* Плашка с градиентом */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br transition-opacity duration-300 group-hover:opacity-80",
        getGradient(item.slug)
      )} />

      {/* Контент поверх плашки */}
      <div className="relative z-10 p-5 flex flex-col h-full">
        {/* Счётчик лайков сверху */}
        <div className="flex justify-end">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 text-[12px] font-medium text-foreground">
            <Heart className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{item.likes}</span>
          </div>
        </div>

        {/* Название по центру */}
        <div className="flex-grow flex items-center justify-center text-center px-2">
          <h3 className="text-[15px] md:text-[16px] font-medium text-foreground leading-snug line-clamp-4">
            {item.title}
          </h3>
        </div>

        {/* Кнопка внизу */}
        <div className="mt-auto">
          <button 
            className="w-full h-10 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 group-hover:brightness-110"
          >
            Попробовать
            <Zap className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}


