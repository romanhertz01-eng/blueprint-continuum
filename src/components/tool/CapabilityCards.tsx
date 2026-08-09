import React from 'react';
import { cn } from "@/lib/utils";

interface MockupProps {
  type: 'tasks' | 'documents' | 'multi' | 'files';
}

const Mockup = ({ type }: MockupProps) => {
  if (type === 'tasks') {
    return (
      <div className="relative w-[92%] h-[92%] flex items-center justify-center p-0 group-hover:scale-[1.05] transition-transform duration-500">
        {/* Answer card (Right/Front) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] bg-white rounded-xl shadow-xl border border-black/5 p-4 z-20 rotate-2">
          <div className="flex items-center gap-2 mb-2 border-b border-black/5 pb-2">
            <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center text-[10px] font-bold text-white">Э</div>
            <span className="text-[10px] font-bold tracking-tight">ЭРА2</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-black/10 rounded-full" />
            <div className="h-1.5 w-[90%] bg-black/10 rounded-full" />
            <div className="h-3 w-[60%] bg-primary/20 rounded flex items-center px-1 text-[8px] font-mono text-primary">x = (-b ± √D) / 2a</div>
            <div className="h-1.5 w-full bg-black/10 rounded-full" />
          </div>
        </div>
        {/* Source card (Left/Back) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[85%] bg-white/80 rounded-xl shadow-lg border border-black/5 p-4 z-10 -rotate-3 blur-[0.5px]">
          <div className="space-y-2">
            <div className="h-2 w-1/2 bg-black/20 rounded-full" />
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-black/10 rounded-full" />
              <div className="h-1.5 w-full bg-black/10 rounded-full" />
              <div className="h-1.5 w-3/4 bg-black/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'documents') {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-0 group-hover:scale-[1.05] transition-transform duration-500">
        {/* Answer card (Right/Front) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] bg-white rounded-xl shadow-xl border border-black/5 p-4 z-20 rotate-1">
          <div className="flex items-center gap-2 mb-2 border-b border-black/5 pb-2">
            <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center text-[10px] font-bold text-white">Э</div>
            <span className="text-[10px] font-bold tracking-tight">ЭРА2</span>
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-1.5 items-center">
                <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                <div className="h-1.5 w-full bg-black/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        {/* PDF plate (Left/Back) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[85%] bg-[#F2EDE7] rounded-xl shadow-lg border border-black/5 p-4 z-10 -rotate-6">
          <div className="bg-red-500/10 text-red-600 font-bold text-[10px] px-1.5 py-0.5 rounded inline-block mb-2">PDF</div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-black/10 rounded-full" />
            <div className="h-1.5 w-2/3 bg-black/10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'multi') {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-0 gap-2">
        {/* Prompt plate */}
        <div className="w-[90%] bg-[#1A1817] rounded-lg p-2.5 shadow-lg border border-white/5 z-30">
          <div className="h-1.5 w-full bg-white/20 rounded-full mb-1" />
          <div className="h-1.5 w-2/3 bg-white/20 rounded-full" />
        </div>
        {/* AI Cards Stack */}
        <div className="relative w-full flex-1 mt-1">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[90%] bg-white rounded-lg shadow-md border border-black/5 p-2 z-20 scale-100">
            <div className="text-[7px] font-bold text-black/40 mb-1 uppercase tracking-wider">ChatGPT</div>
            <div className="space-y-1">
              <div className="h-1 w-full bg-black/5 rounded-full" />
              <div className="h-1 w-full bg-black/5 rounded-full" />
              <div className="h-1 w-2/3 bg-black/5 rounded-full" />
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[90%] bg-white rounded-lg shadow-md border border-black/5 p-2 z-15 scale-95 rotate-1">
            <div className="text-[7px] font-bold text-black/40 mb-1 uppercase tracking-wider">Gemini</div>
            <div className="space-y-1">
              <div className="h-1 w-full bg-black/5 rounded-full" />
              <div className="h-1 w-full bg-black/5 rounded-full" />
              <div className="h-1 w-1/2 bg-black/5 rounded-full" />
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-8 w-[90%] bg-white rounded-lg shadow-md border border-black/5 p-2 z-10 scale-90 -rotate-1">
            <div className="text-[7px] font-bold text-black/40 mb-1 uppercase tracking-wider">Claude</div>
            <div className="space-y-1">
              <div className="h-1 w-full bg-black/5 rounded-full" />
              <div className="h-1 w-full bg-black/5 rounded-full" />
              <div className="h-1 w-3/4 bg-black/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'files') {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-0 group-hover:scale-[1.05] transition-transform duration-500">
        {/* Answer card */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] bg-white rounded-xl shadow-xl border border-black/5 p-4 z-20 rotate-2">
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-black/10 rounded-full" />
            <div className="h-1.5 w-full bg-black/10 rounded-full" />
            <div className="h-1.5 w-3/4 bg-black/10 rounded-full" />
          </div>
        </div>
        {/* Image plate */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[80%] aspect-square bg-[#EDE8E2] rounded-xl shadow-lg border border-black/5 p-2 z-10 -rotate-6 flex items-center justify-center">
          <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/20">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

interface CapabilityCardsProps {
  heading: string;
  sub?: string;
  cards: {
    title: string;
    desc: string;
    mockupType?: 'tasks' | 'documents' | 'multi' | 'files';
  }[];
  className?: string;
}

export function CapabilityCards({ heading, sub, cards, className }: CapabilityCardsProps) {

  if (!cards?.length) return null;

  return (
    <section className={cn("max-w-[1360px] mx-auto px-4 py-14 md:py-20", className)}>
      <div className="grid lg:grid-cols-[28%_72%] gap-12 lg:gap-16 items-start">
        {/* Left Column */}
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-[40px] font-bold leading-[1.1] mb-6 whitespace-pre-line">
            {heading}
          </h2>
          {sub && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {sub}
            </p>
          )}
        </div>

        {/* Right Column */}
        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <article 
              key={i}
              className="bg-[#F7F3EF] rounded-[20px] p-[24px] flex flex-col items-center text-center group overflow-hidden"
            >
              <h3 className="text-xl font-bold mb-[14px]">{card.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-snug mb-[14px]">
                {card.desc}
              </p>
              
              <div className="w-full h-[170px] md:h-[200px] mb-[14px] relative overflow-hidden flex items-center justify-center">
                {card.mockupType && <Mockup type={card.mockupType} />}
              </div>

              <button 
                onClick={() => document.getElementById('prompt-bar')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-0 px-8 py-2.5 bg-white border border-black/5 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Попробовать
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CapabilityCards;
