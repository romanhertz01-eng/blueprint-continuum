import { Navigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { buildAuthHref } from "@/lib/authRedirect";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthed) return <Navigate to={buildAuthHref(location.pathname)} replace />;
  return <>{children}</>;
}
