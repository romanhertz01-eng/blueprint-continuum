import { cn } from "@/lib/utils";

interface AudioItem {
  image: string;
  audio: string;
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
            <div className="aspect-square rounded-xl overflow-hidden bg-white/[0.03]">
              <img src={it.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                {textLabel}
              </span>
              <p className="text-sm text-white/90 leading-snug line-clamp-2">
                {it.label || it.prompt}
              </p>
              <div className="h-10 w-full bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-xs text-white/30">Player Placeholder</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AudioShowreel;
