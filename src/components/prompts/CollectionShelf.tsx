import { PromptItem } from '@/data/prompts/types';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionShelfProps {
  title: string;
  subtitle: string;
  items: PromptItem[];
  ctaHref?: string;
}

export function CollectionShelf({ title, subtitle, items, ctaHref }: CollectionShelfProps) {
  return (
    <section className="col-span-full w-full rounded-[28px] bg-muted/30 p-6 md:p-8 mb-8">
      <div className="flex items-start justify-between mb-8">
        <div className={cn(ctaHref && "group/shelf-header cursor-pointer")}>
          {ctaHref ? (
            <Link to={ctaHref as any} className="block">
              <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight mb-1 text-foreground group-hover/shelf-header:text-primary transition-colors">
                {title}
              </h2>
              <p className="text-[14px] md:text-[15px] text-muted-foreground font-medium">
                {subtitle}
              </p>
            </Link>
          ) : (
            <>
              <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight mb-1 text-foreground">
                {title}
              </h2>
              <p className="text-[14px] md:text-[15px] text-muted-foreground font-medium">
                {subtitle}
              </p>
            </>
          )}
        </div>
        {ctaHref && (
          <Link 
            to={ctaHref as any}
            className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-sm shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-2 -mx-2 px-2">
        {items.map((item, idx) => {
          const image = item.media?.[0]?.src || `/community/0${(idx % 8) + 1}.jpg`;
          
          return (
            <Link
              key={`${item.slug}-${idx}`}
              to="/prompts/$topic/$slug"
              params={{ topic: item.category, slug: item.slug }}
              className="flex-none w-[170px] md:w-[190px] aspect-[3/4] rounded-[22px] overflow-hidden relative group snap-start bg-card border border-border/50"
            >
              {/* Media Background */}
              {item.category === 'text' || item.category === 'audio' ? (
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
                  item.category === 'text' ? "from-indigo-500/20 to-purple-500/20" : "from-amber-500/20 to-orange-500/20"
                )} />
              ) : (
                <img 
                  src={image} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Like chip */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold flex items-center gap-1 z-10">
                <Heart className="w-2.5 h-2.5 fill-current" /> {item.likes}
              </div>

              {/* Title */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-white text-[13px] font-bold leading-tight line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </Link>
          );
        })}
        {/* Sneak peek element */}
        <div className="flex-none w-1" />
      </div>
    </section>
  );
}
