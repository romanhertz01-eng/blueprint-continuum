import { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CopyPromptButtonProps {
  text: string;
  className?: string;
  variant?: "ghost" | "secondary" | "outline";
  children?: React.ReactNode;
}

export function CopyPromptButton({ text, className, variant = "ghost", children }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleCopy}
      className={cn(
        "h-9 px-3 text-[13px] font-medium transition-all active:scale-95",
        variant === "ghost" && "bg-muted/30 hover:bg-muted/50 border border-border text-foreground",
        className
      )}
      aria-label={copied ? "Скопировано" : "Скопировать промпт"}
      title={copied ? "Скопировано" : "Скопировать"}
    >
      {children ? children : (
        copied ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Скопировано
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            Копировать
          </>
        )
      )}
    </Button>
  );
}
