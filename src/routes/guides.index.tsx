import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { guides } from '@/data/seo/guides';
import { Footer } from '@/components/shared/Footer';

const isEmpty = Object.keys(guides).length === 0;
const TITLE = 'Гайды по нейросетям — инструкции ЭРА2 | ERA2.ai';
const DESCRIPTION =
  'Пошаговые гайды и инструкции по нейросетям: как создавать изображения, видео, тексты и аудио в ЭРА2.';
const CANONICAL = `${ORIGIN}/guides`;

export const Route = createFileRoute('/guides/')({
  component: GuidesHub,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { name: 'robots', content: isEmpty ? 'noindex,follow' : 'index,follow' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: CANONICAL },
      { property: 'og:image', content: `${ORIGIN}/og-image.png` },
    ],
    links: [{ rel: 'canonical', href: CANONICAL }],
  }),
});

function GuidesHub() {
  const items = Object.entries(guides);
  return (
    <>
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70">Гайды</span>
        </nav>
        <h1 className="text-3xl md:text-[40px] font-bold leading-tight" style={{ color: 'var(--seo-heading)' }}>
          Гайды по нейросетям
        </h1>
        <p className="mt-4 text-[hsl(var(--muted-foreground))] max-w-2xl text-base md:text-lg">
          Пошаговые инструкции: как создавать изображения, видео, тексты и аудио в ЭРА2.
        </p>
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-16">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-[hsl(var(--muted-foreground))]">
            Первые гайды скоро
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map(([slug, g]) => (
              <Link
                key={slug}
                to="/guides/$slug"
                params={{ slug }}
                className="block rounded-2xl border border-border bg-[hsl(var(--card))] p-6 hover:border-[hsl(var(--primary))] transition-colors"
              >
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--seo-heading)' }}>
                  {g.cardTitle ?? g.seo.title}
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                  {g.seo.description}
                </p>
                <div className="mt-4 flex gap-3 text-xs font-mono text-[hsl(var(--muted-foreground))]">
                  {g.updatedAt && <span>Обновлено: {g.updatedAt}</span>}
                  {g.readingTime && <span>· {g.readingTime}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Статьи и промпты сообщества</h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl">
              Пользователи ЭРА2 разбирают модели, делятся находками и выкладывают готовые промпты с результатами.
            </p>
          </div>
          <Link 
            to="/community" 
            search={{ type: 'article', provider: 'all', sort: 'new', page: 0, topic: 'all' }}
            className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shrink-0"
          >
            Читать сообщество
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}