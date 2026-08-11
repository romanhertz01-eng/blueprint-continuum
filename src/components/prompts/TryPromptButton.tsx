import { useNavigate } from '@tanstack/react-router';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PromptItem } from '@/data/prompts/types';
import { writePromptHandoff, CATEGORY_ROUTE } from '@/lib/promptHandoff';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthHref } from '@/lib/authRedirect';

interface TryPromptButtonProps {
  item: PromptItem;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function TryPromptButton({ item, label = "Попробовать", className, children }: TryPromptButtonProps) {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const handleTry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Writing ALL fields covered by the handoff interface and read by page effects
    writePromptHandoff({
      prompt: item.promptRu,
      category: item.category,
      providerId: item.providerId,
      subModelId: item.subModelId,
      aspect: item.params?.aspect,
      quality: item.params?.quality,
      quantity: item.params?.quantity,
      duration: item.params?.duration,
      resolution: item.params?.resolution,
      sourceSlug: item.slug,
    });

    const targetRoute = CATEGORY_ROUTE[item.category];

    if (isAuthed) {
      navigate({ to: targetRoute });
    } else {
      // Guest logic: redirect to auth with 'next' pointing to the generator
      navigate({ to: buildAuthHref(targetRoute) });
    }
  };

  return (
    <Button
      onClick={handleTry}
      size="sm"
      className={cn(
        "h-9 px-4 text-[13px] font-semibold text-white transition-all active:scale-95",
        "bg-[hsl(var(--primary))] hover:brightness-110 border-none gradient-accent",
        className
      )}
    >
      {children ? children : (
        <>
          {label}
          <Zap className="w-3.5 h-3.5 ml-1.5 fill-current" />
        </>
      )}
    </Button>
  );
}
