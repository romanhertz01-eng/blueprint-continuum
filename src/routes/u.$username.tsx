import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { buildAuthHref } from "@/lib/authRedirect";
import { 
  User, 
  Heart, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Bot, 
  FileText,
  LayoutGrid,
  AlertCircle,
  Loader2,
  Settings,
  UserPlus,
  UserCheck,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/$username")({
  component: AuthorProfilePage,
});

function PostCard({ post }: { post: any }) {
  const media = post.media as any[];
  const firstMedia = media?.[0];
  const typeIcon = {
    text: <FileText className="h-5 w-5" />,
    image: <ImageIcon className="h-5 w-5" />,
    video: <Video className="h-5 w-5" />,
    audio: <Music className="h-5 w-5" />,
    agent: <Bot className="h-5 w-5" />,
  }[post.type as string] || <LayoutGrid className="h-5 w-5" />;

  return (
    <Link
      to="/community/$id"
      params={{ id: post.id }}
      className="group flex flex-col bg-card border border-border rounded-[18px] overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg"
    >
      <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
        {firstMedia?.url ? (
          <img 
            src={firstMedia.url} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground/40">{typeIcon}</div>
        )}
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="text-[14px] font-semibold text-foreground line-clamp-2 leading-snug mb-3 min-h-[2.5rem]">
          {post.title}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden text-muted-foreground">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (post.author?.display_name || "U").charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-[12px] text-muted-foreground truncate">
              {post.author?.display_name || "User"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground shrink-0">
            <Heart size={12} className="group-hover:text-primary transition-colors" />
            <span className="text-[12px] tabular-nums">{post.likes_count || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AuthorProfilePage() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Author Profile
  const { data: author, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ["author-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const authorId = author?.id;

  // 2. Fetch Author's Posts
  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["author-posts", authorId],
    enabled: !!authorId,
    queryFn: async () => {
      if (!authorId) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", authorId)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // 3. Fetch Stats & Follow State
  const { data: stats } = useQuery({
    queryKey: ["author-stats", authorId, user?.id],
    enabled: !!authorId,
    queryFn: async () => {
      if (!authorId) return { followersCount: 0, followingCount: 0, totalLikes: 0, isFollowing: false };

      // Followers count
      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: 'exact', head: true })
        .eq("following_id", authorId);
      
      // Following count
      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: 'exact', head: true })
        .eq("follower_id", authorId);

      // Total likes
      const { data: postsData } = await supabase
        .from("posts")
        .select("id")
        .eq("author_id", authorId);
      
      let totalLikes = 0;
      if (postsData && postsData.length > 0) {
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: 'exact', head: true })
          .in("post_id", postsData.map(p => p.id));
        totalLikes = likesCount || 0;
      }

      // Check if current user follows
      let isFollowing = false;
      if (user?.id) {
        const { data: followRecord } = await supabase
          .from("follows")
          .select("created_at")
          .eq("follower_id", user.id)
          .eq("following_id", authorId)
          .maybeSingle();
        isFollowing = !!followRecord;
      }

      return {
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        totalLikes,
        isFollowing
      };
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthed || !user) {
        window.location.href = buildAuthHref(`/u/${username}`);
        return;
      }
      if (!authorId) return;

      if (stats?.isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", authorId);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: authorId });
      }
    },
    onSuccess: () => {
      if (authorId) {
        queryClient.invalidateQueries({ queryKey: ["author-stats", authorId] });
      }
    },
  });

  // 4. Sidebar Data: Categories
  const { data: allPublishedPosts } = useQuery({
    queryKey: ["community-all-published-metadata"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("type, provider_id")
        .eq("status", "published");
      if (error) throw error;
      return data || [];
    },
  });

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allPublishedPosts?.length || 0,
      text: 0,
      image: 0,
      video: 0,
      audio: 0,
      agent: 0
    };
    
    allPublishedPosts?.forEach(p => {
      if (counts[p.type] !== undefined) {
        counts[p.type]++;
      }
    });
    
    return counts;
  }, [allPublishedPosts]);

  const categories = [
    { label: "Все", value: "all", count: categoryCounts.all },
    { label: "Текст", value: "text", count: categoryCounts.text },
    { label: "Изображения", value: "image", count: categoryCounts.image },
    { label: "Видео", value: "video", count: categoryCounts.video },
    { label: "Аудио", value: "audio", count: categoryCounts.audio },
    { label: "Агенты", value: "agent", count: categoryCounts.agent },
  ];

  // 5. Sidebar Data: Top Authors
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

  const topAuthorIds = useMemo(() => {
    if (!allFollowsData) return [];
    const counts: Record<string, number> = {};
    allFollowsData.forEach(f => {
      counts[f.following_id] = (counts[f.following_id] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5);
  }, [allFollowsData]);

  const { data: topAuthorsProfiles } = useQuery({
    queryKey: ["community-top-authors-profiles", topAuthorIds],
    enabled: topAuthorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", topAuthorIds);
      if (error) throw error;
      return data || [];
    },
  });

  const enrichedTopAuthors = useMemo(() => {
    if (!topAuthorsProfiles || !allFollowsData) return [];
    return topAuthorIds.map(id => {
      const profile = topAuthorsProfiles.find(p => p.id === id);
      const followersCount = allFollowsData.filter(f => f.following_id === id).length;
      return { ...profile, followers_count: followersCount };
    }).filter(a => !!a.id);
  }, [topAuthorsProfiles, allFollowsData, topAuthorIds]);

  const handleTypeChange = (type: string) => {
    navigate({ to: "/community", search: { type: type as any, provider: 'all', sort: 'new', page: 0 } });
  };

  const sidebarPosts = useMemo(() => {
    if (!posts || posts.length < 6) return null;
    // Show 5 latest except first ones seen in main grid? 
    // Usually "seen in gallery" means we skip some, but here the request says "except those visible".
    // Let's take 5 after the first few or just last 5 if we want variety.
    // Assuming "visible" refers to the top of the grid.
    return posts.slice(4, 9); // Example offset
  }, [posts]);

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profileError || !author) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Автор не найден</h1>
        <p className="text-muted-foreground mb-8">Возможно, ссылка неверна или профиль был удален.</p>
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

  const isSelf = user?.id === authorId;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-screen">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-[32px] p-6 md:p-10 mb-10 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-secondary border-4 border-background shadow-md flex items-center justify-center overflow-hidden shrink-0">
            {author.avatar_url ? (
              <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-muted-foreground uppercase">
                {author.username.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {author.display_name || author.username}
                </h1>
                <p className="text-primary font-medium">@{author.username}</p>
              </div>

              {isSelf ? (
                <Link
                  to="/account"
                  className="h-10 px-6 rounded-full border border-border bg-secondary hover:bg-card transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                  <Settings size={16} />
                  Редактировать профиль
                </Link>
              ) : (
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`
                    h-10 px-6 rounded-full font-semibold transition-all flex items-center gap-2 text-sm
                    ${stats?.isFollowing 
                      ? 'border border-border bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive' 
                      : 'bg-primary text-white hover:bg-primary/90 shadow-md'}
                  `}
                >
                  {followMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : stats?.isFollowing ? (
                    <>
                      <UserCheck size={16} />
                      Вы подписаны
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Подписаться
                    </>
                  )}
                </button>
              )}
            </div>

            {author.bio && (
              <p className="text-[15px] text-muted-foreground mb-6 max-w-2xl leading-relaxed">
                {author.bio}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-8 pt-6 border-t border-border/50">
              <div className="text-center md:text-left">
                <div className="text-xl font-bold">{posts?.length || 0}</div>
                <div className="text-[12px] text-muted-foreground uppercase tracking-wider">Публикаций</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl font-bold">{stats?.followersCount || 0}</div>
                <div className="text-[12px] text-muted-foreground uppercase tracking-wider">Подписчиков</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl font-bold">{stats?.followingCount || 0}</div>
                <div className="text-[12px] text-muted-foreground uppercase tracking-wider">Подписок</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl font-bold">{stats?.totalLikes || 0}</div>
                <div className="text-[12px] text-muted-foreground uppercase tracking-wider">Лайков</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Работы автора
          <span className="h-5 px-2 rounded-full bg-secondary text-[11px] font-bold flex items-center justify-center">
            {posts?.length || 0}
          </span>
        </h2>
      </div>

      {isPostsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-[18px] bg-muted animate-pulse" />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={{
                ...post,
                author: { 
                  display_name: author.display_name, 
                  avatar_url: author.avatar_url 
                }
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 border border-dashed rounded-[32px]">
          <LayoutGrid size={40} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">У автора пока нет публикаций</p>
        </div>
      )}
    </div>
  );
}
