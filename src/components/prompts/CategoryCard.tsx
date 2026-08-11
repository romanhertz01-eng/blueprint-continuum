import { Link } from '@tanstack/react-router';
import { PromptCategoryDef } from '@/data/prompts/types';

interface CategoryCardProps {
  category: PromptCategoryDef;
  count: number;
}

export function CategoryCard({ category, count }: CategoryCardProps) {
  const isAvailable = count > 0;
  const content = (
    <div className={`h-full p-5 rounded-2xl border transition-all flex flex-col ${
      isAvailable 
        ? 'bg-card border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 group' 
        : 'bg-muted/30 border-border/50 opacity-60 cursor-default'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className={`font-bold text-lg leading-tight transition-colors ${isAvailable ? 'group-hover:text-primary' : 'text-muted-foreground'}`}>
          {category.cardTitle}
        </h3>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
          isAvailable ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {isAvailable ? `${count}` : 'скоро'}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {category.description}
      </p>
    </div>
  );

  if (isAvailable) {
    return (
      <Link 
        to="/prompts/$topic" 
        params={{ topic: category.slug }}
        className="block h-full"
      >
        {content}
      </Link>
    );
  }

  return content;
}
