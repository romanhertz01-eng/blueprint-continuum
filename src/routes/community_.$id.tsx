import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ORIGIN } from "@/lib/origin";
import { useState, useMemo, useRef, useEffect } from "react";
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
  MessageSquare,
  UserPlus
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
import { sanitizeArticleHtml } from "@/lib/sanitizeArticleHtml";
import { guides } from '@/data/seo/guides';

export const Route = createFileRoute("/community_/$id")({
  loader: async ({ params }) => {
    try {
      const { data } = await supabase
        .from("posts")
        .select("id, title, type, status, excerpt, cover_url, prompt_ru, media, created_at, published_at, author:profiles(username, display_name)")
        .eq("id", params.id)
        .maybeSingle();
      return { post: data ?? null };
    } catch (e) {
      return { post: null };
    }
  },
  head: ({ params, loaderData }) => {
    if (!loaderData?.post) return {};

    const post = loaderData.post as any;
    const isArticle = post.type === 'article';
    const canonical = `${ORIGIN}/community/${params.id}`;
    const isPublished = post.status === 'published';

    // Title logic
    const title = isArticle 
      ? `${post.title} | ERA2.ai` 
      : `${post.title} — промпт | ERA2.ai`;

    // Description logic
    let description = isArticle ? (post.excerpt || "") : (post.prompt_ru || "");
    if (!description) description = "Публикация в сообществе ERA2.ai";
    
    // Clean HTML and collapse whitespace
    description = description
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }

    // Image logic
    let imageUrl = `${ORIGIN}/og-image.png`;
    if (isArticle && post.cover_url) {
      imageUrl = post.cover_url;
    } else if (!isArticle && Array.isArray(post.media)) {
      const firstImage = post.media.find((m: any) => m.type === 'image');
      if (firstImage?.url) {
        imageUrl = firstImage.url;
      }
    }

    if (imageUrl.startsWith('/')) {
      imageUrl = `${ORIGIN}${imageUrl}`;
    }

    const robots = isPublished ? "index, follow" : "noindex, nofollow";

    const scripts: any[] = [];
    if (isPublished) {
      // BreadcrumbList
      const breadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Главная",
            "item": `${ORIGIN}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Сообщество",
            "item": `${ORIGIN}/community`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": canonical
          }
        ]
      };
      scripts.push({ type: "application/ld+json", children: JSON.stringify(breadcrumbs) });

      // Article Schema
      if (isArticle) {
        const author = post.author as any;
        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": description,
          "image": imageUrl,
          "datePublished": post.published_at || post.created_at,
          "dateModified": post.published_at || post.created_at,
          "mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
          "author": {
            "@type": "Person",
            "name": author?.display_name || "Автор ERA2",
            ...(author?.username ? { "url": `${ORIGIN}/u/${author.username}` } : {})
          },
          "publisher": {
            "@type": "Organization",
            "name": "ERA2.ai",
            "url": ORIGIN,
            "logo": { "@type": "ImageObject", "url": `${ORIGIN}/og-image.png` }
          }
        };
        scripts.push({ type: "application/ld+json", children: JSON.stringify(articleSchema) });
      }
    }

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: robots },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:type", content: isArticle ? "article" : "website" },
        { property: "og:image", content: imageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: imageUrl },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts
    };
  },
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
  return <PromptDetailContent />;
}

function PromptDetailContent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, isAuthed, profile } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
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

  const isArticle = post?.type === 'article';

  // Preparation of article body and headings
  const { processedHtml, headings } = useMemo(() => {
    if (!isArticle || !post?.body_html) return { processedHtml: "", headings: [] };

    let html = sanitizeArticleHtml(post.body_html);
    const headingsList: { id: string; text: string; level: number }[] = [];
    let counter = 0;

    // Regex to match h2 and h3 tags
    const headingRegex = /<(h[23])([^>]*)>(.*?)<\/h[23]>/gi;

    const newHtml = html.replace(headingRegex, (match, tag, attrs, content) => {
      const level = tag.toLowerCase() === 'h2' ? 2 : 3;
      // Extract text content without tags
      const text = content.replace(/<[^>]*>?/gm, '').trim();
      
      // Check if it already has an id
      const idMatch = attrs.match(/id=["'](.*?)["']/);
      let headingId = idMatch ? idMatch[1] : `s${++counter}`;
      
      headingsList.push({ id: headingId, text, level });

      if (idMatch) return match;
      return `<${tag} id="${headingId}"${attrs}>${content}</${tag}>`;
    });

    return { processedHtml: newHtml, headings: headingsList };
  }, [post?.body_html, isArticle]);

  // Active section tracking
  useEffect(() => {
    if (!isArticle || headings.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeaders = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);

        if (visibleHeaders.length > 0) {
          setActiveSectionId(visibleHeaders[0].target.id);
        }
      },
      {
        rootMargin: "-100px 0px -70% 0px",
        threshold: 0
      }
    );

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isArticle, headings]);

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
    queryKey: ["community-other-posts", id, post?.type],
    enabled: !!post,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("type", post!.type)
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

  // 7. Load Sidebar Categories & Authors
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

  const communityGuides = useMemo(() => {
    return Object.entries(guides)
      .filter(([_, g]) => g.status === 'published')
      .slice(0, 3)
      .map(([slug, g]) => ({
        slug,
        title: g.cardTitle || g.seo.title,
        readingTime: g.readingTime
      }));
  }, []);

  const categories = [
    { label: "Все", value: "all", count: categoryCounts.all },
    { label: "Текст", value: "text", count: categoryCounts.text },
    { label: "Изображения", value: "image", count: categoryCounts.image },
    { label: "Видео", value: "video", count: categoryCounts.video },
    { label: "Аудио", value: "audio", count: categoryCounts.audio },
    { label: "Агенты", value: "agent", count: categoryCounts.agent },
  ];

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
    navigate({ to: "/community", search: { type: type as any, provider: 'all', sort: 'new', page: 0, topic: 'all' } });
  };

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
      prompt: post.prompt_ru || "",
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
          search={{ type: 'all', provider: 'all', sort: 'new', page: 0, topic: 'all' }}
          className="text-primary font-medium hover:underline"
        >
          Вернуться в сообщество
        </Link>
      </div>
    );
  }

  const media = (post.media as any[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Column */}
        <div className="lg:w-[70%]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px] text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
        <ChevronRight size={14} />
        <Link 
          to="/community" 
          search={{ type: 'all', provider: 'all', sort: 'new', page: 0, topic: 'all' }}
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
          "mb-6 p-4 rounded-2xl border flex items-center gap-3",
          post.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-destructive/10 border-destructive/20 text-destructive"
        )}>
          <AlertCircle size={20} />
          <div>
            <div className="font-semibold">
              {post.status === 'pending' 
                ? (isArticle ? "Статья на проверке" : "Промпт на проверке")
                : (isArticle ? "Статья отклонена" : "Промпт отклонён")}
            </div>
            {post.status === 'rejected' && post.rejection_reason && (
              <div className="text-sm opacity-90">{post.rejection_reason}</div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-[26px] font-bold text-foreground mb-4 leading-tight">
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
      {!isArticle && media.length > 0 && (
        <div className="space-y-4 mb-6">
          {media.map((item, idx) => (
            <div key={idx} className="w-full max-w-[560px] mx-auto rounded-2xl overflow-hidden bg-muted">
              {item.type === 'image' && (
                <img src={item.url} alt="" className="w-full h-auto block" />
              )}
              {item.type === 'video' && (
                <video src={item.url} controls className="w-full aspect-video object-cover" poster={item.poster} />
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

      {/* Article Content */}
      {isArticle && (
        <>
          {post.cover_url && (
            <img src={post.cover_url} alt="" className="w-full aspect-[16/9] object-cover rounded-2xl mb-6" />
          )}
          {post.excerpt && (
            <p className="text-[17px] leading-relaxed text-muted-foreground mb-8">
              {post.excerpt}
            </p>
          )}
          <div 
            className="article-body mb-10" 
            dangerouslySetInnerHTML={{ __html: processedHtml }} 
          />
        </>
      )}

      {/* Prompt Block */}
      {!isArticle && (
        <div className="mb-6">
          <h3 className="text-[14px] font-bold mb-3 uppercase tracking-wider text-muted-foreground">Промпт</h3>
          <div className="relative group">
            <div className="absolute top-3 right-3 z-10">
              <CopyPromptButton text={post.prompt_ru || ""} />
            </div>
            <div className="bg-muted/30 border border-border rounded-2xl p-5 pt-12 md:pt-5 md:pr-36 text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
              {post.prompt_ru}
            </div>
          </div>
        </div>
      )}

      {/* Info & Handoff */}
      {!isArticle && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b border-border">
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
      )}

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-4 mb-12",
        isArticle && "pt-6 border-t border-border"
      )}>
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
      <section className="bg-card border border-border rounded-[24px] p-5 md:p-6">
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
      {otherPosts && otherPosts.length >= 2 && (
        <section className="mt-6 pt-6 border-t border-border">
          <h2 className="text-[18px] font-bold mb-6">Другие публикации</h2>
          <div className="flex flex-col gap-4">
            {otherPosts.map((otherPost) => (
              <PostCardMinimal key={otherPost.id} post={otherPost} />
            ))}
          </div>
          <Link 
            to="/community" 
          search={{ type: 'all', provider: 'all', sort: 'new', page: 0, topic: 'all' }}
            className="mt-8 inline-flex items-center text-primary font-bold hover:underline"
          >
            Вся лента
            <ArrowRight size={16} className="ml-1.5" />
          </Link>
        </section>
      )}

      {/* Similar from Catalog */}
      {!isArticle && <SimilarFromCatalog category={post.type as PromptCategory} />}
    </div>

        {/* Sidebar Column */}
        <aside className="lg:w-[30%]">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            {/* Table of Contents */}
            {isArticle && headings.length >= 2 && (
              <div className="rounded-2xl bg-muted/30 border border-border p-5">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-4">На этой странице</h4>
                <div className="flex flex-col gap-0.5">
                  {headings.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        const el = document.getElementById(h.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={cn(
                        "w-full text-left py-2 px-3 rounded-xl transition-colors leading-snug",
                        h.level === 2 ? "text-[14px]" : "text-[13px] pl-6",
                        activeSectionId === h.id 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {h.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Categories Block */}
            <div className="rounded-2xl bg-muted/30 border border-border p-5">
              <h4 className="font-bold mb-4 text-[16px]">Категории</h4>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleTypeChange(cat.value)}
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-xl transition-colors text-left text-[14px]",
                      "hover:bg-muted text-muted-foreground hover:text-foreground"
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
              <h4 className="font-bold mb-4 text-[16px]">Топ авторов</h4>
              <div className="flex flex-col gap-4">
                {enrichedTopAuthors.map((author, idx) => (
                  <Link
                    key={author.id}
                    to="/u/$username"
                    params={{ username: author.username! }}
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
                      <div className="font-semibold text-[14px] text-foreground group-hover:text-primary transition-colors truncate">
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

            {/* Similar Community Posts Sidebar Block */}
            {sidebarSimilar && sidebarSimilar.length > 0 && (
              <div className="rounded-2xl bg-muted/30 border border-border p-5">
                <h4 className="font-bold mb-4 text-[16px]">Похожее</h4>
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

            {/* Guides block */}
            {isArticle && communityGuides.length > 0 && (
              <div className="rounded-2xl bg-muted/30 border border-border p-5">
                <h3 className="font-bold mb-4 text-[16px]">Гайды ЭРА2</h3>
                <div className="flex flex-col gap-3">
                  {communityGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      to="/guides/$slug"
                      params={{ slug: guide.slug }}
                      className="block group"
                    >
                      <p className="text-[14px] font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                        {guide.title}
                      </p>
                      {guide.readingTime && (
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {guide.readingTime}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
                <Link 
                  to="/guides" 
                  className="block text-center text-primary text-[13px] font-medium mt-5 hover:underline"
                >
                  Все гайды
                </Link>
              </div>
            )}
          </div>
        </aside>
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

function SimilarFromCatalog({ category }: { category: string }) {
  const similarItems = useMemo(() => {
    // Map community post type to catalog category (e.g. agent -> agents)
    const normalizedCategory = category === 'agent' ? 'agents' : category;
    
    return promptItems
      .filter(item => item.category === normalizedCategory && item.status === 'published')
      .slice(0, 4);
  }, [category]);

  if (similarItems.length < 2) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[18px] font-bold">Похожее из каталога ERA2</h2>
        <Link 
          to="/prompts" 
          className="text-[14px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
        >
          Весь каталог
          <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {similarItems.map((item, idx) => (
          <CatalogCard 
            key={`${item.topicSlug}-${item.slug}`} 
            item={item} 
            index={idx}
          />
        ))}
      </div>
    </section>
  );
}





