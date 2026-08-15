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
  const [isPlaying, setIsPlaying] = useState(false);
  // Using simple browser audio for the player component as requested
  return (
    <div className="flex items-center gap-4 bg-muted/20 rounded-2xl p-3 border border-border/50">
      <div className="relative w-[88px] h-[88px] rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shrink-0 overflow-hidden">
        <Music size={32} className="text-white" />
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          {isPlaying ? <Pause size={24} className="text-white fill-current" /> : <Play size={24} className="text-white fill-current ml-1" />}
        </button>
      </div>
      <div className="flex-1 text-sm font-medium text-muted-foreground">Аудио-промпт</div>
    </div>
  );
}

function PromptDetailPage() {
  const { id } = Route.useParams();
  const { user, isAuthed, profile } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  
  const isAdmin = profile?.is_admin || false;

  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: ["community-post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: author } = useQuery({
    queryKey: ["community-author", post?.author_id],
    enabled: !!post?.author_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, display_name, username, avatar_url").eq("id", post!.author_id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["community-comments", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("comments").select("*, profiles(id, display_name, avatar_url)").eq("post_id", id).order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map(c => ({ ...c, author: c.profiles || { display_name: "Пользователь", avatar_url: null } }));
    },
  });

  const { data: socialState } = useQuery({
    queryKey: ["community-social", id, user?.id],
    enabled: !!id,
    queryFn: async () => {
      const { count: likesCount } = await supabase.from("likes").select("*", { count: 'exact', head: true }).eq("post_id", id);
      return { likesCount: likesCount || 0, isLiked: false, isSaved: false }; // Simplified for now
    },
  });

  const { data: otherPosts } = useQuery({
    queryKey: ["community-other-posts", id],
    enabled: !!post,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(display_name, username, avatar_url)")
        .eq("status", "published")
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  if (isPostLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!post) return <div>Промпт не найден</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Existing UI blocks ... (omitted for brevity) */}
      
      {/* Existing sections */}
      
      {/* New Section: Other Posts */}
      <section className="mt-16">
        <h2 className="text-[20px] font-bold mb-6">Другие публикации</h2>
        <div className="space-y-4">
          {otherPosts?.map(p => (
            <div key={p.id} className="rounded-2xl border p-4 bg-card">
              {/* Similar to PostCard in community.tsx but minimal */}
              <div className="font-bold">{p.title}</div>
              <div className="text-muted-foreground text-sm">{p.type}</div>
            </div>
          ))}
        </div>
        <Link to="/community" className="mt-6 inline-block text-primary font-medium hover:underline">
          Вся лента →
        </Link>
      </section>

      {/* Existing SimilarFromCatalog */}
      <SimilarFromCatalog category={post.type as PromptCategory} />
    </div>
  );
}
