import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Heart, MessageSquare, Image as ImageIcon, Video, Music, 
  User, LayoutGrid, UserPlus, Bookmark, Share2, Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buildAuthHref } from "@/lib/authRedirect";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const searchSchema = z.object({
  type: z.enum(["all", "text", "image", "video", "audio", "agent"]).optional().default("all"),
  sort: z.enum(["new", "popular"]).optional().default("new"),
  page: z.number().optional().default(0),
});

export const Route = createFileRoute("/community")({
  validateSearch: (search) => searchSchema.parse(search),
  component: CommunityPage,
  head: () => ({
    meta: [
      { title: "Сообщество — ERA2" },
      { name: "description", content: "Промпты, которыми делятся пользователи ERA2." },
    ],
  }),
});

function PostCard({ post }: { post: any }) {
  const media = post.media as any[];
  
  const formattedDate = post.created_at 
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru })
    : "";

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/community/${post.id}`);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-4 w-full">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/u/$username"
          params={{ username: post.author?.username || "user" }}
          className="flex items-center gap-3 group/author"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (post.author?.display_name || "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground group-hover/author:text-primary transition-colors truncate">
              {post.author?.display_name || "User"}
            </div>
            <div className="text-[12px] text-muted-foreground">
              {formattedDate}
            </div>
          </div>
        </Link>
        
        <button className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0">
          <UserPlus size={20} />
        </button>
      </div>

      {/* Category */}
      <div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium border border-primary/20">
          {post.type === 'text' ? 'Текст' : 
           post.type === 'image' ? 'Изображение' : 
           post.type === 'video' ? 'Видео' : 
           post.type === 'audio' ? 'Аудио' : 
           post.type === 'agent' ? 'Агент' : post.type}
        </span>
      </div>

      {/* Title */}
      <Link to={`/community/${post.id}`}>
        <h3 className="text-[20px] font-bold text-foreground leading-tight hover:text-primary transition-colors">
          {post.title}
        </h3>
      </Link>

      {/* Media or Prompt Preview */}
      <Link to={`/community/${post.id}`} className="block overflow-hidden rounded-xl border border-border/50">
        {media && media.length > 0 ? (
          <div className="flex flex-col gap-2">
            {media.map((item, idx) => (
              <div key={idx} className="w-full">
                {item.type === 'video' ? (
                  <video src={item.url} controls className="w-full aspect-video object-cover" />
                ) : item.type === 'audio' ? (
                  <audio src={item.url} controls className="w-full p-2" />
                ) : (
                  <img src={item.url} alt="" className="w-full h-auto object-cover" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 p-4 italic text-muted-foreground text-[14px] line-clamp-3 whitespace-pre-wrap rounded-xl">
            {post.prompt_ru}
          </div>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 flex-wrap">
        <button className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[13px] font-medium hover:bg-muted transition-colors">
          <Heart size={16} />
          <span>{post.likes_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[13px] font-medium hover:bg-muted transition-colors">
          <MessageSquare size={16} />
          <span>{post.comments_count || 0}</span>
        </button>
        <button className="p-2 bg-muted/50 rounded-full hover:bg-muted transition-colors">
          <Bookmark size={16} />
        </button>
        <button 
          onClick={handleShare}
          className="p-2 bg-muted/50 rounded-full hover:bg-muted transition-colors"
        >
          <Share2 size={16} />
        </button>
        <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[13px] font-medium ml-auto">
          <Eye size={16} />
          <span>{post.views || 0}</span>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ 
  categories, 
  topAuthors, 
  activeType, 
  onTypeChange 
}: { 
  categories: { label: string, value: string, count: number }[],
  topAuthors: any[],
  activeType: string,
  onTypeChange: (type: string) => void
}) {
  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-24">
      {/* Categories Block */}
      <div className="rounded-2xl bg-muted/30 border border-border p-5">
        <h4 className="font-bold mb-4">Категории</h4>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onTypeChange(cat.value)}
              className={cn(
                "flex items-center justify-between py-2 px-3 rounded-xl transition-colors text-left",
                activeType === cat.value ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{cat.label}</span>
              <span className="text-[12px] opacity-60 bg-muted px-2 py-0.5 rounded-full">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Authors Block */}
      <div className="rounded-2xl bg-muted/30 border border-border p-5">
        <h4 className="font-bold mb-4">Топ авторов</h4>
        <div className="flex flex-col gap-4">
          {topAuthors.map((author, idx) => (
            <Link
              key={author.id}
              to="/u/$username"
              params={{ username: author.username }}
              className="flex items-center gap-3 group"
            >
              <div className="text-[13px] font-bold text-muted-foreground w-4">
                {idx + 1}
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-[12px] font-bold overflow-hidden shrink-0">
                {author.avatar_url ? (
                  <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (author.display_name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {author.display_name}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {author.followers_count} {author.followers_count === 1 ? 'подписчик' : 'подписчиков'}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/community" className="block text-center text-primary text-[13px] font-medium mt-6 hover:underline">
          Все авторы
        </Link>
      </div>
    </div>
  );
}

function CommunityPage() {
  const { type, sort, page } = useSearch({ from: "/community" });
  const { isAuthed } = useAuth();
  const navigate = Route.useNavigate();

  const { data: postsData, isLoading: isPostsLoading, error: postsError } = useQuery({
    queryKey: ["community-posts", type, sort, page],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*")
        .eq("status", "published");

      if (type !== "all") {
        query = query.eq("type", type);
      }

      if (sort === "popular") {
        query = query.order("views", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const limit = 10; // Smaller limit for vertical feed
      const from = page * limit;
      const to = from + limit - 1;
      
      const { data, error } = await query.range(from, to);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allPostsData } = useQuery({
    queryKey: ["community-all-posts-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("type")
        .eq("status", "published");
      if (error) throw error;
      return data || [];
    },
  });

  const authorIds = useMemo(() => {
    if (!postsData) return [];
    return Array.from(new Set(postsData.map(p => p.author_id)));
  }, [postsData]);

  const { data: authorsData } = useQuery({
    queryKey: ["community-authors", authorIds],
    enabled: authorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", authorIds);
      if (error) throw error;
      return data || [];
    },
  });

  const postIds = useMemo(() => {
    if (!postsData) return [];
    return postsData.map(p => p.id);
  }, [postsData]);

  const { data: likesData } = useQuery({
    queryKey: ["community-likes", postIds],
    enabled: postIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("post_id");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: commentsData } = useQuery({
    queryKey: ["community-comments-counts", postIds],
    enabled: postIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("post_id");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allFollowsData } = useQuery({
    queryKey: ["community-all-follows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("following_id");
      if (error) throw error;
      return data || [];
    },
  });

  const topAuthors = useMemo(() => {
    if (!allFollowsData) return [];
    
    const counts: Record<string, number> = {};
    allFollowsData.forEach(f => {
      counts[f.following_id] = (counts[f.following_id] || 0) + 1;
    });

    const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5);
    return sortedIds;
  }, [allFollowsData]);

  const { data: topAuthorsProfiles } = useQuery({
    queryKey: ["community-top-authors-profiles", topAuthors],
    enabled: topAuthors.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", topAuthors);
      if (error) throw error;
      return data || [];
    },
  });

  const enrichedTopAuthors = useMemo(() => {
    if (!topAuthorsProfiles || !allFollowsData) return [];
    
    return topAuthors.map(id => {
      const profile = topAuthorsProfiles.find(p => p.id === id);
      const followersCount = allFollowsData.filter(f => f.following_id === id).length;
      return {
        ...profile,
        followers_count: followersCount
      };
    }).filter(a => a.id);
  }, [topAuthorsProfiles, allFollowsData, topAuthors]);

  const enrichedPosts = useMemo(() => {
    if (!postsData) return [];
    
    return postsData.map(post => {
      const author = authorsData?.find(a => a.id === post.author_id);
      const postLikes = likesData?.filter(l => l.post_id === post.id).length || 0;
      const postComments = commentsData?.filter(c => c.post_id === post.id).length || 0;
      
      return {
        ...post,
        author: author || { display_name: "Автор", avatar_url: null },
        likes_count: postLikes,
        comments_count: postComments
      };
    });
  }, [postsData, authorsData, likesData, commentsData]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allPostsData?.length || 0,
      text: 0,
      image: 0,
      video: 0,
      audio: 0,
      agent: 0
    };
    
    allPostsData?.forEach(p => {
      if (counts[p.type] !== undefined) {
        counts[p.type]++;
      }
    });
    
    return counts;
  }, [allPostsData]);

  const categories = [
    { label: "Все", value: "all", count: categoryCounts.all },
    { label: "Текст", value: "text", count: categoryCounts.text },
    { label: "Изображения", value: "image", count: categoryCounts.image },
    { label: "Видео", value: "video", count: categoryCounts.video },
    { label: "Аудио", value: "audio", count: categoryCounts.audio },
    { label: "Агенты", value: "agent", count: categoryCounts.agent },
  ];

  const handleTypeChange = (newType: string) => {
    navigate({ search: (prev) => ({ ...prev, type: newType as any, page: 0 }) });
  };

  const handleSortChange = (newSort: string) => {
    navigate({ search: (prev) => ({ ...prev, sort: newSort as any, page: 0 }) });
  };

  const handleLoadMore = () => {
    navigate({ search: (prev) => ({ ...prev, page: (prev.page || 0) + 1 }) });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Сообщество</h1>
          <p className="text-muted-foreground">Промпты, которыми делятся пользователи ERA2.</p>
        </div>
        <Link
          to={isAuthed ? "/community/new" : buildAuthHref("/community/new")}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-[0_4px_16px_rgba(232,84,32,0.3)] shrink-0 self-start md:self-auto"
        >
          <Plus size={18} />
          <span>Добавить промпт</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Feed Column */}
        <div className="lg:w-[70%]">
          {/* Filters & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleTypeChange(cat.value)}
                  className={cn(
                    "h-9 px-4 rounded-full text-[13px] font-medium transition-all shrink-0 border",
                    type === cat.value 
                      ? "bg-primary text-white border-primary" 
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <select 
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-9 px-3 rounded-lg bg-secondary border border-border text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <option value="new">Сначала новые</option>
                <option value="popular">Популярные</option>
              </select>
            </div>
          </div>

          {/* Feed */}
          {isPostsLoading ? (
            <div className="flex flex-col gap-[20px]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full aspect-[21/9] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : postsError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-destructive/20 rounded-[24px] bg-destructive/5">
              <h2 className="text-xl font-semibold mb-2 text-destructive">Не удалось загрузить промпты</h2>
              <p className="text-muted-foreground mb-6">{(postsError as Error).message}</p>
            </div>
          ) : enrichedPosts.length > 0 ? (
            <>
              <div className="flex flex-col gap-[20px]">
                {enrichedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-full border border-border bg-secondary font-medium text-[13px] hover:bg-card transition-colors"
                >
                  Показать ещё
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-[24px] bg-muted/20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/30 mb-4">
                <LayoutGrid size={32} />
              </div>
              <h2 className="text-xl font-semibold mb-2">Здесь пока пусто</h2>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Здесь пока пусто — добавьте первый промпт
              </p>

              <Link
                to={isAuthed ? "/community/new" : buildAuthHref("/community/new")}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
              >
                <Plus size={16} />
                <span>Добавить первый промпт</span>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:w-[30%]">
          <Sidebar 
            categories={categories}
            topAuthors={enrichedTopAuthors}
            activeType={type}
            onTypeChange={handleTypeChange}
          />
        </div>
      </div>
    </div>
  );
}

export default CommunityPage;
