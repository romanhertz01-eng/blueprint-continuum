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
    <section className={cn("w-full bg-background py-16 text-foreground section-priceCompare", className)}>
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Outer Container Card */}
        <div className="bg-card border border-border rounded-[32px] p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Left Column */}
            <div className="w-full md:w-[44%] flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-primary/40 bg-transparent text-primary text-[11px] font-bold uppercase tracking-wider mb-6">
                <Sparkles size={12} className="text-primary" />
                ПРОЗРАЧНАЯ ЭКОНОМИЯ
              </div>
              
              <h2 className="text-3xl md:text-[38px] font-bold leading-[1.1] mb-6 tracking-tight">
                {data.heading.main.split('\n').map((line, i) => (
                  <span key={i} className={cn("block", i === 0 ? "text-foreground" : "text-muted-foreground")}>
                    {line}
                  </span>
                ))}
              </h2>

              <div className="w-12 h-0.5 bg-primary/60 mb-6" />
              
              <p className="text-muted-foreground leading-relaxed max-w-sm text-[15px]">
                {data.description}
              </p>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-[56%] flex flex-col gap-4 relative">
              {/* Upper Card: Separate Subscriptions */}
              <div className="bg-[#141110] border border-border rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {data.separateSubscriptions.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {data.separateSubscriptions.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-10 gap-y-[14px] mb-6">
                  {data.separateSubscriptions.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <X size={14} className="text-[#F5463D] stroke-[1.5]" />
                        <span className="text-[15px] text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-[15px] text-muted-foreground line-through decoration-[#F5463D] decoration-1">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-[18px] font-bold text-foreground uppercase tracking-wider">
                    {data.separateSubscriptions.totalLabel}
                  </span>
                  <span className="text-[18px] font-bold text-white line-through decoration-[#F5463D] decoration-2">
                    {data.separateSubscriptions.totalPrice}
                  </span>
                </div>
              </div>

              {/* Savings Badge */}
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-[11px] uppercase tracking-widest py-1">
                ДЕШЕВЛЕ В 8 РАЗ
                <ArrowDown size={14} />
              </div>

              {/* Lower Card: ERA2 */}
              <div className="bg-[#141110] border border-primary/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-primary bg-transparent text-primary text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles size={12} />
                    {data.eraEconomics.title}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground">{data.eraEconomics.priceFrom}</span>
                    <span className="text-[40px] font-bold text-primary leading-none tracking-tight">{data.eraEconomics.price}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-[14px] gap-x-8 mb-6">
                  {data.eraEconomics.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check size={14} className="text-primary" />
                      <span className="text-[15px] font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center gap-2">
                    <Check size={14} className="text-primary" />
                    <span className="text-[15px] font-medium text-foreground">{data.eraEconomics.extra}</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground mb-8">
                  {data.eraEconomics.footer}
                </div>

                <Link 
                  to="/auth" 
                  className="flex items-center justify-center w-full h-[52px] rounded-[12px] bg-primary text-primary-foreground font-bold text-center hover:opacity-90 transition-all shadow-[0_8px_20px_-8px_rgba(232,84,32,0.4)]"
                >
                  {data.eraEconomics.buttonText}
                </Link>
              </div>

              <div className="text-[11px] text-muted-foreground text-right mt-2">
                {data.footerNote}
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
