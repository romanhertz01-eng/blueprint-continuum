import { Link } from '@tanstack/react-router';
import { PromptCategoryDef } from '@/data/prompts/types';

interface CategoryTileProps {
  category: PromptCategoryDef;
  count: number;
  imageSrc: string | null;
}

export function CategoryTile({ category, count, imageSrc }: CategoryTileProps) {
  const isAvailable = count > 0;

  if (!isAvailable) {
    return (
      <div className="h-[180px] md:h-[240px] rounded-[16px] overflow-hidden bg-muted/40 border border-border p-5 relative flex flex-col justify-end">
        <div className="absolute top-5 right-5 bg-muted text-muted-foreground text-[12px] px-3 py-1 rounded-full font-medium">
          Скоро
        </div>
        <div>
          <h3 className="text-[26px] font-bold text-muted-foreground leading-tight mb-1">
            {category.cardTitle}
          </h3>
          <p className="text-[14px] text-muted-foreground line-clamp-2 leading-snug">
            {category.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/prompts/$topic"
      params={{ topic: category.slug }}
      className="group h-[180px] md:h-[240px] rounded-[16px] overflow-hidden relative flex flex-col justify-end p-5"
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={category.cardTitle}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
      
      <div className="absolute top-5 right-5 bg-white text-black text-[13px] px-3 py-1 rounded-full font-bold">
        {count} {getPromptWord(count)}
      </div>

      <div className="relative z-10">
        <h3 className="text-[26px] font-bold text-white leading-tight mb-1">
          {category.cardTitle}
        </h3>
        <p className="text-[14px] text-white/70 line-clamp-2 leading-snug">
          {category.description}
        </p>
      </div>
    </Link>
  );
}

function getPromptWord(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'промптов';
  if (lastDigit === 1) return 'промпт';
  if (lastDigit >= 2 && lastDigit <= 4) return 'промпта';
  return 'промптов';
}
