import { cn } from "@/lib/utils";

interface AudioItem {
  title?: string;
  duration?: string;
  meta?: string;
  text?: string;
  src?: string;
  // Legacy fields if any
  image?: string;
  audio?: string;
  label?: string;
  prompt?: string;
}

interface Props {
  heading: string;
  sub?: string;
  textLabel?: string;
  items: AudioItem[];
  className?: string;
}

export function AudioShowreel({ heading, sub, textLabel = "Озвученный текст", items, className }: Props) {
  return (
    <section className={cn("max-w-4xl mx-auto px-4 py-14 md:py-20", className)}>
      {heading && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center md:text-left">{heading}</h2>
          {sub && (
            <p className="mt-3 text-sm text-muted-foreground text-center md:text-left max-w-2xl mx-auto md:mx-0">
              {sub}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-white/[0.03] flex items-center justify-center border border-white/5">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">{it.duration || "0:30"}</span>
               </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                {it.title || textLabel}
              </span>
              <p className="text-sm text-white/90 leading-snug line-clamp-2">
                {it.text || it.label || it.prompt}
              </p>
              {it.meta && <span className="text-[11px] text-white/30">{it.meta}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AudioShowreel;
