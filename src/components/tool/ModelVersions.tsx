import { cn } from "@/lib/utils";

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
              "relative p-5 rounded-2xl border transition-all",
              v.isDefault 
                ? "bg-primary/[0.03] border-primary/30 shadow-[0_0_20px_rgba(232,84,32,0.05)]" 
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            )}
          >
            {v.isDefault && (
              <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-wider">
                Основная
              </span>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{v.name}</h3>
              <div className="text-right">
                <div className="text-primary font-bold">{v.price}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{v.role}</div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {v.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ModelVersions;
