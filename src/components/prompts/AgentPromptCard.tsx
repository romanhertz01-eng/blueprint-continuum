import { useNavigate } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromptItem } from '@/data/prompts/types';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

interface AgentPromptCardProps {
  item: PromptItem;
}

export function AgentPromptCard({ item }: AgentPromptCardProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  // Dynamic icon selection from lucide-react
  const IconComponent = (LucideIcons as any)[item.agentIcon || 'MessageSquare'] || LucideIcons.MessageSquare;

  // Saturated but soft background for the icon based on slug hash
  const getIconBg = (slug: string) => {
    const hues = [210, 260, 280, 310, 340, 15, 40];
    const charSum = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hues[charSum % hues.length];
    return {
      background: `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${hue + 20}, 80%, 50%))`
    };
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    writePromptHandoff({
      prompt: item.promptRu,
      category: 'agents',
      providerId: item.providerId,
      subModelId: item.subModelId,
      agentId: item.slug,
      sourceSlug: item.slug,
    });

    const targetRoute = CATEGORY_ROUTE.agents;
    if (isAuthed) {
      navigate({ to: targetRoute });
    } else {
      window.location.href = buildAuthHref(targetRoute);
    }
  };

  return (
    <div 
      onClick={handleAction}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-all cursor-pointer",
        "hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 active:scale-[0.98]"
      )}
    >
      {/* Avatar / Icon */}
      <div 
        className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white shadow-inner"
        style={getIconBg(item.slug)}
      >
        <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0 pr-6">
        <h3 className="text-[15px] md:text-[16px] font-semibold text-foreground leading-tight truncate">
          {item.title}
        </h3>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mt-0.5">
          {item.agentRole}
        </p>
      </div>

      {/* Like / Stats */}
      <div className="absolute top-4 right-4 flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
        <Heart className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold">{item.likes}</span>
      </div>
    </div>
  );
}
