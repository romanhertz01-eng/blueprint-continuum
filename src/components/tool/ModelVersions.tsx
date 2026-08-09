import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ModelVersion {
  name: string;
  visualLabel?: string;
  desc: string;
  isDefault?: boolean;
}

interface ModelVersionsProps {
  heading: string;
  sub?: string;
  versions: ModelVersion[];
  className?: string;
}

export function ModelVersions({ heading, sub, versions, className }: ModelVersionsProps) {
  if (!versions?.length) return null;

  const scrollToWorkspace = () => {
    const workspace = document.querySelector('.section-hero');
    if (workspace) {
      workspace.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper to get number of active segments based on model name/version
  const getPowerLevel = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('luna')) return 1;
    if (n.includes('5.2')) return 2;
    if (n.includes('5.4')) return 3;
    if (n.includes('sol')) return 4;
    return 2; // default
  };

  return (
    <section className={cn("max-w-[1360px] mx-auto px-4 py-14 md:py-20", className)}>
      {heading && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-[32px] font-bold text-center md:text-left">{heading}</h2>
          {sub && (
            <p className="mt-3 text-sm text-muted-foreground text-center md:text-left max-w-2xl mx-auto md:mx-0">{sub}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {versions.map((v) => {
          const powerLevel = getPowerLevel(v.name);
          
          return (
            <div
              key={v.name}
              className={cn(
                "group relative rounded-2xl border transition-all flex flex-col bg-card h-full",
                v.isDefault 
                  ? "border-primary shadow-[0_0_20px_rgba(232,84,32,0.1)]" 
                  : "border-border hover:border-primary/30"
              )}
            >
              {v.isDefault && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1 rounded-full bg-primary text-[11px] font-black text-white uppercase tracking-[0.05em] shadow-lg whitespace-nowrap">
                  ОСНОВНАЯ
                </span>
              )}
...
              {/* Top Visual Zone (55% height) */}
              <div className="relative h-[200px] bg-[#141110] flex flex-col items-center justify-center overflow-hidden rounded-t-[15px]">
                {/* Visual Label (Main Display) */}
                <div className="flex flex-col items-center z-10 w-full px-4">
                  <span 
                    className="text-white font-black tracking-tight uppercase text-center"
                    style={{ 
                      fontSize: v.visualLabel && v.visualLabel.length > 7 ? 'clamp(20px, 8cqw, 28px)' : 'clamp(24px, 10cqw, 34px)',
                      width: '100%',
                      display: 'block'
                    }}
                  >
                    {v.visualLabel}
                  </span>
                </div>

                {/* Power Scale Indicator */}
                <div className="mt-8 flex gap-1 z-10">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step}
                      className={cn(
                        "h-[2px] w-8 rounded-full transition-all duration-500",
                        step <= powerLevel 
                          ? "bg-primary shadow-[0_0_8px_rgba(232,84,32,0.8)]" 
                          : "bg-white/10"
                      )}
                    />
                  ))}
                </div>

                {/* Soft glow from bottom */}
                <div 
                  className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[200%] h-[150px] rounded-[100%] blur-[60px] pointer-events-none"
                  style={{ 
                    background: `radial-gradient(circle, rgba(232,84,32,${0.15 + (powerLevel * 0.05)}) 0%, transparent 70%)` 
                  }}
                />
              </div>

              {/* Bottom Text Zone */}
              <div className="p-6 flex flex-col flex-grow bg-card">
                <h3 className="font-bold text-xl mb-3 text-foreground tracking-tight">{v.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-6 min-h-[40px]">
                  {v.desc}
                </p>

                <button 
                  onClick={scrollToWorkspace}
                  className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors group/btn"
                >
                  Попробовать
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ModelVersions;

