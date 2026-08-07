import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface ArticlesGridProps {
  heading: string;
  sub?: string;
  items: {
    title: string;
    tag: string;
    image: string;
    href?: string;
    date?: string;
  }[];
  moreHref?: string;
  moreLabel?: string;
}

export const ArticlesGrid = ({
  heading,
  sub,
  items,
  moreHref,
  moreLabel = "Все статьи",
}: ArticlesGridProps) => {
  // Only show the first 3 items
  const displayedItems = items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <section className="max-w-[1360px] mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-[28px] font-bold text-center">{heading}</h2>
      {sub && (
        <p className="mt-3 text-muted-foreground text-center max-w-2xl mx-auto">
          {sub}
        </p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-3 items-start">
        {displayedItems.map((item, i) => {
          const content = (
            <article className="group cursor-pointer">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/60 backdrop-blur-sm text-white/90">
                  {item.tag}
                </div>
              </div>
              <h3 className="mt-4 font-semibold text-[15px] leading-snug line-clamp-2 min-h-[44px]">
                {item.title}
              </h3>
            </article>
          );

          if (item.href) {
            return (
              <Link key={i} to={item.href as any} className="block transition-colors hover:border-primary/40">
                {content}
              </Link>
            );
          }

          return (
            <div key={i} className="cursor-default">
              {content}
            </div>
          );
        })}
      </div>

      {(moreHref || hasMore) && (
        <div className="mt-10 flex justify-center">
          {moreHref ? (
            <Link
              to={moreHref as any}
              className="h-11 px-7 rounded-full border border-border text-sm font-medium hover:bg-muted/60 transition-colors flex items-center justify-center"
            >
              {moreLabel}
            </Link>
          ) : (
            <button
              disabled
              className="h-11 px-7 rounded-full border border-border text-sm font-medium opacity-50 cursor-default flex items-center justify-center"
            >
              {moreLabel}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
