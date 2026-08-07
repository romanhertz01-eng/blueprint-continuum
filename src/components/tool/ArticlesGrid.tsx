import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
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
  return (
    <section className="max-w-[1360px] mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-[32px] font-bold text-center">{heading}</h2>
      {sub && (
        <p className="mt-4 text-muted-foreground text-center max-w-2xl mx-auto">
          {sub}
        </p>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((item, i) => {
          const Content = (
            <div className={cn(
              "rounded-2xl overflow-hidden border border-border bg-card h-full flex flex-col transition-colors",
              item.href && "hover:border-primary/40"
            )}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                  {item.tag}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-base leading-snug line-clamp-2">
                  {item.title}
                </h3>
                {item.date && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-13" />
                    <span>{item.date}</span>
                  </div>
                )}
              </div>
            </div>
          );

          if (item.href) {
            return (
              <Link key={i} to={item.href as any}>
                {Content}
              </Link>
            );
          }

          return <div key={i} className="cursor-default">{Content}</div>;
        })}
      </div>

      {moreHref && (
        <div className="mt-10 flex justify-center">
          <Link
            to={moreHref as any}
            className="h-11 px-7 rounded-full border border-border text-sm font-medium hover:bg-muted/60 transition-colors flex items-center justify-center"
          >
            {moreLabel}
          </Link>
        </div>
      )}
    </section>
  );
};
