import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

interface EditorialBannerProps {
  label: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref?: string;
  bgSrc: string;
}

export function EditorialBanner({ label, title, subtitle, ctaLabel, ctaHref, bgSrc }: EditorialBannerProps) {
  return (
    <section className={cn(
      "col-span-full w-full h-[320px] md:h-[380px] rounded-[28px] overflow-hidden relative mb-8 group",
      ctaHref && "cursor-pointer"
    )}>
      {ctaHref ? (
        <Link to={ctaHref as any} className="absolute inset-0 z-0">
          {/* Background Image */}
          <img 
            src={bgSrc} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          {/* Overlay - Gradient for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </Link>
      ) : (
        <>
          {/* Background Image */}
          <img 
            src={bgSrc} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          {/* Overlay - Gradient for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </>
      )}
      
      {/* Content */}
      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between items-start pointer-events-none">
        {/* Chip Label */}
        <div className="px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-primary/30 pointer-events-auto">
          {label}
        </div>
        
        {/* Text Area */}
        <div className="max-w-xl pointer-events-auto">
          <h2 className="text-[32px] md:text-[42px] font-bold text-white leading-[1.1] mb-4 tracking-tight">
            {title}
          </h2>
          <p className="text-white/80 text-[15px] md:text-[17px] font-medium mb-8 max-w-md leading-relaxed">
            {subtitle}
          </p>
          
          {ctaHref && (
            <Link
              to={ctaHref as any}
              className="h-[52px] px-8 rounded-full bg-white text-black text-[15px] font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
