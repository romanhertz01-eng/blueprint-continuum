import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Heart, MessageSquare, Image as ImageIcon, Video, Music, 
  User, LayoutGrid, UserPlus, Bookmark, Share2, Eye, Play, Pause
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buildAuthHref } from "@/lib/authRedirect";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const searchSchema = z.object({
  type: z.enum(["all", "prompts", "text", "image", "video", "audio", "agent", "article"]).optional().default("all"),
  provider: z.string().optional().default("all"),
  sort: z.enum(["new", "popular"]).optional().default("new"),
  page: z.number().optional().default(0),
  topic: z.string().optional().default("all"),
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
    <div className="flex items-center gap-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/10 w-full h-[96px]">
      <div className="relative w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shrink-0 overflow-hidden group/audio">
        <Music size={28} className="text-white" />
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
    <div className="mx-auto w-full max-w-[680px] rounded-2xl bg-card border border-border p-4 flex flex-col gap-3.5">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/u/$username"
          params={{ username: post.author?.username || "user" }}
          className="flex items-center gap-2.5 group/author"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (post.author?.display_name || "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[14px] text-foreground group-hover/author:text-primary transition-colors truncate">
              {post.author?.display_name || "User"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {formattedDate}
            </div>
          </div>
        </Link>
        
        <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0">
          <UserPlus size={16} />
        </button>
      </div>

      {/* Category Tag */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium border border-primary/20">
          {post.type === 'text' ? 'Текст' : 
           post.type === 'image' ? 'Изображение' : 
           post.type === 'video' ? 'Видео' : 
           post.type === 'audio' ? 'Аудио' : 
           post.type === 'agent' ? 'Агент' : 
           post.type === 'article' ? 'Статья' : post.type}
        </span>
        {post.is_official && (
          <span className="px-2.5 py-0.5 rounded-full bg-foreground/10 text-foreground text-[11px] font-medium border border-border">
            ЭРА2
          </span>
        )}
      </div>

      {/* Title */}
      <Link to="/community/$id" params={{ id: post.id }}>
        <h3 className="text-[17px] font-bold text-foreground leading-tight hover:text-primary transition-colors">
          {post.title}
        </h3>
      </Link>

      {/* Media or Prompt Preview */}
      {post.type === 'article' ? (
        <Link to="/community/$id" params={{ id: post.id }} className="flex flex-col gap-3.5">
          {post.cover_url && (
            <img 
              src={post.cover_url} 
              alt="" 
              className="w-full aspect-[16/9] object-cover rounded-xl"
            />
          )}
          <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
          <span className="text-[13px] font-medium text-primary">
            Читать полностью
          </span>
        </Link>
      ) : post.type === 'text' || post.type === 'agent' ? (
        <Link to="/community/$id" params={{ id: post.id }} className="block bg-muted/30 rounded-xl p-5">
          {post.type === 'agent' && (
            <div className="text-[12px] font-semibold text-primary mb-2 uppercase tracking-wider">
              {post.params?.role || 'Агент'}
            </div>
          )}
          <div className={cn(
            "text-[14px] text-muted-foreground italic leading-relaxed",
            post.type === 'agent' ? "line-clamp-3" : "line-clamp-4"
          )}>
            «{post.prompt_ru}»
          </div>
        </Link>
      ) : (
        <Link to="/community/$id" params={{ id: post.id }} className="block overflow-hidden rounded-xl">
          {media && media.length > 0 ? (
            <div className="flex flex-col gap-2">
              {media.map((item, idx) => (
                <div key={idx} className="w-full">
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      controls 
                      className="w-full aspect-video object-cover rounded-xl max-h-[380px]"
                      poster={item.thumbnail_url}
                    />
                  ) : item.type === 'audio' ? (
                    <AudioPlayer url={item.url} />
                  ) : (
                    <img 
                      src={item.url} 
                      alt="" 
                      className="w-full rounded-xl object-cover max-h-[380px]" 
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full aspect-[16/10] bg-muted/30 rounded-xl flex items-center justify-center p-8 text-center text-muted-foreground italic text-[14px]">
              «{post.prompt_ru}»
            </div>
          )}
        </Link>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <button className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[12px] font-medium hover:bg-muted transition-colors">
          <Heart size={15} />
          <span>{post.likes_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[12px] font-medium hover:bg-muted transition-colors">
          <MessageSquare size={15} />
          <span>{post.comments_count || 0}</span>
        </button>
        <button className="p-2 bg-muted/50 rounded-full hover:bg-muted transition-colors">
          <Bookmark size={15} />
        </button>
        <button 
          onClick={handleShare}
          className="p-2 bg-muted/50 rounded-full hover:bg-muted transition-colors"
        >
          <Share2 size={15} />
        </button>
        <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-[12px] font-medium ml-auto">
          <Eye size={15} />
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
  onTypeChange,
  activeTopic,
  onTopicChange,
  topicCounts,
  articleTopics,
  onChildClick
}: { 
  categories: any[],
  topAuthors: any[],
  activeType: string,
  onTypeChange: (type: string) => void,
  activeTopic: string,
  onTopicChange: (topic: string) => void,
  topicCounts: Record<string, number>,
  articleTopics: { id: string, label: string }[],
  onChildClick: (type: string, topic?: string) => void
}) {
  const [isPromptsOpen, setIsPromptsOpen] = useState(
    () => activeType === 'prompts' || ['text', 'image', 'video', 'audio', 'agent'].includes(activeType)
  );
  const [isArticlesOpen, setIsArticlesOpen] = useState(() => activeType === 'article');
  
  const ChevronDown = ({ className }: { className?: string }) => (
    <svg 
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );

  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-24">
      {/* Categories Block */}
      <div className="rounded-2xl bg-muted/30 border border-border p-5">
        <h4 className="font-bold mb-4">Категории</h4>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => {
            const hasChildren = !!cat.children;
            const isOpen = cat.value === 'prompts' ? isPromptsOpen : (cat.value === 'article' ? isArticlesOpen : false);
            
            const isChildOfPromptsActive = ['text', 'image', 'video', 'audio', 'agent'].includes(activeType);
            const isChildOfArticlesActive = activeType === 'article' && activeTopic !== 'all';

            const isActive = cat.value === 'all' 
              ? activeType === 'all' 
              : (cat.value === 'prompts' 
                  ? (activeType === 'prompts' || (!isPromptsOpen && isChildOfPromptsActive))
                  : (cat.value === 'article' 
                      ? ((activeType === 'article' && activeTopic === 'all') || (!isArticlesOpen && isChildOfArticlesActive))
                      : false));

            const handleToggle = () => {
              if (cat.value === 'all') {
                onTypeChange('all');
                return;
              }

              if (cat.value === 'prompts') {
                if (isPromptsOpen) {
                  setIsPromptsOpen(false);
                } else {
                  setIsPromptsOpen(true);
                  onTypeChange('prompts');
                }
              } else if (cat.value === 'article') {
                if (isArticlesOpen) {
                  setIsArticlesOpen(false);
                } else {
                  setIsArticlesOpen(true);
                  onTypeChange('article');
                }
              }
            };

            return (
              <div key={cat.value} className="flex flex-col">
                <button
                  type="button"
                  onClick={handleToggle}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-xl transition-colors text-left",
                    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{cat.label}</span>
                  <div className="flex items-center gap-1.5">
                    {hasChildren && (
                      <ChevronDown className={cn("transition-transform shrink-0", isOpen && "rotate-180")} />
                    )}
                    <span className="text-[12px] opacity-60 bg-muted px-2 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </div>
                </button>

                {/* Nested children */}
                {hasChildren && isOpen && (
                  <div className="flex flex-col gap-0.5 mt-1 pl-3 border-l border-border ml-3">
                    {cat.children.map((child: any) => {
                      const count = cat.value === 'article' ? topicCounts[child.value] : child.count;
                      const isChildActive = cat.value === 'article' 
                        ? (activeType === 'article' && activeTopic === child.value)
                        : (activeType === child.value);
                      
                      return (
                        <button
                          key={child.value}
                          disabled={count === 0}
                          onClick={() => onChildClick(cat.value === 'article' ? 'article' : child.value, cat.value === 'article' ? child.value : undefined)}
                          className={cn(
                            "flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors text-left text-[13px]",
                            isChildActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            count === 0 && "opacity-50"
                          )}
                        >
                          <span>{child.label}</span>
                          <span className="text-[11px] opacity-60 tabular-nums">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
        <Link 
          to="/community" 
          search={{ type: 'all', provider: 'all', sort: 'new', page: 0, topic: 'all' }}
          className="block text-center text-primary text-[13px] font-medium mt-6 hover:underline"
        >
          Все авторы
        </Link>
      </div>
    </div>
  );
}

function CommunityPage() {
  return <CommunityContent />;
}

function CommunityContent() {
  const { type, provider, sort, page, topic } = useSearch({ from: "/community" });
  const { isAuthed } = useAuth();
  const navigate = Route.useNavigate();

  const { data: postsData, isLoading: isPostsLoading, error: postsError } = useQuery({
    queryKey: ["community-posts", type, provider, sort, page, topic],
    queryFn: async () => {
      // If we are on the first page and "all" is selected, we want to fetch enough posts 
      // of each type to ensure interleaving works well.
      const isFirstPageAll = type === "all" && page === 0;
      
      let query = supabase
        .from("posts")
        .select("*")
        .eq("status", "published");

      if (type !== "all") {
        if (type === "prompts") {
          query = query.neq("type", "article");
        } else {
          query = query.eq("type", type);
          if (type === "article" && topic !== "all") {
            query = query.eq("category_slug", topic);
          }
        }
      }

      if (provider !== "all") {
        query = query.eq("provider_id", provider);
      }

      if (sort === "popular") {
        query = query.order("views", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // If we need a diverse first screen, we fetch a larger batch
      const limit = isFirstPageAll ? 50 : 15;
      const from = page * (isFirstPageAll ? 50 : 15);
      const to = from + limit - 1;
      
      const { data, error } = await query.range(from, to);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allPublishedPosts } = useQuery({
    queryKey: ["community-all-published-metadata"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("type, provider_id, category_slug")
        .eq("status", "published");
      if (error) throw error;
      return data || [];
    },
  });

  const topProviders = useMemo(() => {
    if (!allPublishedPosts) return [];
    const counts: Record<string, number> = {};
    allPublishedPosts.forEach(p => {
      if (p.provider_id) {
        counts[p.provider_id] = (counts[p.provider_id] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);
  }, [allPublishedPosts]);

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
    }).filter(a => !!a.id);
  }, [topAuthorsProfiles, allFollowsData, topAuthors]);

  const enrichedPosts = useMemo(() => {
    if (!postsData) return [];
    
    const enriched = postsData.map(post => {
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

    // Interleave types while preserving sort order (within pages)
    // types order: image -> video -> text -> audio -> agent -> article
    const typesOrder = ['image', 'video', 'text', 'audio', 'agent', 'article'];
    const buckets: Record<string, any[]> = {};
    typesOrder.forEach(t => buckets[t] = []);
    
    enriched.forEach(p => {
      const t = p.type || 'text';
      if (buckets[t]) buckets[t].push(p);
      else buckets['text'].push(p);
    });

    const result = [];
    let hasMore = true;

    while (hasMore) {
      hasMore = false;
      for (const t of typesOrder) {
        if (buckets[t].length > 0) {
          result.push(buckets[t].shift());
          hasMore = true;
        }
      }
    }

    return result;
  }, [postsData, authorsData, likesData, commentsData]);

  const articleTopics = [
    { id: 'ai-news', label: 'Новости ИИ' },
    { id: 'guides', label: 'Гайды и инструкции' },
    { id: 'model-reviews', label: 'Обзоры моделей' },
    { id: 'cases', label: 'Кейсы и опыт' },
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allPublishedPosts?.length || 0,
      text: 0,
      image: 0,
      video: 0,
      audio: 0,
      agent: 0,
      article: 0,
      prompts: 0
    };
    
    const topicCounts: Record<string, number> = {
      all: 0,
      'ai-news': 0,
      'guides': 0,
      'model-reviews': 0,
      'cases': 0
    };
    
    allPublishedPosts?.forEach(p => {
      if (counts[p.type] !== undefined) {
        counts[p.type]++;
        if (p.type === 'article') {
          topicCounts.all++;
          if (p.category_slug && topicCounts[p.category_slug] !== undefined) {
            topicCounts[p.category_slug]++;
          }
        }
        if (['text', 'image', 'video', 'audio', 'agent'].includes(p.type)) {
          counts.prompts++;
        }
      }
    });
    
    return { ...counts, topicCounts };
  }, [allPublishedPosts]);

  const categories = [
    { label: "Все", value: "all", count: (categoryCounts as any).all },
    { 
      label: "Промпты", 
      value: "prompts", 
      count: (categoryCounts as any).prompts,
      children: [
        { label: "Текст", value: "text", count: (categoryCounts as any).text },
        { label: "Изображения", value: "image", count: (categoryCounts as any).image },
        { label: "Видео", value: "video", count: (categoryCounts as any).video },
        { label: "Аудио", value: "audio", count: (categoryCounts as any).audio },
        { label: "Агенты", value: "agent", count: (categoryCounts as any).agent },
      ]
    },
    { 
      label: "Статьи", 
      value: "article", 
      count: (categoryCounts as any).article,
      children: articleTopics.map(t => ({ label: t.label, value: t.id }))
    },
  ];

  const handleTypeChange = (newType: string) => {
    if (newType === 'all') {
      navigate({ search: (prev) => ({ ...prev, type: 'all', topic: 'all', page: 0, provider: 'all' }) });
    } else if (newType === 'prompts') {
      navigate({ search: (prev) => ({ ...prev, type: 'prompts', topic: 'all', page: 0, provider: 'all' }) });
    } else if (newType === 'article') {
      navigate({ search: (prev) => ({ ...prev, type: 'article', topic: 'all', page: 0, provider: 'all' }) });
    } else {
      navigate({ search: (prev) => ({ ...prev, type: newType as any, topic: 'all', page: 0, provider: 'all' }) });
    }
  };

  const handleChildClick = (typeVal: string, topicVal?: string) => {
    if (typeVal === 'article' && topicVal) {
      navigate({ search: (prev) => ({ ...prev, type: 'article', topic: topicVal, page: 0 }) });
    } else {
      navigate({ search: (prev) => ({ ...prev, type: typeVal as any, topic: 'all', page: 0, provider: 'all' }) });
    }
  };

  const handleProviderChange = (newProvider: string) => {
    navigate({ search: (prev) => ({ ...prev, provider: newProvider, page: 0 }) });
  };

  const handleSortChange = (newSort: string) => {
    navigate({ search: (prev) => ({ ...prev, sort: newSort as any, page: 0 }) });
  };

  const handleLoadMore = () => {
    navigate({ search: (prev) => ({ ...prev, page: (prev.page || 0) + 1 }) });
  };

  const formatProviderName = (id: string) => {
    if (id === 'gpt-4o' || id === 'gpt-3.5-turbo') return 'ChatGPT';
    if (id === 'kling') return 'Kling AI';
    if (id === 'nano-banana') return 'Nano Banana';
    return id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
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
          <span>Опубликовать</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Feed Column */}
        <div className="lg:w-[70%]">
          {/* Filters & Sort */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Model Filters (Chips) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleProviderChange("all")}
                  className={cn(
                    "h-8 px-3 rounded-full text-[12px] font-medium transition-all shrink-0 border",
                    provider === "all"
                      ? "bg-primary text-white border-primary"
                      : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                  )}
                >
                  Все модели
                </button>
                {topProviders.map((pId) => (
                  <button
                    key={pId}
                    onClick={() => handleProviderChange(pId)}
                    className={cn(
                      "h-8 px-3 rounded-full text-[12px] font-medium transition-all shrink-0 border",
                      provider === pId
                        ? "bg-primary text-white border-primary"
                        : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                    )}
                  >
                    {formatProviderName(pId)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <select 
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="h-8 px-3 rounded-lg bg-secondary border border-border text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  <option value="new">Сначала новые</option>
                  <option value="popular">Популярные</option>
                </select>
              </div>
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
              <div className="flex flex-col gap-4">
                {enrichedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <div className="mt-8 text-center">
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
            activeTopic={topic}
            onTopicChange={() => {}}
            onChildClick={handleChildClick}
            topicCounts={categoryCounts.topicCounts}
            articleTopics={articleTopics}
          />
        </div>
      </div>
    </div>
  );
}



export default CommunityPage;
