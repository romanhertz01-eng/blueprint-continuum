import { PromptItem, PromptTopic } from '@/data/prompts/types';
import { useNavigate } from '@tanstack/react-router';
import { Heart, Zap, Play, Star, ExternalLink, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { writePromptHandoff } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';
import { textProviders } from '@/data/textModels';
import { imageProviders } from '@/data/imageModels';
import { videoProviders } from '@/data/videoModels';

function getModelName(providerId: string, category: string): string {
  if (category === 'text') return textProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'image') return imageProviders.find(p => p.id === providerId)?.name || providerId;
  if (category === 'video') return videoProviders.find(p => p.id === providerId)?.name || providerId;
  return providerId;
}

interface CardProps {
  item: PromptItem;
  className?: string;
  type: 'A' | 'B' | 'C' | 'D' | 'E';
}

export function EditorialPromptCard({ item, className, type }: CardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const modelName = getModelName(item.providerId, item.category);
  const media = item.media?.[0];

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.category === 'text' || type === 'E') {
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
    } else {
      navigate({ 
        to: "/prompts/$topic/$slug", 
        params: { topic: item.topicSlug, slug: item.slug } 
      });
    }
  };

  const commonCardStyles = "group relative overflow-hidden rounded-[20px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer border border-border bg-card";
  const padding = "p-4 md:p-5";

  // ТИП A — Обычный (span 3)
  if (type === 'A') {
    return (
      <div onClick={handleAction} className={cn(commonCardStyles, "flex flex-col h-full", className)}>
        {media?.src && item.category !== 'text' ? (
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={media.src} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              {item.category === 'video' && item.params?.aspect === '9:16' && (
                <div className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Вертикальное
                </div>
              )}
              <div className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[12px] font-medium flex items-center gap-1">
                <Heart className="w-3 h-3" /> {item.likes}
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-[4/3] bg-card flex items-center justify-center p-6 text-center">
             <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 text-muted-foreground text-[12px] font-medium">
              <Heart className="w-3 h-3" /> {item.likes}
            </div>
          </div>
        )}
        <div className={cn(padding, "flex flex-col flex-grow")}>
          <h3 className="text-[15px] font-bold leading-snug line-clamp-2 mb-1.5">{item.title}</h3>
          <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {item.body?.overview || item.promptRu}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-auto">
              {modelName}
            </div>
          </div>
          <button className="mt-4 h-9 px-4 rounded-xl bg-primary text-white text-[12px] font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 group-hover:shadow-md group-hover:shadow-primary/20">
            Попробовать <Zap className="w-3 h-3 fill-current" />
          </button>
        </div>
      </div>
    );
  }

  // ТИП B — Image-first (span 3)
  if (type === 'B') {
    return (
      <div onClick={handleAction} className={cn(commonCardStyles, "aspect-[3/4] md:aspect-auto md:h-[420px]", className)}>
        <img src={media?.src} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {item.category === 'video' && item.params?.aspect === '9:16' && (
            <div className="px-2 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              Вертикальное
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[12px] font-medium">
            <Heart className="w-3.5 h-3.5" /> {item.likes}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white overflow-hidden">
          <div className="mb-2 px-2 py-0.5 inline-block rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
            {modelName}
          </div>
          <h3 className="text-[17px] font-bold leading-snug line-clamp-2 mb-1 drop-shadow-sm">{item.title}</h3>
          <p className="text-[13px] text-white/70 line-clamp-2 mb-4 leading-relaxed drop-shadow-sm">{item.body?.overview}</p>
          <div className="flex items-center justify-between">
            <button className="h-10 px-5 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
              Попробовать <Zap className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ТИП C — Текстовый (span 2-3)
  if (type === 'C') {
    return (
      <div onClick={handleAction} className={cn(commonCardStyles, "bg-card border-dashed min-h-[180px] flex flex-col justify-between", className, padding)}>
        <div>
          <div className="flex justify-between items-start mb-3">
             <div className="px-2 py-0.5 rounded-md bg-background border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {modelName}
            </div>
            <div className="text-[12px] text-muted-foreground flex items-center gap-1">
              <Heart className="w-3 h-3" /> {item.likes}
            </div>
          </div>
          <h3 className="text-[16px] font-bold leading-tight mb-2">{item.title}</h3>
          <p className="text-[13px] text-muted-foreground line-clamp-3 italic">"{item.promptRu}"</p>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <button className="text-[12px] font-bold text-primary flex items-center gap-1 group-hover:underline">
            Попробовать <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // ТИП D — Большая подборка (span 4-6)
  if (type === 'D') {
    return (
      <div onClick={handleAction} className={cn(commonCardStyles, "h-[300px] md:h-[360px]", className)}>
        <img src={media?.src || "/community/05.jpg"} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-widest shadow-lg">
          ПОДБОРКА
        </div>
        <div className="absolute inset-y-0 left-0 w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-center text-white">
          <h3 className="text-[24px] md:text-[32px] font-black leading-tight mb-3 uppercase italic tracking-tight">
            {item.title}
          </h3>
          <p className="text-[14px] md:text-[16px] text-white/80 line-clamp-2 mb-6 max-w-sm">
            {item.body?.overview || "Лучшие проверенные сценарии от экспертов ERA2 для вашей продуктивности."}
          </p>
          <button className="w-fit h-11 px-7 rounded-xl bg-white text-black text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-primary hover:text-white group-hover:scale-105">
            Смотреть подборку <Star className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    );
  }

  // ТИП E — Мини-курс (span 6)
  if (type === 'E') {
    return (
      <div onClick={handleAction} className={cn(commonCardStyles, "h-[240px] md:h-[280px] bg-muted/20 border-primary/20", className)}>
        <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-orange-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg">
          МИНИ-КУРС
        </div>
        <div className="absolute inset-0 flex">
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
            <h3 className="text-[22px] md:text-[26px] font-bold leading-tight mb-2">
              Нейросети для работы и жизни
            </h3>
            <p className="text-[14px] text-muted-foreground mb-6">
              Научитесь писать промпты, которые экономят 10 часов в неделю.
            </p>
            <div className="flex gap-3 mb-6">
               <div className="px-2 py-1 rounded-lg bg-background border border-border text-[11px] font-medium text-muted-foreground">12 уроков</div>
               <div className="px-2 py-1 rounded-lg bg-background border border-border text-[11px] font-medium text-muted-foreground">Практика</div>
            </div>
            <button className="w-fit h-11 px-8 rounded-xl bg-primary text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110">
              Пройти курс <Play className="w-4 h-4 fill-current ml-1" />
            </button>
          </div>
          <div className="hidden md:flex w-1/2 items-center justify-center relative">
             <div className="w-40 h-40 rounded-full bg-primary/10 blur-3xl absolute animate-pulse" />
             <div className="text-[120px] select-none filter grayscale opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
               ⚡️
             </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
