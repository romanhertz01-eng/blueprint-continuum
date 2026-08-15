import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Send, 
  Trash2, 
  ChevronRight, 
  User, 
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildAuthHref } from "@/lib/authRedirect";
import { useAuth } from "@/contexts/AuthContext";
import { CopyPromptButton } from "@/components/prompts/CopyPromptButton";
import { writePromptHandoff, CATEGORY_ROUTE } from "@/lib/promptHandoff";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { PromptCategory } from "@/data/prompts/types";

export const Route = createFileRoute("/community_/$id")({
  component: PromptDetailPage,
});

function PromptDetailPage() {
  const { id } = Route.useParams();
  const { user, isAuthed, profile } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  
  const isAdmin = profile?.is_admin || false;

  // 1. Load the post
  const { data: post, isLoading: isPostLoading, error: postError } = useQuery({
    queryKey: ["community-post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // 2. Load the author
  const { data: author } = useQuery({
    queryKey: ["community-author", post?.author_id],
    enabled: !!post?.author_id,
    queryFn: async () => {
      if (!post) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .eq("id", post.author_id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // 3. Load comments
  const { data: comments } = useQuery({
    queryKey: ["community-comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      
      // Fetch authors for comments
      if (data && data.length > 0) {
        const uids = Array.from(new Set(data.map(c => c.author_id)));
        const { data: authors, error: aError } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", uids);
        
        if (!aError && authors) {
          return data.map(c => ({
            ...c,
            author: authors.find(a => a.id === c.author_id) || { display_name: "Пользователь", avatar_url: null }
          }));
        }
      }
      return (data || []).map(c => ({ ...c, author: { display_name: "Пользователь", avatar_url: null } }));
    },
  });

  // 4. Social State (Likes/Saves)
  const { data: socialState } = useQuery({
    queryKey: ["community-social", id, user?.id],
    enabled: !!id,
    queryFn: async () => {
      const results = {
        likesCount: 0,
        isLiked: false,
        isSaved: false
      };

      const { count: likesCount } = await supabase
        .from("likes")
        .select("*", { count: 'exact', head: true })
        .eq("post_id", id);
      results.likesCount = likesCount || 0;

      if (user?.id) {
        const { data: myLike } = await supabase
          .from("likes")
          .select("created_at")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        results.isLiked = !!myLike;

        const { data: mySave } = await supabase
          .from("saves")
          .select("created_at")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        results.isSaved = !!mySave;
      }

      return results;
    },
  });

  // Mutations
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthed || !user) {
        window.location.href = buildAuthHref(`/community/${id}`);
        return;
      }
      if (socialState?.isLiked) {
        await supabase.from("likes").delete().eq("post_id", id).eq("user_id", user.id);
      } else {
        await supabase.from("likes").insert({ post_id: id, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-social", id] }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthed || !user) {
        window.location.href = buildAuthHref(`/community/${id}`);
        return;
      }
      if (socialState?.isSaved) {
        await supabase.from("saves").delete().eq("post_id", id).eq("user_id", user.id);
      } else {
        await supabase.from("saves").insert({ post_id: id, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-social", id] }),
  });

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) return;
      const { error } = await supabase.from("comments").insert({
        post_id: id,
        author_id: user.id,
        body: text
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["community-comments", id] });
      toast.success("Комментарий добавлен");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-comments", id] }),
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Ссылка скопирована");
  };

  const handleHandoff = () => {
    if (!post) return;
    writePromptHandoff({
      prompt: post.prompt_ru,
      category: post.type as PromptCategory,
      providerId: post.provider_id || undefined,
      sourceSlug: post.id
    });
    const route = CATEGORY_ROUTE[post.type as PromptCategory] || "/workspace";
    window.location.href = isAuthed ? route : buildAuthHref(route);
  };

  if (isPostLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isOwner = user?.id === post?.author_id;
  const canView = post?.status === 'published' || isOwner || isAdmin;

  if (postError || !post || !canView) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Промпт не найден</h1>
        <p className="text-muted-foreground mb-8">Возможно, он был удален или еще находится на модерации.</p>
        <Link 
          to="/community" 
          search={{ type: 'all', sort: 'new', page: 0 }}
          className="text-primary font-medium hover:underline"
        >
          Вернуться в сообщество
        </Link>
      </div>
    );
  }

  const media = (post.media as any[]) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px] text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
        <ChevronRight size={14} />
        <Link 
          to="/community" 
          search={{ type: 'all', sort: 'new', page: 0 }}
          className="hover:text-foreground transition-colors"
        >
          Сообщество
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Status Banner */}
      {post.status !== 'published' && (isOwner || isAdmin) && (
        <div className={cn(
          "mb-8 p-4 rounded-2xl border flex items-center gap-3",
          post.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-destructive/10 border-destructive/20 text-destructive"
        )}>
          <AlertCircle size={20} />
          <div>
            <div className="font-semibold">
              {post.status === 'pending' ? "Промпт на проверке" : "Промпт отклонён"}
            </div>
            {post.status === 'rejected' && post.rejection_reason && (
              <div className="text-sm opacity-90">{post.rejection_reason}</div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/u/$username"
            params={{ username: author?.username || "user" }}
            className="flex items-center gap-3 group/author"
          >
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover/author:border-primary/50 transition-colors">
              {author?.avatar_url ? (
                <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="font-semibold text-[15px] group-hover/author:text-primary transition-colors">
                {author?.display_name || "Пользователь"}
              </div>
              <div className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                <Clock size={12} />
                {format(new Date(post.created_at), "d MMMM yyyy", { locale: ru })}
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* Media Content */}
      {media.length > 0 && (
        <div className="space-y-6 mb-10">
          {media.map((item, idx) => (
            <div key={idx} className="rounded-3xl overflow-hidden bg-muted border border-border">
              {item.type === 'image' && (
                <img src={item.url} alt="" className="w-full h-auto" />
              )}
              {item.type === 'video' && (
                <video src={item.url} controls className="w-full" />
              )}
              {item.type === 'audio' && (
                <div className="p-6">
                   <audio src={item.url} controls className="w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Prompt Block */}
      <div className="mb-10">
        <h3 className="text-[15px] font-bold mb-4 uppercase tracking-wider text-muted-foreground">Промпт</h3>
        <div className="relative group">
          <div className="absolute top-4 right-4 z-10">
            <CopyPromptButton text={post.prompt_ru} />
          </div>
          <div className="bg-muted/30 border border-border rounded-[24px] p-6 pt-14 md:pt-6 md:pr-40 text-[16px] leading-relaxed whitespace-pre-wrap text-foreground">
            {post.prompt_ru}
          </div>
        </div>
      </div>

      {/* Info & Handoff */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-border">
        <div className="space-y-2">
          {post.provider_id && (
            <div className="text-[14px]">
              <span className="text-muted-foreground">Модель:</span>{" "}
              <span className="font-medium text-foreground">{post.provider_id}</span>
            </div>
          )}
          {post.category_slug && (
            <div className="text-[14px]">
              <span className="text-muted-foreground">Категория:</span>{" "}
              <span className="font-medium text-foreground">{post.category_slug}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleHandoff}
          className="h-12 px-8 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(232,84,32,0.3)] flex items-center justify-center gap-2"
        >
          Повторить генерацию
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-16">
        <button
          onClick={() => likeMutation.mutate()}
          className={cn(
            "h-11 px-6 rounded-full border border-border flex items-center gap-2 font-medium transition-all active:scale-95",
            socialState?.isLiked ? "bg-primary/10 border-primary text-primary" : "bg-card hover:bg-secondary"
          )}
        >
          <Heart size={18} fill={socialState?.isLiked ? "currentColor" : "none"} />
          <span>{socialState?.likesCount || 0}</span>
        </button>
        <button
          onClick={() => saveMutation.mutate()}
          className={cn(
            "h-11 px-6 rounded-full border border-border flex items-center gap-2 font-medium transition-all active:scale-95",
            socialState?.isSaved ? "bg-primary/10 border-primary text-primary" : "bg-card hover:bg-secondary"
          )}
        >
          <Bookmark size={18} fill={socialState?.isSaved ? "currentColor" : "none"} />
          <span>{socialState?.isSaved ? "Сохранено" : "Сохранить"}</span>
        </button>
        <button
          onClick={handleShare}
          className="h-11 px-6 rounded-full border border-border bg-card hover:bg-secondary flex items-center gap-2 font-medium transition-all active:scale-95 ml-auto"
        >
          <Share2 size={18} />
          <span className="hidden md:inline">Поделиться</span>
        </button>
      </div>

      {/* Comments Section */}
      <section className="bg-card border border-border rounded-[32px] p-6 md:p-8">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          Комментарии
          <span className="text-muted-foreground font-normal ml-1">{comments?.length || 0}</span>
        </h2>

        {/* List */}
        <div className="space-y-8 mb-10">
          {comments?.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                {comment.author?.avatar_url ? (
                  <img src={comment.author.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[14px]">{comment.author?.display_name || "Пользователь"}</span>
                  <span className="text-[12px] text-muted-foreground">
                    {format(new Date(comment.created_at), "d MMM, HH:mm", { locale: ru })}
                  </span>
                  {(user?.id === comment.author_id || isAdmin) && (
                    <button 
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {comment.body}
                </div>
              </div>
            </div>
          ))}

          {comments?.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              Комментариев пока нет. Будьте первым!
            </div>
          )}
        </div>

        {/* Input */}
        {isAuthed ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim()) commentMutation.mutate(commentText);
            }}
            className="relative"
          >
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Напишите комментарий..."
              className="w-full min-h-[120px] bg-muted/30 border border-border rounded-2xl p-4 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-[15px]"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || commentMutation.isPending}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {commentMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        ) : (
          <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4">Войдите, чтобы оставлять комментарии</p>
            <Link
              to={buildAuthHref(window.location.pathname)}
              className="inline-flex items-center h-10 px-6 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
            >
              Войти
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}


