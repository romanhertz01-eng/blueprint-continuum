import { useNavigate } from '@tanstack/react-router';
import { Heart, FileText } from 'lucide-react';
import { PromptItem } from '@/data/prompts/types';
import { writePromptHandoff } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TextPromptCardProps {
  item: PromptItem;
}

export function TextPromptCard({ item }: TextPromptCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

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

  const gradientClass = useMemo(() => {
    const gradients = [
      'from-[#FF7E5F] to-[#FEB47B]', // закатное оранжево-розовое
      'from-[#6A11CB] to-[#2575FC]', // сине-фиолетовое
      'from-[#00B09B] to-[#96C93D]', // изумрудно-бирюзовое
      'from-[#D4145A] to-[#FBB03B]', // малиново-пурпурное
      'from-[#F2994A] to-[#F2C94C]', // охристо-золотое
      'from-[#2F80ED] to-[#56CCF2]', // ультрамарин с розовым (blue-cyan variant)
      'from-[#11998E] to-[#38EF7D]', // лаймово-зелёное
      'from-[#232526] to-[#414345]', // графитово-синее
    ];
    
    // Deterministic selection based on slug
    const charSum = item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charSum % gradients.length];
  }, [item.slug]);

  return (
    <div 
      onClick={handleAction}
      className="group relative w-full h-[300px] rounded-2xl bg-card border border-border p-5 flex flex-col items-center justify-between overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:border-primary/40"
    >
      {/* Верхняя строка */}
      <div className="w-full flex justify-between items-center z-10">
        <div className="w-[26px] h-[26px] rounded-full bg-muted flex items-center justify-center">
          <FileText className="w-[14px] h-[14px] text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Heart className="w-[13px] h-[13px]" />
          <span className="text-[12px] font-medium">{item.likes || 0}</span>
        </div>
      </div>

      {/* Круглая обложка */}
      <div className={cn(
        "relative mt-4 w-[108px] h-[108px] rounded-full bg-gradient-to-br transition-all duration-300 ease-out group-hover:opacity-0 group-hover:scale-90",
        gradientClass
      )} />

      {/* Описание и кнопка */}
      <div className="flex flex-col items-center w-full transition-all duration-300 ease-out group-hover:-translate-y-[124px]">
        <h3 className="text-[15px] font-medium text-foreground text-center leading-snug line-clamp-3 group-hover:line-clamp-5 mt-4 transition-all duration-300">
          {item.title}
        </h3>
        
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            className="bg-primary text-white h-10 px-6 rounded-full text-[14px] font-semibold whitespace-nowrap"
            onClick={handleAction}
          >
            Попробовать
          </button>
        </div>
      </div>
      
      {/* Статическая кнопка для "дна" контейнера в обычном состоянии - скрыта */}
      <div className="h-10 invisible" aria-hidden="true" />
    </div>
  );
}
