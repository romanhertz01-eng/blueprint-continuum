import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { promptTopics } from "@/data/prompts/topics";
import { PromptCategory } from "@/data/prompts/types";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    prompt: string;
    model: string;
    subModel?: string;
    type: "text" | "image" | "video" | "audio";
    params?: any;
    mediaUrl?: string;
  };
}

export function PublishModal({ open, onOpenChange, initialData }: PublishModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState(initialData.prompt);
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setPrompt(initialData.prompt);
      setCategory("");
      setError(null);
    }
  }, [open, initialData.prompt]);

  const availableTopics = promptTopics.filter(
    (t) => t.category === initialData.type as PromptCategory
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      toast.error("Заголовок обязателен");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedMedia: any[] = [];

      // Handle media upload if there's a URL
      if (initialData.mediaUrl) {
        try {
          const response = await fetch(initialData.mediaUrl);
          const blob = await response.blob();
          
          const fileExt = initialData.mediaUrl.split('.').pop()?.split('?')[0] || 
                         (initialData.type === 'image' ? 'png' : initialData.type === 'video' ? 'mp4' : 'mp3');
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, blob);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('posts')
              .getPublicUrl(filePath);

            uploadedMedia.push({
              url: publicUrl,
              type: initialData.type
            });
          }
        } catch (fetchErr) {
          console.error("Failed to fetch/upload media:", fetchErr);
          // Continue anyway as per requirements: "поле media оставить пустым массивом и всё равно опубликовать промпт"
        }
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          type: initialData.type,
          title: title.trim(),
          prompt_ru: prompt,
          provider_id: initialData.model,
          sub_model_id: initialData.subModel || null,
          category_slug: category || null,
          media: uploadedMedia,
          status: 'pending',
          params: initialData.params || {}
        });

      if (insertError) throw insertError;

      toast.success("Отправлено на проверку — появится в сообществе после модерации", {
        action: {
          label: "В кабинет",
          onClick: () => window.location.href = "/account"
        }
      });
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error publishing post:", err);
      toast.error(`Ошибка: ${err.message || 'попробуйте позже'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Опубликовать в сообщество</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="pub-title">Заголовок *</Label>
              <span className="text-[10px] text-muted-foreground">{title.length}/120</span>
            </div>
            <Input
              id="pub-title"
              placeholder="Коротко о результате..."
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              required
              maxLength={120}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pub-prompt">Промпт</Label>
            <Textarea
              id="pub-prompt"
              placeholder="Текст промпта..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="rounded-xl min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Модель</Label>
              <div className="h-10 px-3 flex items-center rounded-xl border border-input bg-secondary/30 text-sm text-muted-foreground overflow-hidden whitespace-nowrap">
                {initialData.model} {initialData.subModel ? `· ${initialData.subModel}` : ''}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-category">Категория</Label>
              <select
                id="pub-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Без категории</option>
                {availableTopics.map((topic) => (
                  <option key={topic.slug} value={topic.slug}>
                    {topic.cardTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4 flex sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Публикация...
                </>
              ) : (
                "Опубликовать"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
