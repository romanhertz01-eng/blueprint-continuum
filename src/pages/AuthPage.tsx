import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { SiTelegram, SiGoogle, SiVk } from "@icons-pack/react-simple-icons";
import { readSafeNext } from "@/lib/authRedirect";

import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const { isAuthed, isLoading } = useAuth();
  const navigate = useNavigate();
  const getNext = () => {
    if (typeof window === "undefined") return "/";
    return readSafeNext(window.location.search) ?? "/";
  };

  useEffect(() => {
    if (!isLoading && isAuthed) {
      navigate({ to: getNext() });
    }
  }, [isAuthed, isLoading, navigate]);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timeLeft, setTimeLeft] = useState(3 * 24 * 3600);

  useEffect(() => {
    const saved = localStorage.getItem("era2_signup_timer_start");
    if (!saved) {
      localStorage.setItem("era2_signup_timer_start", String(Date.now()));
    } else {
      const elapsed = Math.floor((Date.now() - parseInt(saved)) / 1000);
      setTimeLeft(Math.max(0, 3 * 24 * 3600 - elapsed));
    }
    const interval = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    document.title = mode === "login" ? "ERA2 — Вход" : "ERA2 — Регистрация";
    setError(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            }
          }
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
      // Redirect handled by useEffect
    } catch (err: any) {
      const message = err.message || "Произошла ошибка";
      if (message.includes("Invalid login credentials")) {
        setError("Неверный email или пароль");
      } else if (message.includes("User already registered")) {
        setError("Пользователь с таким email уже зарегистрирован");
      } else if (message.includes("Password should be")) {
        setError("Пароль должен быть не менее 6 символов");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocial = async () => {
    setError(null);
    setIsSubmitting(true);
    
    const demoEmail = "demo@era2.ai";
    const demoPassword = "Era2-Demo-9f3kQx7w";
    const demoName = "Демо-пользователь";

    try {
      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (signInError) {
        // If user doesn't exist, sign up
        if (signInError.message.includes("Invalid login credentials")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              data: {
                display_name: demoName,
              }
            }
          });

          if (signUpError) throw signUpError;

          // After successful signup, sign in
          const { error: secondSignInError } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword,
          });

          if (secondSignInError) throw secondSignInError;
        } else {
          throw signInError;
        }
      }
      // Redirect handled by useEffect
    } catch (err: any) {
      const message = err.message || "";
      if (message.includes("weak")) {
        setError("Пароль демо-аккаунта отклонён сервером");
      } else if (message.includes("Email not confirmed")) {
        setError("Включено подтверждение почты — отключите его в настройках Auth");
      } else {
        setError(message || "Не удалось выполнить демо-вход. Пожалуйста, попробуйте позже.");
      }
      console.error("Demo login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const SocialButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <button
      type="button"
      onClick={handleSocial}
      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[14px] text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-accent/40"
      style={{
        background: "hsl(var(--secondary))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const inputStyle = {
    background: "hsl(var(--secondary))",
    border: "1px solid hsl(var(--border))",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,84,32,0.12) 0%, transparent 60%), hsl(var(--background))",
      }}
    >
      <div
        className="w-full max-w-md rounded-[22px] p-8 shadow-xl"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {/* Logo */}
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), #ff7a3d)",
            boxShadow: "0 8px 22px -8px rgba(232,84,32,0.55)",
          }}
        >
          E
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-2">
          {mode === "login" ? "Вход в ERA2" : "Создать аккаунт"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-7">
          {mode === "login"
            ? "90+ нейросетей в одном месте"
            : "Получите 100 бесплатных кредитов при регистрации"}
        </p>

        {mode === "register" && (
          <div
            className="rounded-[12px] p-3 text-center mb-4"
            style={{
              background: "rgba(232,84,32,0.1)",
              border: "1px solid rgba(232,84,32,0.2)",
            }}
          >
            <div className="text-[13px] font-medium" style={{ color: "hsl(var(--primary))" }}>
              +100 кредитов на 3 дня для генерации!
            </div>
            <div className="text-xl font-mono font-bold mt-1 text-foreground">
              {pad(hours)} : {pad(mins)} : {pad(secs)}
            </div>
          </div>
        )}

        {/* Social buttons */}
        <div className="mb-5">
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <SocialButton icon={<SiTelegram size={18} color="#26A5E4" />} label="Telegram" />
            <SocialButton icon={<span className="text-[18px] leading-none font-bold" style={{ color: "#FC3F1D" }}>Я</span>} label="Яндекс" />
            <SocialButton icon={<SiGoogle size={18} color="#4285F4" />} label="Google" />
            <SocialButton icon={<SiVk size={18} color="#0077FF" />} label="VK" />
          </div>
          <p className="text-[12px] text-muted-foreground text-center">
            Вход через соцсети скоро — пока это демо-доступ
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">или по email</span>
          <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-[14px] text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
                style={inputStyle}
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-[14px] text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
              style={inputStyle}
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3 rounded-[14px] text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === "login" && (
            <div className="text-right">
              <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Забыли пароль?
              </button>
            </div>
          )}

          {error && (
            <div className="text-xs text-destructive text-center bg-destructive/10 py-2 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-[14px] text-sm font-semibold text-white transition-all hover:opacity-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), #ff7a3d)",
              boxShadow: "0 8px 22px -8px rgba(232,84,32,0.55)",
            }}
          >
            <span>{isSubmitting ? "Загрузка..." : (mode === "login" ? "Войти" : "Создать аккаунт")}</span>
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-sm text-muted-foreground text-center mt-6">
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-primary font-medium hover:underline"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>

        {/* Footer */}
        {/* TODO: вернуть ссылки при появлении /legal/* */}
        <p className="text-[11px] text-muted-foreground text-center mt-6 leading-relaxed">
          Регистрируясь, вы соглашаетесь с обработкой персональных данных и условиями использования.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
