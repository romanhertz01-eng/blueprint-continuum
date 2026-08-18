import { useState, useEffect, useRef, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon, Video, Music, Bot, FileText, Loader2, Newspaper } from "lucide-react";
import { promptTopics } from "@/data/prompts/topics";
import { agentTopics } from "@/data/prompts/agentTopics";
import { PromptCategory } from "@/data/prompts/types";
import { ArticleEditor } from "@/components/community/ArticleEditor";

type PostType = 'text' | 'image' | 'video' | 'audio' | 'agent' | 'article';


export const Route = createFileRoute("/community_/new")({
  component: () => (
    <RequireAuth>
      <NewPostPage />
    </RequireAuth>
  ),
});

function NewPostPage() {
  return <NewPostContent />;
}

function NewPostContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [type, setType] = useState<PostType>('image');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  
  // Article specific states
  const [excerpt, setExcerpt] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [cover, setCover] = useState<{ file: File; preview: string } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isArticle = type === 'article';


  // Filter categories based on selected type
  const availableTopics = useMemo(() => {
    return type === 'agent' 
      ? agentTopics 
      : promptTopics.filter(t => t.category === type as PromptCategory);
  }, [type]);

  useEffect(() => {
    // Reset category when type changes
    setCategory('');
  }, [type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 3) {
      toast.error("Можно загрузить не более 3 файлов");
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`Файл ${file.name} слишком большой (макс. 50 МБ)`);
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error(`Файл ${file.name} слишком большой (макс. 50 МБ)`);
      if (coverInputRef.current) coverInputRef.current.value = '';
      return;
    }

    if (cover) {
      URL.revokeObjectURL(cover.preview);
    }

    setCover({
      file,
      preview: URL.createObjectURL(file)
    });
  };

  const removeCover = () => {
    if (cover) {
      URL.revokeObjectURL(cover.preview);
      setCover(null);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isArticle) {
      const getCleanLength = (html: string) => {
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim().length;
      };

      if (!title.trim() || !excerpt.trim() || getCleanLength(bodyText) === 0) {
        toast.error('Заполните заголовок, краткое описание и текст статьи');
        return;
      }
    } else {
      if (!title.trim() || !prompt.trim()) {
        toast.error("Заполните обязательные поля");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let coverUrl = null;
      let bodyHtml = null;
      const uploadedMedia = [];

      if (isArticle) {
        // Upload cover if exists
        if (cover) {
          const fileExt = cover.file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, cover.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);
          
          coverUrl = publicUrl;
        }

        // bodyText already contains HTML
        bodyHtml = bodyText;

        const { error: insertError } = await supabase
          .from('posts')
          .insert({
            author_id: user.id,
            type: 'article',
            title,
            prompt_ru: null,
            provider_id: null,
            category_slug: null,
            media: [],
            excerpt,
            cover_url: coverUrl,
            body_html: bodyHtml,
            status: 'pending',
            params: {}
          });

        if (insertError) throw insertError;
        
        toast.success('Статья отправлена на проверку, она появится в ленте после модерации');
      } else {
        // Handle existing logic for other types
        for (const item of files) {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, item.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);

          uploadedMedia.push({
            url: publicUrl,
            type: item.file.type.startsWith('image') ? 'image' : 
                  item.file.type.startsWith('video') ? 'video' : 'audio'
          });
        }

        const { error: insertError } = await supabase
          .from('posts')
          .insert({
            author_id: user.id,
            type,
            title,
            prompt_ru: prompt,
            provider_id: model,
            category_slug: category,
            media: uploadedMedia,
            status: 'pending',
            params: {}
          });

        if (insertError) throw insertError;
        toast.success("Промпт отправлен на проверку, он появится в ленте после модерации");
      }

      navigate({ to: '/account' });
    } catch (err: any) {
      console.error("Error creating post:", err);
      toast.error(`Ошибка при сохранении: ${err.message || 'попробуйте позже'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions: { value: PostType; label: string; icon: any }[] = [
    { value: 'text', label: 'Текст', icon: FileText },
    { value: 'image', label: 'Изображение', icon: ImageIcon },
    { value: 'video', label: 'Видео', icon: Video },
    { value: 'audio', label: 'Аудио', icon: Music },
    { value: 'agent', label: 'Агент', icon: Bot },
    { value: 'article', label: 'Статья', icon: Newspaper },
  ];


  return (
    <div className="container max-w-[720px] mx-auto py-12 px-6">
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">

        <h1 className="text-2xl font-bold mb-8">{isArticle ? 'Написать статью' : 'Добавить промпт'}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Chips */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Тип публикации</label>

            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${type === opt.value 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'}
                  `}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="title" className="text-sm font-medium">Заголовок *</label>
              <span className={`text-xs ${title.length > 120 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {title.length}/120
              </span>
            </div>
            <Input
              id="title"
              placeholder="О чем этот промпт?"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 150))} // Small buffer for UX
              required
              maxLength={120}
              className="rounded-xl"
            />
          </div>

          {!isArticle && (
            <>
              {/* Prompt Body */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="prompt" className="text-sm font-medium">Промпт *</label>
                  <span className={`text-xs ${prompt.length > 4000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {prompt.length}/4000
                  </span>
                </div>
                <Textarea
                  id="prompt"
                  placeholder="Введите текст промпта..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  maxLength={4000}
                  className="min-h-[160px] rounded-xl resize-none"
                />
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium">Модель</label>
                <Input
                  id="model"
                  placeholder="Например: Kling AI, ChatGPT"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Категория</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Выберите категорию...</option>
                  {availableTopics.map((topic: any) => (
                    <option key={topic.slug} value={topic.slug}>
                      {topic.cardTitle}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {isArticle && (
            <>
              {/* Cover Block */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Обложка</label>
                <input 
                  type="file" 
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  className="hidden" 
                  accept="image/*"
                />
                
                {!cover ? (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Загрузить обложку</span>
                  </button>
                ) : (
                  <div className="relative">
                    <img 
                      src={cover.preview} 
                      alt="" 
                      className="w-full aspect-[16/9] object-cover rounded-2xl" 
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Excerpt Block */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="excerpt" className="text-sm font-medium text-muted-foreground">Краткое описание</label>
                  <span className={`text-xs ${excerpt.length > 200 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {excerpt.length}/200
                  </span>
                </div>
                <Textarea
                  id="excerpt"
                  placeholder="О чём эта статья в двух предложениях"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="rounded-xl resize-none"
                />
                <p className="text-xs text-muted-foreground">Показывается в ленте под заголовком</p>
              </div>

              {/* Body Text Block */}
              <div className="space-y-2">
                <label htmlFor="bodyText" className="text-sm font-medium text-muted-foreground">Текст статьи</label>
                <ArticleEditor 
                  value={bodyText} 
                  onChange={setBodyText} 
                  userId={user.id} 
                />
                <p className="text-xs text-muted-foreground">Выделите текст, чтобы применить форматирование</p>
              </div>
            </>
          )}

          {/* File Upload Zone */}
          {!isArticle && type !== 'text' && (

            <div className="space-y-3">
              <label className="text-sm font-medium">Файлы (до 3 шт, макс 50 МБ)</label>
              
              {/* Dropzone */}
              {files.length < 3 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Нажмите для загрузки или перетащите</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, MP4, MP3 и др.</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    multiple
                    accept={
                      type === 'image' ? 'image/*' : 
                      type === 'video' ? 'video/*' : 
                      type === 'audio' ? 'audio/*' : '*'
                    }
                  />
                </div>
              )}

              {/* Previews */}
              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-secondary">
                      {file.file.type.startsWith('image') ? (
                        <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {file.file.type.startsWith('video') ? <Video className="h-8 w-8 text-muted-foreground" /> : <Music className="h-8 w-8 text-muted-foreground" />}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              className="flex-1 rounded-xl h-11 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Публикация...
                </>
              ) : (
                isArticle ? 'Отправить статью' : 'Опубликовать'

              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-xl h-11"
              onClick={() => navigate({ to: '/account' })}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


