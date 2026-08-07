import { Infinity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelVersion {
  name: string;
  role: string;
  price: string;
  desc: string;
  unlimited?: string;
  isDefault?: boolean;
}

interface ModelVersionsProps {
  heading: string;
  sub?: string;
  versions: ModelVersion[];
}

export function ModelVersions({ heading, sub, versions }: ModelVersionsProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }[versions.length] || "md:grid-cols-3";

  return (
    <section className="max-w-[1360px] mx-auto px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl md:text-[32px] font-bold mb-4">{heading}</h2>
        {sub && <p className="text-muted-foreground max-w-2xl mx-auto">{sub}</p>}
      </div>

      <div className={cn("mt-12 grid gap-5", gridCols)}>
        {versions.map((version, i) => (
          <div
            key={i}
            className={cn(
              "relative rounded-2xl border bg-card p-6 flex flex-col transition-all",
              version.isDefault 
                ? "border-primary/50 shadow-sm" 
                : "border-border"
            )}
          >
            {version.isDefault && (
              <div className="absolute top-4 right-4 text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wider">
                ОСНОВНАЯ
              </div>
            )}
            
            <h3 className="font-semibold text-lg">{version.name}</h3>
            <div className="text-sm text-muted-foreground mt-1">{version.role}</div>
            
            <div className="text-2xl font-bold mt-4 text-primary">
              {version.price}
            </div>
            
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {version.desc}
            </p>
            
            {version.unlimited && (
              <div className="mt-auto pt-4 flex items-center gap-2 text-sm">
                <Infinity size={16} className="text-primary" />
                <span>{version.unlimited}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
