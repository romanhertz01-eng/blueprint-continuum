import { useNavigate } from '@tanstack/react-router';
import { Heart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromptItem } from '@/data/prompts/types';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

interface BaseCardProps {
  item: PromptItem;
}

/**
 * PHASE A: New informative prompt card.
 * Replaces colored variants with a clean, light, information-dense layout.
 */
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
      agentId: item.category === 'agents' ? item.slug : undefined,
      sourceSlug: item.slug,
    });
    const targetRoute = CATEGORY_ROUTE[item.category as keyof typeof CATEGORY_ROUTE] || '/prompts';
    if (isAuthed) navigate({ to: targetRoute });
    else window.location.href = buildAuthHref(targetRoute);
  };

  return (
    <div 
      onClick={handleAction}
      className={cn(
        "group relative flex flex-col justify-between min-h-[230px] p-5 rounded-2xl border border-border bg-card",
        "transition-all duration-200 cursor-pointer hover:border-primary/40 hover:-translate-y-0.5 shadow-sm"
      )}
    >
      {/* Top Row: Provider Badge and Likes */}
      <div className="flex items-center justify-between mb-4">
        {item.providerId ? (
          <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-muted/50 border border-border/60 text-foreground">
            {item.providerId.replace('-', ' ')}
          </span>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Heart className="w-[14px] h-[14px]" />
          <span className="text-[11px] font-bold">{item.likes || 0}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow space-y-2">
        <h3 className="text-[17px] font-bold text-foreground leading-[1.3] line-clamp-2">
          {item.title}
        </h3>
        
        {item.promptRu && (
          <p className="text-[14px] italic text-muted-foreground line-clamp-3 leading-relaxed">
            "{item.promptRu}"
          </p>
        )}
      </div>

      {/* Bottom Row: Editor and CTA */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
            {/* Using a placeholder or generic avatar as data doesn't have author images yet */}
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary/70">
              E
            </div>
          </div>
          <span className="text-[13px] text-muted-foreground">@editor</span>
        </div>
        
        <button 
          className="text-primary font-bold text-[14px] flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          Попробовать <ExternalLink className="w-[14px] h-[14px]" />
        </button>
      </div>
    </div>
  );
}

// Keeping the other exports for now to avoid breaking imports elsewhere if they exist, 
// though they are no longer used by CatalogCard in Phase A.
export function ImagePromptCard({ item }: BaseCardProps) {
  return <LightPromptCard item={item} />;
}

export function SoftPromptCard({ item }: BaseCardProps) {
  return <LightPromptCard item={item} />;
}
