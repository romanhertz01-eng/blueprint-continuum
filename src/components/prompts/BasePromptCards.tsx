import { useNavigate, Link } from '@tanstack/react-router';
import { Heart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromptItem } from '@/data/prompts/types';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

interface BaseCardProps {
  item: PromptItem;
}

const CardHeader = ({ item }: { item: PromptItem }) => (
  <div className="flex items-center justify-between mb-4">
    <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-muted/50 border border-border/60 text-foreground">
      {item.providerId.replace('-', ' ')}
    </span>
    <div className="flex items-center gap-1 text-muted-foreground">
      <Heart className="w-3.5 h-3.5" />
      <span className="text-[14px]">{item.likes || 0}</span>
    </div>
  </div>
);

const CardFooter = ({ item, onAction }: { item: PromptItem; onAction: (e: React.MouseEvent) => void }) => (
  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[10px] font-bold text-primary/60">
          E
        </div>
      </div>
      <span className="text-[13px] text-muted-foreground">@editor</span>
    </div>
    <button 
      onClick={onAction}
      className="flex items-center gap-1.5 text-primary font-bold text-[14px] hover:opacity-80 transition-opacity"
    >
      Попробовать
      <ExternalLink className="w-3.5 h-3.5" />
    </button>
  </div>
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

  return (
    <Link 
      to="/prompts/$topic/$slug"
      params={{ topic: item.topicSlug, slug: item.slug }}
      className="group relative flex flex-col min-h-[230px] p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer justify-between"
    >
      <div>
        <CardHeader item={item} />
        <h3 className="text-[17px] font-bold text-foreground leading-[1.3] line-clamp-2 mb-2">
          {item.title}
        </h3>
        <p className="text-[14px] text-muted-foreground italic line-clamp-3 leading-relaxed">
          &ldquo;{item.promptRu}&rdquo;
        </p>
      </div>

      <CardFooter item={item} onAction={handleAction} />
    </Link>
  );
}

export function ImagePromptCard({ item }: BaseCardProps) {
  return <LightPromptCard item={item} />;
}

export function SoftPromptCard({ item }: BaseCardProps) {
  return <LightPromptCard item={item} />;
}

