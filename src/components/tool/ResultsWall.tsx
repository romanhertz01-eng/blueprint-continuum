import React from 'react';
import { cn } from "@/lib/utils";
import { Copy, Check, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ResultCardData {
  prompt: string;
  answer: string;
}

interface ResultsWallProps {
  heading: string;
  items: ResultCardData[];
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

function ResultCard({ item }: { item: ResultCardData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Strip HTML for copy if it was a table, but for now we just copy raw text
    // The requirement says "Copy button - icon in the top right corner"
    navigator.clipboard.writeText(item.answer);
    setCopied(true);
    toast.success("Ответ скопирован");
    setTimeout(() => setCopied(false), 2000);
  };

  const isTable = item.answer.includes('<table');

  return (
    <div className="break-inside-avoid relative group bg-[#141110] border border-[#2D2420] rounded-[14px] overflow-hidden transition-all duration-300 shadow-xl shadow-black/25 hover:shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D2420]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D2420]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D2420]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D2420]" />
        </div>
        
        <div className="text-[11px] font-medium text-[#8E8680] uppercase tracking-wider">
          GPT-5.6 · ЭРА2
        </div>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-[#2D2420] text-[#8E8680] hover:text-[#F7EEE8] transition-colors"
          title="Копировать ответ"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="p-5">
        {/* User Prompt Bubble */}
        <div className="inline-block bg-[#39180A] rounded-2xl px-4 py-2 mb-5">
          <div className="font-mono text-[12px] text-[#FF743D]">
            {item.prompt}
          </div>
        </div>

        {/* Model Answer */}
        <div className="relative overflow-hidden max-h-[420px]">
          <div className={cn(
            "text-[15px] leading-relaxed text-[#F7EEE8] prose-invert max-w-none",
            "prose-p:my-2 prose-headings:mb-3 prose-headings:mt-4 prose-ul:my-2 prose-li:my-1",
            "selection:bg-[#FF743D]/30"
          )}>
            {isTable ? (
              <div 
                className="my-4 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: item.answer }} 
              />
            ) : (
              item.answer.split('\n').map((line, idx) => {
                // Code block detection
                if (line.startsWith('```')) return null;
                
                // Very basic syntax highlighting for code logic (just coloring words)
                const isCodeLine = item.answer.includes('```') && (line.includes('def ') || line.includes('import ') || line.includes('return ') || line.includes('print('));
                
                if (isCodeLine) {
                  return (
                    <div key={idx} className="font-mono text-[13px] py-0.5 whitespace-pre">
                      {line.split(/(\s+)/).map((word, i) => {
                        if (['def', 'import', 'return', 'from', 'as'].includes(word)) return <span key={i} className="text-[#98C379]">{word}</span>;
                        if (['print', 'list', 'dict'].includes(word)) return <span key={i} className="text-[#61AFEF]">{word}</span>;
                        if (word.startsWith('#')) return <span key={i} className="text-[#5C6370] italic">{word}</span>;
                        if (word.match(/['"].*['"]/)) return <span key={i} className="text-[#D19A66]">{word}</span>;
                        return word;
                      })}
                    </div>
                  );
                }
                
                return <p key={idx}>{line}</p>;
              })
            )}
          </div>
          
          {/* Fade effect - color of the card background */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#141110] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}