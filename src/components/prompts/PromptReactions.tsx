import { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, Eye, Check } from 'lucide-react';
import { PromptItem } from '@/data/prompts/types';
import { cn } from '@/lib/utils';

interface PromptReactionsProps {
  item: PromptItem;
}

export function PromptReactions({ item }: PromptReactionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [localViews, setLocalViews] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Likes
      const likes = JSON.parse(localStorage.getItem('era2_prompt_likes') || '[]');
      setIsLiked(likes.includes(item.slug));

      // Saves
      const saves = JSON.parse(localStorage.getItem('era2_prompt_saves') || '[]');
      setIsSaved(saves.includes(item.slug));

      // Views
      const viewsMap = JSON.parse(localStorage.getItem('era2_prompt_views') || '{}');
      if (!viewsMap[item.slug]) {
        viewsMap[item.slug] = 1;
        localStorage.setItem('era2_prompt_views', JSON.stringify(viewsMap));
      } else {
        // We don't increment, just read what was there to show consistent state for this visitor
        // But the task says "show item.views + saved". 
        // If it's the first time, saved is 1. If not, it's 1. 
        // Actually "increment by 1" means we track if they saw it.
      }
      setLocalViews(viewsMap[item.slug] || 0);
    } catch (e) {
      console.error('Error reading from localStorage', e);
    }
  }, [item.slug]);

  const toggleLike = () => {
    if (typeof window === 'undefined') return;
    try {
      const likes = JSON.parse(localStorage.getItem('era2_prompt_likes') || '[]');
      let newLikes;
      if (isLiked) {
        newLikes = likes.filter((s: string) => s !== item.slug);
      } else {
        newLikes = [...likes, item.slug];
      }
      localStorage.setItem('era2_prompt_likes', JSON.stringify(newLikes));
      setIsLiked(!isLiked);
    } catch (e) {
      console.error('Error updating likes', e);
    }
  };

  const toggleSave = () => {
    if (typeof window === 'undefined') return;
    try {
      const saves = JSON.parse(localStorage.getItem('era2_prompt_saves') || '[]');
      let newSaves;
      if (isSaved) {
        newSaves = saves.filter((s: string) => s !== item.slug);
      } else {
        newSaves = [...saves, item.slug];
      }
      localStorage.setItem('era2_prompt_saves', JSON.stringify(newSaves));
      setIsSaved(!isSaved);
    } catch (e) {
      console.error('Error updating saves', e);
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    try {
      navigator.clipboard.writeText(window.location.href);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } catch (e) {
      console.error('Error sharing', e);
    }
  };

  const buttonClass = "h-9 px-3.5 flex items-center gap-2 rounded-full border border-border bg-card text-[13px] transition-colors hover:bg-muted/50";
  const activeClass = "bg-primary/10 border-[hsl(var(--primary))] text-primary hover:bg-primary/20";

  return (
    <div className="flex flex-wrap gap-2 mt-5">
      <button 
        onClick={toggleLike}
        className={cn(buttonClass, isLiked && activeClass)}
      >
        <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        <span>{item.likes + (isLiked ? 1 : 0)}</span>
      </button>

      <button 
        onClick={toggleSave}
        className={cn(buttonClass, isSaved && activeClass)}
      >
        <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
        <span>{item.saves + (isSaved ? 1 : 0)}</span>
      </button>

      <button 
        onClick={handleShare}
        className={buttonClass}
      >
        {isShared ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
        <span>{isShared ? 'Скопировано' : item.shares}</span>
      </button>

      <div className={cn(buttonClass, "hover:bg-card cursor-default")}>
        <Eye className="w-4 h-4" />
        <span>{item.views + localViews}</span>
      </div>
    </div>
  );
}
