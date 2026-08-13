import { useNavigate } from '@tanstack/react-router';
import { Heart, Zap, Sparkles } from 'lucide-react';
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

  // Детерминированное определение стиля (темный/насыщенный или светлый)
  const charSum = item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isLight = charSum % 4 === 0; // Каждая 4-я карточка светлая для ритма
  
  // Насыщенные градиенты из палитры (только токены или чистые цвета)
  const getGradient = (slug: string) => {
    const saturatedGradients = [
      'from-[#4F46E5] to-[#3730A3]', // Indigo
      'from-[#7C3AED] to-[#5B21B6]', // Violet
      'from-[#EC4899] to-[#BE185D]', // Pink
      'from-[#059669] to-[#047857]', // Emerald
      'from-[#EA580C] to-[#C2410C]', // Orange
      'from-[#2563EB] to-[#1E40AF]', // Blue
    ];
    const index = charSum % saturatedGradients.length;
    return saturatedGradients[index];
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
      className={cn(
        "group relative w-full h-[380px] rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col",
        isLight ? "bg-card border border-border" : "border-none"
      )}
    >
      {/* Фон на всю карточку */}
      {!isLight && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110",
          getGradient(item.slug)
        )} />
      )}
      
      {/* Затемнение/оверлей для глубины на темных карточках */}
      {!isLight && (
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      )}

      {/* Контент */}
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* ВЕРХ: Глиф и Лайк */}
        <div className="flex justify-between items-center mb-4">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md",
            isLight ? "bg-muted/50 text-foreground" : "bg-white/10 text-white"
          )}>
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-[13px] font-bold",
            isLight ? "bg-muted/50 text-foreground" : "bg-white/10 text-white"
          )}>
            <Heart className={cn("w-3.5 h-3.5", !isLight && "fill-white")} />
            <span>{item.likes}</span>
          </div>
        </div>

        {/* НИЖНЯЯ ТРЕТЬ: Название и Кнопка */}
        <div className="mt-auto">
          <h3 className={cn(
            "text-[16px] font-medium leading-snug line-clamp-3 mb-4 transition-colors",
            isLight ? "text-foreground" : "text-white group-hover:text-white/90"
          )}>
            {item.title}
          </h3>

          <button 
            className={cn(
              "h-10 px-6 rounded-full text-[13px] font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95",
              isLight 
                ? "bg-primary text-white hover:brightness-110" 
                : "bg-white text-primary hover:bg-white/90"
            )}
          >
            Попробовать
            <Zap className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}



