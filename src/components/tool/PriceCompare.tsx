import { Link } from "@tanstack/react-router";
import { Sparkles, X, Check, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceCompareProps {
  data: {
    heading: { main: string; sub: string };
    description: string;
    separateSubscriptions: {
      title: string;
      unit: string;
      items: { name: string; price: string }[];
      totalLabel: string;
      totalPrice: string;
    };
    eraEconomics: {
      title: string;
      price: string;
      priceFrom: string;
      items: string[];
      extra: string;
      footer: string;
      buttonText: string;
    };
    footerNote: string;
  };
  className?: string;
}

export function PriceCompare({ data, className }: PriceCompareProps) {
  return (
    <section className={cn("w-full bg-[#141110] py-20 text-[#F7EEE8] section-priceCompare", className)}>
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Left Column */}
          <div className="w-full md:w-[42%] flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-6">
              <Sparkles size={12} fill="currentColor" />
              ПРОЗРАЧНАЯ ЭКОНОМИЯ
            </div>
            
            <h2 className="text-3xl md:text-[40px] font-bold leading-[1.1] mb-6">
              {data.heading.main.split('\n').map((line, i) => (
                <span key={i} className={cn("block", i === 0 ? "text-white" : "text-[#8C7F78]")}>
                  {line}
                </span>
              ))}
              {data.heading.main.split('\n').length === 1 && (
                <>
                  <span className="block text-white">Зачем платить</span>
                  <span className="block text-[#8C7F78]">за каждый сервис?</span>
                </>
              )}
            </h2>

            <div className="w-12 h-0.5 bg-primary mb-6" />
            
            <p className="text-[#8C7F78] leading-relaxed max-w-sm">
              {data.description}
            </p>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[58%] flex flex-col gap-4 relative">
            {/* Upper Card: Separate Subscriptions */}
            <div className="bg-[#1A1817] border border-[#2D2420] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[11px] font-bold text-[#8C7F78] uppercase tracking-wider">
                  {data.separateSubscriptions.title}
                </span>
                <span className="text-[11px] text-[#8C7F78]">
                  {data.separateSubscriptions.unit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                {data.separateSubscriptions.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[#2D2420] pb-2">
                    <div className="flex items-center gap-2">
                      <X size={14} className="text-red-500/50" />
                      <span className="text-sm text-[#8C7F78]">{item.name}</span>
                    </div>
                    <span className="text-sm text-[#8C7F78] line-through decoration-red-500/40">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#2D2420] flex justify-between items-center">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {data.separateSubscriptions.totalLabel}
                </span>
                <span className="text-xl font-bold text-white line-through decoration-red-500/60">
                  {data.separateSubscriptions.totalPrice}
                </span>
              </div>
            </div>

            {/* Savings Badge */}
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-[11px] uppercase tracking-widest py-2">
              ДЕШЕВЛЕ В 8 РАЗ
              <ArrowDown size={14} />
            </div>

            {/* Lower Card: ERA2 */}
            <div className="bg-[#1A1817] border border-primary/40 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_40px_-15px_rgba(232,84,32,0.3)]">
              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 rounded-full gradient-accent text-white text-[11px] font-bold">
                  {data.eraEconomics.title}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-[#8C7F78]">{data.eraEconomics.priceFrom}</span>
                  <span className="text-3xl font-bold text-white">{data.eraEconomics.price}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4">
                {data.eraEconomics.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check size={14} className="text-primary" />
                    <span className="text-sm font-medium text-white">{item}</span>
                  </div>
                ))}
                <div className="col-span-2 flex items-center gap-2">
                  <Check size={14} className="text-primary" />
                  <span className="text-sm font-medium text-white">{data.eraEconomics.extra}</span>
                </div>
              </div>

              <div className="text-[11px] text-[#8C7F78] mb-6">
                {data.eraEconomics.footer}
              </div>

              <Link 
                to="/auth" 
                className="w-full py-4 rounded-xl bg-primary text-[#141110] font-bold text-center hover:opacity-90 transition-opacity"
              >
                {data.eraEconomics.buttonText}
              </Link>
            </div>

            <div className="text-[11px] text-[#8C7F78] text-right mt-2">
              {data.footerNote}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
}
