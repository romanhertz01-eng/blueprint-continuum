import { useState, useEffect, useRef, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon, Video, Music, Bot, FileText, Loader2, Newspaper, Sparkles } from "lucide-react";
import { promptTopics } from "@/data/prompts/topics";
import { agentTopics } from "@/data/prompts/agentTopics";
import { PromptCategory } from "@/data/prompts/types";
import { ArticleEditor } from "@/components/community/ArticleEditor";
import { sanitizeArticleHtml } from "@/lib/sanitizeArticleHtml";
import { cn } from "@/lib/utils";

type PostType = 'text' | 'image' | 'video' | 'audio' | 'agent';
type PostKind = 'prompt' | 'article';

const articleCategories = [
  { slug: 'ai-news', cardTitle: 'Новости ИИ' },
  { slug: 'guides', cardTitle: 'Гайды и инструкции' },
  { slug: 'model-reviews', cardTitle: 'Обзоры моделей' },
  { slug: 'cases', cardTitle: 'Кейсы и опыт' },
];

export const Route = createFileRoute("/community_/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    type: typeof search.type === 'string' ? search.type : undefined as string | undefined,
    edit: typeof search.edit === 'string' ? search.edit : undefined as string | undefined,
  }),
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
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const { type: typeParam, edit: editParam } = Route.useSearch();
  const isEditMode = Boolean(editParam);
  const isAdmin = profile?.is_admin || false;
  
  const [kind, setKind] = useState<PostKind | null>(() => {
    if (typeParam === 'article') return 'article';
    if (['text', 'image', 'video', 'audio', 'agent'].includes(typeParam || '')) return 'prompt';
    return null;
  });

  const [type, setType] = useState<PostType>(() => {
    if (['text', 'image', 'video', 'audio', 'agent'].includes(typeParam || '')) return typeParam as PostType;
    return 'image';
  });

  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  
  // Article specific states
  const [excerpt, setExcerpt] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [cover, setCover] = useState<{ file: File; preview: string } | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const prefilledRef = useRef(false);

  // Load post for editing
  const { data: editingPost, isLoading: isPostLoading } = useQuery({
    queryKey: ['editing-post', editParam],
    enabled: isEditMode && !!editParam,
    queryFn: async () => {
      if (!editParam) return null;
      const { data, error } = await supabase
        .from('posts')
        .select('id, author_id, type, status, title, excerpt, cover_url, body_html, category_slug')
        .eq('id', editParam)
        .single();
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (!isEditMode || !editingPost || isAuthLoading) return;

    if (editingPost.type !== 'article') {
      toast.error('Пока можно редактировать только статьи');
      navigate({ to: '/account' });
      return;
    }
    
    if (editingPost.author_id !== user?.id && !isAdmin) {
      toast.error('Нет доступа к этой публикации');
      navigate({ to: '/account' });
      return;
    }

    if (prefilledRef.current) return;
    prefilledRef.current = true;

    setKind('article');
    setTitle(editingPost.title);
    setCategory(editingPost.category_slug || '');
    setExcerpt(editingPost.excerpt || '');
    setBodyText(editingPost.body_html || '');
    setExistingCoverUrl(editingPost.cover_url);
  }, [editingPost, isEditMode, user?.id, isAdmin, navigate, isAuthLoading]);

  useEffect(() => {
    if (isEditMode && !isPostLoading && !isAuthLoading && !editingPost) {
      toast.error('Публикация не найдена');
      navigate({ to: '/account' });
    }
  }, [editingPost, isPostLoading, isEditMode, navigate, isAuthLoading]);

  const isArticle = kind === 'article';

  // Filter categories based on selected type
  const availableTopics = useMemo(() => {
    if (isArticle) return articleCategories;
    return type === 'agent' 
      ? agentTopics 
      : promptTopics.filter(t => t.category === type as PromptCategory);
  }, [type, isArticle]);

  useEffect(() => {
    // Reset category and preview when type or kind changes
    setCategory('');
    setIsPreview(false);
  }, [type, kind]);

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

  const handleSaveDraft = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast.error('Введите заголовок, чтобы сохранить черновик');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCoverUrl = isEditMode ? existingCoverUrl : null;
      
      // Upload cover if new file is selected
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
        
        finalCoverUrl = publicUrl;
      }

      if (isEditMode) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            title,
            category_slug: category,
            excerpt,
            cover_url: finalCoverUrl,
            body_html: bodyText,
            status: 'draft'
          })
          .eq('id', editParam as string);

        if (updateError) throw updateError;
      } else {
        const { data: newPost, error: insertError } = await supabase
          .from('posts')
          .insert({
            author_id: user.id,
            type: 'article',
            title,
            prompt_ru: null,
            provider_id: null,
            category_slug: category,
            media: [],
            excerpt,
            cover_url: finalCoverUrl,
            body_html: bodyText,
            status: 'draft',
            params: {}
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        // Switch to edit mode for the newly created draft
        if (newPost) {
          prefilledRef.current = true;
          navigate({ 

            to: '/community/new', 
            search: { type: 'article', edit: newPost.id },
            replace: true 
          });
        }
      }

      toast.success('Черновик сохранён');
    } catch (err: any) {
      console.error("Error saving draft:", err);
      toast.error(`Ошибка при сохранении черновика: ${err.message || 'попробуйте позже'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isArticle) {
      const getCleanLength = (html: string) => {
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim().length;
      };

      if (!title.trim()) {
        toast.error('Введите заголовок статьи');
        return;
      }
      if (!category) {
        toast.error('Выберите рубрику статьи');
        return;
      }
      if (!excerpt.trim()) {
        toast.error('Введите краткое описание');
        return;
      }
      if (getCleanLength(bodyText) === 0) {
        toast.error('Введите текст статьи');
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
      let finalCoverUrl = isEditMode ? existingCoverUrl : null;
      let bodyHtml = null;
      const uploadedMedia = [];

      if (isArticle) {
        // Upload cover if new file is selected
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
          
          finalCoverUrl = publicUrl;
        }

        // bodyText already contains HTML
        bodyHtml = bodyText;

        if (isEditMode) {
          const { error: updateError } = await supabase
            .from('posts')
            .update({
              title,
              category_slug: category,
              excerpt,
              cover_url: finalCoverUrl,
              body_html: bodyHtml,
              status: 'pending'
            })
            .eq('id', editParam as string);

          if (updateError) throw updateError;
          toast.success('Изменения сохранены, статья отправлена на повторную проверку');
        } else {
          const { error: insertError } = await supabase
            .from('posts')
            .insert({
              author_id: user.id,
              type: 'article',
              title,
              prompt_ru: null,
              provider_id: null,
              category_slug: category,
              media: [],
              excerpt,
              cover_url: finalCoverUrl,
              body_html: bodyHtml,
              status: 'pending',
              params: {}
            });

          if (insertError) throw insertError;
          toast.success('Статья отправлена на проверку, она появится в ленте после модерации');
        }
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
      console.error("Error creating/updating post:", err);
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
  ];

  const getPageTitle = () => {
    if (isEditMode) return 'Редактировать статью';
    if (kind === null) return 'Новая публикация';
    if (kind === 'article') return 'Написать статью';
    return 'Добавить промпт';
  };

  if (isEditMode && (isPostLoading || isAuthLoading)) {
    return (
      <div className="container max-w-[720px] mx-auto py-12 px-6">
        <div className="h-[600px] rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container max-w-[720px] mx-auto py-12 px-6">
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">

        <h1 className="text-2xl font-bold mb-8">{getPageTitle()}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Publication Kind Selection */}
          {!isEditMode && (!isArticle || !isPreview) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Что публикуем</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setKind('prompt')}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border text-left transition-all",
                  kind === 'prompt' ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  kind === 'prompt' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Sparkles size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-foreground">Промпт</span>
                  <span className="text-[13px] text-muted-foreground leading-snug mt-0.5">Готовый промпт и результат генерации</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setKind('article')}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border text-left transition-all",
                  kind === 'article' ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  kind === 'article' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Newspaper size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-foreground">Статья</span>
                  <span className="text-[13px] text-muted-foreground leading-snug mt-0.5">Текст с картинками и форматированием</span>
                </div>
              </button>
              </div>
            </div>
          )}

          {kind && (
            <>
              {kind === 'article' && (
                <div className="flex justify-end mb-6">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50">
                    <button
                      type="button"
                      onClick={() => setIsPreview(false)}
                      className={cn(
                        "h-8 px-4 rounded-lg text-[13px] font-medium transition-colors",
                        !isPreview 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Редактор
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreview(true)}
                      className={cn(
                        "h-8 px-4 rounded-lg text-[13px] font-medium transition-colors",
                        isPreview 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Предпросмотр
                    </button>
                  </div>
                </div>
              )}

              {kind === 'prompt' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Тип промпта</label>
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
              )}

              {/* Title */}
              {(!isArticle || !isPreview) && (
                <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="title" className="text-sm font-medium">Заголовок *</label>
                  <span className={`text-xs ${title.length > 120 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {title.length}/120
                  </span>
                </div>
                <Input
                  id="title"
                  placeholder={isArticle ? "Заголовок статьи" : "О чём этот промпт?"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 150))}
                  required
                  maxLength={120}
                  className="rounded-xl"
                />
              </div>
              )}

              {kind === 'prompt' ? (
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
              ) : isPreview ? (
                <div className="pt-2 pb-2">
                  {/* Preview Cover */}
                  {cover || existingCoverUrl ? (
                    <img 
                      src={cover ? cover.preview : existingCoverUrl!} 
                      alt="" 
                      className="w-full aspect-[16/9] object-cover rounded-2xl mb-6" 
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-6">
                      <span className="text-sm text-muted-foreground">Обложка не загружена</span>
                    </div>
                  )}

                  {/* Preview Title */}
                  <h2 className={cn(
                    "text-[26px] font-bold text-foreground mb-4 leading-tight",
                    !title.trim() && "text-muted-foreground"
                  )}>
                    {title.trim() || "Без заголовка"}
                  </h2>

                  {/* Preview Excerpt */}
                  {excerpt.trim() && (
                    <p className="text-[17px] leading-relaxed text-muted-foreground mb-8">
                      {excerpt}
                    </p>
                  )}

                  {/* Preview Body */}
                  <div className="article-body">
                    {bodyText.trim() ? (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(bodyText) }} />
                    ) : (
                      <p className="text-sm text-muted-foreground">Текст статьи пока пуст</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Rubric (Category) */}
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-muted-foreground">Рубрика *</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Выберите рубрику...</option>
                      {availableTopics.map((topic: any) => (
                        <option key={topic.slug} value={topic.slug}>
                          {topic.cardTitle}
                        </option>
                      ))}
                    </select>
                  </div>

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
                    
                    {!cover && !existingCoverUrl ? (
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
                          src={cover ? cover.preview : existingCoverUrl!} 
                          alt="" 
                          className="w-full aspect-[16/9] object-cover rounded-2xl" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (cover) {
                              removeCover();
                            } else {
                              setExistingCoverUrl(null);
                            }
                          }}
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
                      <label htmlFor="excerpt" className="text-sm font-medium text-muted-foreground">Краткое описание *</label>
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
                      required
                    />
                    <p className="text-xs text-muted-foreground">Показывается в ленте под заголовком</p>
                  </div>

                  {/* Body Text Block */}
                  <div className="space-y-2">
                    <label htmlFor="bodyText" className="text-sm font-medium text-muted-foreground">Текст статьи *</label>
                    <ArticleEditor 
                      value={bodyText} 
                      onChange={setBodyText} 
                      userId={user?.id || ''} 
                    />
                    <p className="text-xs text-muted-foreground">Выделите текст, чтобы применить форматирование</p>
                  </div>
                </>
              )}

              {/* File Upload Zone for Prompts */}
              {kind === 'prompt' && type !== 'text' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Файлы (до 3 шт, макс 50 МБ)</label>
                  
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
                          type === 'audio' ? 'audio/*' : undefined
                        }
                      />
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                          {file.file.type.startsWith('image') ? (
                            <img src={file.preview} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              {file.file.type.startsWith('video') ? <Video size={24} /> : <Music size={24} />}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 h-12 rounded-xl text-base font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    isEditMode ? 'Сохранить изменения' : 'Опубликовать'
                  )}
                </Button>

                {isArticle && (!isEditMode || editingPost?.status === 'draft') && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="h-12 px-6 rounded-full border border-border bg-card text-foreground font-semibold hover:bg-secondary transition-colors shrink-0 disabled:opacity-50"
                  >
                    Сохранить черновик
                  </button>
                )}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Публикация появится в ленте после прохождения модерации
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
