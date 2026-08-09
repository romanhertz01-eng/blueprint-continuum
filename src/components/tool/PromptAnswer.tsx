import { useState } from "react";
import { cn } from "@/lib/utils";

type Item = {
  label?: string;
  version?: string;
  prompt: string;
  answer: string;
};

type Props = {
  heading: string;
  sub?: string;
  items: Item[];
  className?: string;
};

export function PromptAnswer({ heading, sub, items, className }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!items?.length) return null;
  const active = items[activeIdx] ?? items[0];

  return (
    <section className={cn("max-w-5xl mx-auto px-4 py-14 md:py-20", className)}>
      {heading && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-[32px] font-bold text-center md:text-left">{heading}</h2>
          {sub && (
            <p className="mt-3 text-sm text-muted-foreground text-center md:text-left">{sub}</p>
          )}
        </div>
      )}

      {items.length > 1 ? (
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((it, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 border border-primary/40 text-foreground"
                    : "border border-border text-muted-foreground hover:bg-muted/60",
                )}
              >
                {it.label ?? `Пример ${i + 1}`}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className={cn("grid gap-6 lg:grid-cols-[38fr_62fr] items-start", items.length > 1 && "mt-10 md:mt-16")}>
        {/* ЗАПРОС - без карточки */}
        <div className="flex flex-col">
          <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-3">
            Запрос
          </div>
          <div className="text-[18px] leading-[1.5] text-foreground font-normal whitespace-pre-line">
            {active.prompt}
          </div>
        </div>

        {/* ОТВЕТ - карточка */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground">
              Ответ
            </div>
            {active.version ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary text-white font-bold uppercase tracking-wider">
                {active.version}
              </span>
            ) : null}
          </div>
          <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
            {active.answer}
          </div>
        </div>
      </div>
    </section>
  );
}