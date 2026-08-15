import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Heart, MessageSquare, Image, Video, Music, User, LayoutGrid, ChevronRight } from "lucide-react";
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
  const firstMedia = media?.[0];
  const typeIcon = {
    text: <MessageSquare className="h-5 w-5" />,
    image: <Image className="h-5 w-5" />,
    video: <Video className="h-5 w-5" />,
    audio: <Music className="h-5 w-5" />,
    agent: <User className="h-5 w-5" />,
  }[post.type as string] || <LayoutGrid className="h-5 w-5" />;

  return (
    <a
      href={`/community/${post.id}`}
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
            <div className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
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

function CommunityPage() {
  const { type, sort, page } = useSearch({ from: "/community" });
  const { isAuthed } = useAuth();
  const navigate = Route.useNavigate();

  const { data } = useSuspenseQuery({
    queryKey: ["community-posts", type, sort, page],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(`
          *,
          author:profiles(display_name, avatar_url),
          likes_count:likes(count)
        `)
        .eq("status", "published");

      if (type !== "all") {
        query = query.eq("type", type);
      }

      if (sort === "popular") {
        // Note: Real popular sort requires a more complex query or a view
        // For now sorting by views or assuming likes count logic
        query = query.order("views", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const limit = 24;
      const from = page * limit;
      const to = from + limit - 1;
      
      const { data, error } = await query.range(from, to);
      if (error) throw error;
      return data || [];
    },
  });

  const filterChips = [
    { label: "Все", value: "all" },
    { label: "Текст", value: "text" },
    { label: "Изображения", value: "image" },
    { label: "Видео", value: "video" },
    { label: "Аудио", value: "audio" },
    { label: "Агенты", value: "agent" },
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
          <span>Опубликовать промпт</span>
        </Link>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => handleTypeChange(chip.value)}
              className={cn(
                "h-9 px-4 rounded-full text-[13px] font-medium transition-all shrink-0 border",
                type === chip.value 
                  ? "bg-primary text-white border-primary" 
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
              )}
            >
              {chip.label}
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
      {data.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((post) => (
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
            Станьте первым, кто поделится своим уникальным промптом с сообществом!
          </p>
          <Link
            to={isAuthed ? "/community/new" : buildAuthHref("/community/new")}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus size={16} />
            <span>Опубликовать первый промпт</span>
          </Link>
        </div>
      )}
    </div>
  );
}
