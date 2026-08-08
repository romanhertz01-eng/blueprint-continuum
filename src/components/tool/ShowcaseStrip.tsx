import { cn } from "@/lib/utils";

interface ShowcaseStripProps {
  images: string[];
  className?: string;
}

export function ShowcaseStrip({ images, className }: ShowcaseStripProps) {
  if (!images.length) return null;
  return (
    <section className={cn("py-14 md:py-20", className)}>
      <div className="no-scrollbar flex gap-3 overflow-x-auto snap-x px-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="shrink-0 h-[220px] md:h-[300px] aspect-[3/4] rounded-xl overflow-hidden border border-white/10 snap-start"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              width={300}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ShowcaseStrip;