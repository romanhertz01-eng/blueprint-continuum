import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
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
  Loader2,
  ArrowRight,
  Play,
  Pause,
  Music,
  Eye,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildAuthHref } from "@/lib/authRedirect";
import { useAuth } from "@/contexts/AuthContext";
import { CopyPromptButton } from "@/components/prompts/CopyPromptButton";
import { CatalogCard } from "@/components/prompts/CatalogCard";
import { writePromptHandoff, CATEGORY_ROUTE } from "@/lib/promptHandoff";
import { promptItems } from "@/data/prompts";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { PromptCategory } from "@/data/prompts/types";

export const Route = createFileRoute("/community_/$id")({
  component: PromptDetailPage,
});

function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 bg-muted/20 rounded-2xl p-3 border border-border/50">
      <div className="relative w-[88px] h-[88px] rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shrink-0 overflow-hidden group/audio">
        <Music size={32} className="text-white" />
        <button 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/audio:opacity-100 transition-opacity"
        >
          {isPlaying ? <Pause size={24} className="text-white fill-current" /> : <Play size={24} className="text-white fill-current ml-1" />}
        </button>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <audio 
          ref={audioRef} 
          src={url} 
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          className="hidden" 
        />
        <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

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

  // 5. Load other posts (Other Publications)
  const { data: otherPosts } = useQuery({
    queryKey: ["community-other-posts", id],
    enabled: !!post,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      
      // Fetch authors for these posts
      if (data && data.length > 0) {
        const uids = Array.from(new Set(data.map(p => p.author_id)));
        const { data: authors } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url")
          .in("id", uids);
        
        // Fetch social counts
        const pids = data.map(p => p.id);
        const { data: likes } = await supabase.from("likes").select("post_id").in("post_id", pids);
        const { data: commentsCount } = await supabase.from("comments").select("post_id").in("post_id", pids);

        return data.map(p => ({
          ...p,
          author: authors?.find(a => a.id === p.author_id) || { display_name: "Автор", username: "user", avatar_url: null },
          likes_count: likes?.filter(l => l.post_id === p.id).length || 0,
          comments_count: commentsCount?.filter(c => c.post_id === p.id).length || 0
        }));
      }
      return [];
    },
  });

  // 6. Load similar community posts (Sidebar)
  const { data: sidebarSimilar } = useQuery({
    queryKey: ["community-similar-sidebar", post?.type, id],
    enabled: !!post?.type,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, views")
        .eq("status", "published")
        .eq("type", post!.type)
        .neq("id", id)
        .limit(5);
      if (error) throw error;
      
      if (data && data.length > 0) {
        const pids = data.map(p => p.id);
        const { data: likes } = await supabase.from("likes").select("post_id").in("post_id", pids);
        return data.map(p => ({
          ...p,
          likes_count: likes?.filter(l => l.post_id === p.id).length || 0
        }));
      }
      return [];
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
          search={{ type: 'all', provider: 'all', sort: 'new', page: 0 }}
          className="text-primary font-medium hover:underline"
        >
          Вернуться в сообщество
        </Link>
      </div>
    );
  }

  const media = (post.media as any[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Column */}
        <div className="lg:w-[70%]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px] text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
        <ChevronRight size={14} />
        <Link 
          to="/community" 
          search={{ type: 'all', provider: 'all', sort: 'new', page: 0 }}
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
                <div className="p-4">
                  <AudioPlayer url={item.url} />
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
              to={buildAuthHref(typeof window !== 'undefined' ? window.location.pathname : `/community/${id}`)}
              className="inline-flex items-center h-10 px-6 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
            >
              Войти
            </Link>
          </div>
        )}
      </section>

      {/* Other Publications Section */}
      {otherPosts && otherPosts.length > 0 && (
        <section className="mt-16 pt-16 border-t border-border">
          <h2 className="text-[20px] font-bold mb-8">Другие публикации</h2>
          <div className="flex flex-col gap-4">
            {otherPosts.map((otherPost) => (
              <PostCardMinimal key={otherPost.id} post={otherPost} />
            ))}
          </div>
          <Link 
            to="/community" 
            search={{ type: 'all', provider: 'all', sort: 'new', page: 0 }}
            className="mt-8 inline-flex items-center text-primary font-bold hover:underline"
          >
            Вся лента
            <ArrowRight size={16} className="ml-1.5" />
          </Link>
        </section>
      )}

      {/* Similar from Catalog */}
      <SimilarFromCatalog category={post.type as PromptCategory} />
    </div>

    {/* Sidebar Column */}
    <div className="lg:w-[30%]">
      <aside className="space-y-8 lg:sticky lg:top-24">
        {/* Similar Community Posts Sidebar Block */}
        {sidebarSimilar && sidebarSimilar.length > 0 && (
          <div className="rounded-3xl bg-card border border-border p-6">
            <h3 className="text-[17px] font-bold mb-5">Похожее</h3>
            <div className="space-y-5">
              {sidebarSimilar.map((sPost) => (
                <Link 
                  key={sPost.id} 
                  to="/community/$id" 
                  params={{ id: sPost.id }}
                  className="block group"
                >
                  <div className="text-[13px] font-medium leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {sPost.title}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart size={12} />
                      <span>{sPost.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={12} />
                      <span>{sPost.views || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  </div>
</div>
);
}


// Minimal PostCard for "Other Publications" block (matching /community style)
function PostCardMinimal({ post }: { post: any }) {
const media = post.media as any[] || [];
const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru });

const getPostGradient = (id: string) => {
const colors = [
  'from-blue-500/20 to-indigo-500/20',
  'from-purple-500/20 to-pink-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-orange-500/20 to-amber-500/20',
  'from-rose-500/20 to-purple-500/20'
];
const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
return colors[index];
};

return (
<div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-3.5 w-full">
  <div className="flex items-center justify-between">
    <Link to="/u/$username" params={{ username: post.author?.username || "user" }} className="flex items-center gap-2.5 group/author">
      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
        {post.author?.avatar_url ? <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" /> : (post.author?.display_name || "U").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-[14px] text-foreground group-hover/author:text-primary transition-colors truncate">{post.author?.display_name || "User"}</div>
        <div className="text-[11px] text-muted-foreground">{formattedDate}</div>
      </div>
    </Link>
  </div>
  <div>
    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium border border-primary/20 capitalize">{post.type}</span>
  </div>
  <Link to="/community/$id" params={{ id: post.id }}>
    <h3 className="text-[17px] font-bold text-foreground leading-tight hover:text-primary transition-colors">{post.title}</h3>
  </Link>
  <Link to="/community/$id" params={{ id: post.id }} className="block overflow-hidden rounded-xl border border-border/50">
    {media.length > 0 ? (
      <div className="flex flex-col gap-2">
        {media.map((item: any, idx: number) => (
          <div key={idx} className="w-full">
            {item.type === 'video' ? <video src={item.url} className="w-full max-h-[420px] object-cover" /> : 
             item.type === 'audio' ? <AudioPlayer url={item.url} /> :
             <img src={item.url} alt="" className="w-full max-h-[420px] object-cover" />}
          </div>
        ))}
      </div>
    ) : (
      <div className={cn("p-5 text-foreground font-medium text-[15px] leading-relaxed whitespace-pre-wrap rounded-xl bg-gradient-to-br min-h-[140px] flex flex-col justify-center", getPostGradient(post.id))}>
        <div className="line-clamp-2">{post.prompt_ru}</div>
      </div>
    )}
  </Link>
  <div className="flex items-center gap-2 pt-1">
    <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[12px] font-medium"><Heart size={15} /><span>{post.likes_count || 0}</span></div>
    <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[12px] font-medium"><MessageSquare size={15} /><span>{post.comments_count || 0}</span></div>
    <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[12px] font-medium ml-auto"><Eye size={15} /><span>{post.views || 0}</span></div>
  </div>
</div>
);
}



