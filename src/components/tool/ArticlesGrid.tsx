import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface ArticleItem {
  image: string;
  tag: string;
  title: string;
  slug?: string;
  href?: string;
  date?: string;
}

interface ArticlesGridProps {
  heading: string;
  sub?: string;
  items: ArticleItem[];
  moreHref?: string;
  moreLabel?: string;
  className?: string;
}

export function ArticlesGrid({ 
  heading, 
  sub, 
  items, 
  moreHref, 
  moreLabel = "Все статьи",
  className
}: ArticlesGridProps) {
  if (!items?.length) return null;

  const shownItems = items.slice(0, 3);
  const showMore = items.length > 3;

  return (
    <section className={cn("max-w-[1360px] mx-auto px-4 py-14 md:py-20", className)}>
      {heading && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-[28px] font-bold text-center md:text-left">{heading}</h2>
          {sub && (
            <p className="mt-3 text-sm text-muted-foreground text-center md:text-left max-w-2xl mx-auto md:mx-0">
              {sub}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {shownItems.map((item) => (
          <Link
            key={item.slug || item.title}
            to="/studios"
            search={{ q: "" }}
            className="group block"
          >
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
                {item.tag}
              </div>
            </div>
            <h3 className="text-base md:text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[44px]">
              {item.title}
            </h3>
          </Link>
        ))}
      </div>

      {showMore && (
        <div className="mt-8 flex justify-center md:justify-start">
          <Link
            to="/studios"
            search={{ q: "" }}
            className={cn(
              "px-6 py-2.5 rounded-full border border-white/10 text-sm font-semibold hover:bg-white/[0.05] transition-colors",
              !moreHref && "opacity-50 cursor-not-allowed"
            )}
          >
            {moreLabel}
          </Link>
        </div>
      )}
    </section>
  );
}

export default ArticlesGrid;
