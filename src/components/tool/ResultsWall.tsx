import React from 'react';
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ResultCard {
  prompt: string;
  answer: string;
}

interface ResultsWallProps {
  heading: string;
  items: ResultCard[];
  className?: string;
}

export function ResultsWall({ heading, items, className }: ResultsWallProps) {
  if (!items?.length) return null;

  return (
    <section className={cn("max-w-[1360px] mx-auto px-4 py-14 md:py-20", className)}>
      {heading && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-[32px] font-bold text-center md:text-left">{heading}</h2>
        </div>
      )}

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map((item, i) => (
          <ResultCard key={i} item={item} />
        ))}
      </div>
    </section>
  );
}

function ResultCard({ item }: { item: ResultCard }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    toast.success("Скопировано");
    setTimeout(() => setCopied(false), 2000);
  };

  const isCode = item.answer.includes('```') || item.answer.includes('def ') || item.answer.includes('import ');

  return (
    <div className="break-inside-avoid relative group bg-card border border-border rounded-2xl p-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="font-mono text-[12px] text-muted-foreground uppercase tracking-wider line-clamp-2">
          {item.prompt}
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 p-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Копировать промпт"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative overflow-hidden max-h-[400px]">
        <div className={cn(
          "text-[15px] leading-relaxed prose prose-sm dark:prose-invert max-w-none",
          "prose-p:my-2 prose-headings:mb-3 prose-headings:mt-4 prose-ul:my-2 prose-li:my-1",
          isCode && "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-xl"
        )}>
          {item.answer.split('\n').map((line, idx) => {
             if (line.trim().startsWith('|')) return <div key={idx} className="font-mono text-[13px] bg-muted/50 p-1">{line}</div>;
             if (line.startsWith('```')) return null;
             return <p key={idx}>{line}</p>;
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
