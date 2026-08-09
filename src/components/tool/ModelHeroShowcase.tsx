import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Poster {
  src: string;
  alt: string;
}

interface ModelHeroShowcaseProps {
  heading: string;
  subheading: string;
  buttonText: string;
  posters: Poster[];
  className?: string;
}

const PosterItem = ({ poster, className }: { poster: Poster; className?: string }) => {
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-[12px] overflow-hidden bg-[#EAE2DC] border border-[#CFC2B4] flex flex-col",
        className
      )}
    >
      {!error ? (
        <img
          src={poster.src}
          alt={poster.alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4 text-center">
          <span className="text-[10px] md:text-xs text-[#8E8277] font-medium leading-tight">
            {poster.alt}
          </span>
        </div>
      )}
    </div>
  );
};

export const ModelHeroShowcase = ({
  heading,
  subheading,
  buttonText,
  posters,
  className,
}: ModelHeroShowcaseProps) => {
  return (
    <section className={cn("max-w-[1360px] mx-auto px-4 py-8 section-modelHeroShowcase", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3">
        {/* Left Column */}
        <div className="bg-[#0E0C0C] rounded-[16px] p-8 flex flex-col items-center text-center relative overflow-hidden min-h-[400px] lg:min-h-0 border border-white/5">
          <div className="relative z-10 flex flex-col items-center h-full">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mb-6">
              НОВАЯ МОДЕЛЬ
            </span>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4 whitespace-pre-line">
              {heading}
            </h2>
            
            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-[240px]">
              {subheading}
            </p>
            
            <Button 
              className="bg-white hover:bg-white/90 text-black rounded-full px-6 py-2 h-auto text-sm font-semibold flex items-center gap-2 group"
            >
              {buttonText}
              <Star className="w-3.5 h-3.5 fill-black group-hover:scale-110 transition-transform" />
            </Button>

            {/* Logo area */}
            <div className="mt-auto pt-12 relative w-full flex justify-center">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
              <svg 
                viewBox="0 0 24 24" 
                className="w-16 h-16 text-white/10 fill-current relative z-10"
                aria-hidden="true"
              >
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9108 6.0462 6.0462 0 0 0-4.7443-3.2518 5.9517 5.9517 0 0 0-5.6923 2.231 5.9785 5.9785 0 0 0-5.1828-2.6372 6.0457 6.0457 0 0 0-4.6611 3.3703 5.9793 5.9793 0 0 0 2.2158 7.5225 5.9773 5.9773 0 0 0 .5153 4.9108 6.0462 6.0462 0 0 0 4.7443 3.2518 5.9517 5.9517 0 0 0 5.6923-2.231 5.9785 5.9785 0 0 0 5.1828 2.6372 6.0457 6.0457 0 0 0 4.6611-3.3703 5.9815 5.9815 0 0 0-2.2158-7.5225zm-9.5428 12.88a4.9564 4.9564 0 0 1-2.5773-.7154l.041-.0237 5.3887-3.1133a.8561.8561 0 0 0 .429-.7421V11.272l2.13 1.23a.0747.0747 0 0 1 .0376.0647v6.1487a4.9458 4.9458 0 0 1-5.449 4.9857zm-9.4774-3.393a4.9581 4.9581 0 0 1-.1928-2.6689l.041.0237 5.3887 3.1133a.8561.8561 0 0 0 .858 0l5.3475-3.0869v2.4598a.0747.0747 0 0 1-.0376.0647l-5.3259 3.0746a4.9541 4.9541 0 0 1-6.0789-3.0304zm-1.5365-9.4829a4.9517 4.9517 0 0 1 2.3845-1.9535l.041.0237 5.3887 3.1133a.8561.8561 0 0 0 .429.7421v6.1735l-2.13-1.23a.0747.0747 0 0 1-.0376-.0647V8.5925a4.9441 4.9441 0 0 1 4.0728-6.7573zm12.058 1.4823l-5.3887-3.1133a.8561.8561 0 0 0-.429-.7421V4.8912a.0747.0747 0 0 1 .0376-.0647l5.3259-3.0746a4.9541 4.9541 0 0 1 6.0789 3.0304 4.9541 4.9541 0 0 1 .1928 2.6689l-.041-.0237-5.3887-3.1133a.8561.8561 0 0 0-.858 0L9.8212 7.3011V4.8412a.0747.0747 0 0 1 .0376-.0647l5.3259-3.0746a4.9576 4.9576 0 0 1 5.5451 1.0927l-5.3512 3.089a.8561.8561 0 0 0-.429.7421v6.1735l-5.3475-3.0869a.8561.8561 0 0 0-.858 0L6.6112 11.023v-2.46a.0747.0747 0 0 1 .0376-.0647l5.3259-3.0746a4.9576 4.9576 0 0 1 5.5451 1.0927zm3.1743 12.6454a4.9517 4.9517 0 0 1-2.3845 1.9535l-.041-.0237-5.3887-3.1133a.8561.8561 0 0 0-.429-.7421V7.126l2.13 1.23a.0747.0747 0 0 1 .0376.0647v6.1487a4.9441 4.9441 0 0 1-4.0728 6.7573zm1.5365-9.4829a4.9581 4.9581 0 0 1 .1928 2.6689l-.041-.0237-5.3887-3.1133a.8561.8561 0 0 0-.858 0l-5.3475 3.0869V11.272a.0747.0747 0 0 1 .0376-.0647l5.3259-3.0746a4.9541 4.9541 0 0 1 6.0789 3.0304zM12.058 12.8242l-2.13 1.23a.0747.0747 0 0 1-.0376-.0647V11.52l2.13-1.23a.0747.0747 0 0 1 .0376.0647l2.13 1.23a.0747.0747 0 0 1 .0376.0647l2.13 1.23a.0747.0747 0 0 1 .0376.0647v2.4598a.0747.0747 0 0 1-.0376.0647l-2.13 1.23a.0747.0747 0 0 1-.0376-.0647z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column - Strict Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-6 gap-3 min-h-[500px] lg:min-h-0">
          {/* Column 1: Big (4), Small (2) */}
          <div className="lg:contents sm:contents flex flex-col gap-3 lg:col-start-1">
            {posters[0] && <PosterItem poster={posters[0]} className="lg:row-span-4 sm:row-span-4 min-h-[200px]" />}
            {posters[1] && <PosterItem poster={posters[1]} className="lg:row-span-2 sm:row-span-2 min-h-[100px]" />}
          </div>
          
          {/* Column 2: Small (2), Big (4) */}
          <div className="lg:contents sm:contents flex flex-col gap-3 lg:col-start-2">
            {posters[2] && <PosterItem poster={posters[2]} className="lg:row-span-2 sm:row-span-2 min-h-[100px]" />}
            {posters[3] && <PosterItem poster={posters[3]} className="lg:row-span-4 sm:row-span-4 min-h-[200px]" />}
          </div>
          
          {/* Column 3: Big (4), Small (2) */}
          <div className="lg:contents sm:contents flex flex-col gap-3 lg:col-start-3">
            {posters[4] && <PosterItem poster={posters[4]} className="lg:row-span-4 sm:row-span-4 min-h-[200px]" />}
            {posters[5] && <PosterItem poster={posters[5]} className="lg:row-span-2 sm:row-span-2 min-h-[100px]" />}
          </div>
          
          {/* Column 4: Small (2), Big (4) */}
          <div className="lg:contents sm:contents flex flex-col gap-3 lg:col-start-4">
            {posters[6] && <PosterItem poster={posters[6]} className="lg:row-span-2 sm:row-span-2 min-h-[100px]" />}
            {posters[7] && <PosterItem poster={posters[7]} className="lg:row-span-4 sm:row-span-4 min-h-[200px]" />}
          </div>
        </div>
      </div>
    </section>
  );
};
