import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

interface RelatedModel {
  name: string;
  desc: string;
  price: string;
  href: string;
  image?: string;
  tileConfig?: {
    gradient: string;
  };
}

interface RelatedTextModelsProps {
  heading: string;
  sub: string;
  description: string;
  models: RelatedModel[];
  className?: string;
}

function ModelTile({ model }: { model: RelatedModel }) {
  const [imgError, setImgError] = useState(false);

  const content = (
    <div className="relative w-full h-full overflow-hidden group">
      {/* Background */}
      {model.image && !imgError ? (
        <img
          src={model.image}
          alt={model.name}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
          style={{ background: model.tileConfig?.gradient || "#333" }}
        />
      )}
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Text Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          <h4 className="text-white text-xl md:text-2xl font-bold tracking-tight">
            {model.name}
          </h4>
          <p className="text-white/70 text-[11px] md:text-[12px] leading-[1.3] max-w-[90%] font-medium">
            {model.desc}
          </p>
        </div>

        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold">
            от {model.price}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Link
      to={model.href as any}
      className="block relative aspect-[4/3] rounded-[14px] overflow-hidden border border-white/10"
    >
      {content}
    </Link>
  );
}

export function RelatedTextModels({ heading, sub, description, models, className }: RelatedTextModelsProps) {
  return (
    <section className={cn("max-w-[1360px] mx-auto px-4 py-14 md:py-20 section-relatedTextModels", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-10 lg:gap-16 items-start">
        {/* Left Column */}
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-white/90">Один сервис</span>
          </div>
          
          <h2 className="text-3xl md:text-[42px] font-bold leading-[1.1] tracking-tight mb-5">
            {heading}
            <br />
            <span className="text-muted-foreground">{sub}</span>
          </h2>
          
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 max-w-[320px]">
            {description}
          </p>
          
          <Link 
            to="/ai/text" 
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white hover:text-black transition-all duration-300"
          >
            Смотреть все модели →
          </Link>
        </div>

        {/* Right Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {models.map((model) => (
            <ModelTile key={model.name} model={model} />
          ))}
        </div>
      </div>
    </section>
  );
}
