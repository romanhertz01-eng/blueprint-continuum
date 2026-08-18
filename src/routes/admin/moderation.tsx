import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Undo2, 
  Clock, 
  ImageIcon, 
  Video, 
  Music, 
  Bot, 
  FileText,
  ExternalLink,
  Eye,
  Newspaper
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type PostMedia = {
  type: 'image' | 'video' | 'audio';
  url: string;
};

type Author = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export const Route = createFileRoute("/admin/moderation")({
  component: () => (
    <RequireAuth>
      <ModerationPage />
    </RequireAuth>
  ),
});

function ModerationPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'rejected'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const isAdmin = profile?.is_admin === true;

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['admin-posts', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', activeTab)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  const { data: authors } = useQuery({
    queryKey: ['admin-authors', posts?.map(p => p.author_id)],
    queryFn: async () => {
      if (!posts || posts.length === 0) return {} as Record<string, Author>;
      const authorIds = Array.from(new Set(posts.map(p => p.author_id)));
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', authorIds);
      if (error) throw error;
      return (data || []).reduce((acc, profile) => ({ ...acc, [profile.id]: profile }), {} as Record<string, Author>);
    },
    enabled: !!posts && posts.length > 0
  });

  const handleUpdateStatus = async (postId: string, status: string, reason?: string) => {
    try {
      const updates: any = { 
        status, 
        rejection_reason: reason || null 
      };
      
      if (status === 'published') {
        updates.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId);

      if (error) throw error;
      
      toast.success(
        status === 'published' ? "Промпт опубликован" : 
        status === 'rejected' ? "Промпт отклонён" : "Статус изменён"
      );
      
      setRejectingId(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    } catch (err: any) {
      toast.error(`Ошибка: ${err.message}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-20 px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ только для модераторов</h1>
        <Link to="/" className="text-primary hover:underline flex items-center justify-center gap-2">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'agent': return <Bot className="h-5 w-5" />;
      case 'article': return <Newspaper className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const typeLabels: Record<string, string> = {
    text: "Текст",
    image: "Изображение",
    video: "Видео",
    audio: "Аудио",
    agent: "Агент",
    article: "Статья"
  };

  return (
    <div className="container max-w-[1200px] mx-auto py-12 px-6 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Модерация</h1>
      </div>

      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit mb-8">
        {[
          { id: 'pending', label: 'На проверке', icon: Clock },
          { id: 'published', label: 'Опубликованные', icon: CheckCircle2 },
          { id: 'rejected', label: 'Отклонённые', icon: XCircle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {isPostsLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 border border-dashed rounded-3xl">
          <p className="text-muted-foreground">В этом разделе пока пусто</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const author = authors?.[post.author_id];
            const media = (Array.isArray(post.media) ? post.media : []) as unknown as PostMedia[];
            const isExpanded = expandedId === post.id;
            
            return (
              <div 
                key={post.id} 
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {post.type === 'article' && post.cover_url ? (
                      <img src={post.cover_url} className="w-full h-full object-cover" alt="" />
                    ) : media[0] ? (
                      media[0].type === 'image' ? (
                        <img src={media[0].url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        getTypeIcon(post.type)
                      )
                    ) : (
                      getTypeIcon(post.type)
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : post.id)}
                        className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-1"
                      >
                        {post.title}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(post.type)} {typeLabels[post.type] || post.type}
                      </span>
                      {post.category_slug && (
                        <span>• {post.category_slug}</span>
                      )}
                      <span>• {author?.display_name || author?.username || 'Аноним'}</span>
                      <span>• {format(new Date(post.created_at), 'd MMMM HH:mm', { locale: ru })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {activeTab === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleUpdateStatus(post.id, 'published')}
                          size="sm"
                          className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Опубликовать
                        </Button>
                        <Button 
                          onClick={() => setRejectingId(rejectingId === post.id ? null : post.id)}
                          variant="destructive"
                          size="sm"
                          className="rounded-lg"
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Отклонить
                        </Button>
                      </>
                    )}
                    {activeTab === 'published' && (
                      <Button 
                        onClick={() => handleUpdateStatus(post.id, 'pending')}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Undo2 className="h-4 w-4 mr-2" /> Снять
                      </Button>
                    )}
                    {activeTab === 'rejected' && (
                      <Button 
                        onClick={() => handleUpdateStatus(post.id, 'pending')}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Undo2 className="h-4 w-4 mr-2" /> На проверку
                      </Button>
                    )}
                  </div>
                </div>

                {/* Rejection Form */}
                {rejectingId === post.id && (
                  <div className="px-4 pb-4 border-t border-border pt-4 bg-destructive/5">
                    <label className="text-sm font-medium mb-2 block">Причина отклонения:</label>
                    <div className="flex gap-2">
                      <Textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Укажите причину..."
                        className="rounded-xl bg-background"
                      />
                      <div className="flex flex-col gap-2">
                        <Button 
                          disabled={!rejectionReason.trim()}
                          onClick={() => handleUpdateStatus(post.id, 'rejected', rejectionReason)}
                          className="rounded-xl h-full"
                        >
                          Сохранить
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={() => setRejectingId(null)}
                          className="rounded-xl"
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-6 border-t border-border pt-4 space-y-6">
                    {/* Media stack */}
                    {media.length > 0 && (
                      <div className="flex flex-col gap-4 max-w-[600px]">
                        {media.map((item: PostMedia, idx: number) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-border bg-muted/20">
                            {item.type === 'image' && (
                              <img src={item.url} className="w-full h-auto" alt="" />
                            )}
                            {item.type === 'video' && (
                              <video src={item.url} controls className="w-full" />
                            )}
                            {item.type === 'audio' && (
                              <audio src={item.url} controls className="w-full p-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Prompt Text */}
                    {post.type !== 'article' ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Промпт</h4>
                        <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm whitespace-pre-wrap">
                          {post.prompt_ru}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Краткое описание</h4>
                          <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm">
                            {post.excerpt}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Текст статьи</h4>
                          <div className="bg-background border border-border rounded-xl p-4 max-h-[500px] overflow-y-auto">
                            <div className="article-body" dangerouslySetInnerHTML={{ __html: post.body_html || '' }} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Meta */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Модель</span>
                        <span className="font-medium">{post.provider_id || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Просмотры</span>
                        <span className="font-medium flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Ссылка</span>
                        <a 
                          href={`/community/${post.id}`} 
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Открыть страницу <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    
                    {post.status === 'rejected' && post.rejection_reason && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
                        <strong>Причина отклонения:</strong> {post.rejection_reason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
