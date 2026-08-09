import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ModelVersion {
  name: string;
  price: string;
  role: string;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {versions.map((v) => (
          <div
            key={v.name}
            className={cn(
              "relative p-6 rounded-2xl border transition-all flex flex-col items-start bg-card",
              v.isDefault 
                ? "border-primary shadow-[0_0_20px_rgba(232,84,32,0.05)]" 
                : "border-border"
            )}
          >
            {v.isDefault && (
              <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-wider">
                ОСНОВНАЯ
              </span>
            )}
            
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {v.role}
            </div>
            
            <h3 className="font-bold text-xl mb-4 text-foreground">{v.name}</h3>
            
            <div className="mb-4">
              <div className="text-primary font-bold text-2xl leading-none">{v.price}</div>
              <div className="text-xs text-muted-foreground mt-1">за сообщение</div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-6 min-h-[40px]">
              {v.desc}
            </p>

            <button 
              onClick={scrollToWorkspace}
              className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors group"
            >
              Попробовать
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ModelVersions;
