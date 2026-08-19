import { ORIGIN } from "@/lib/origin";
import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { SeoRenderer } from '@/components/seo/SeoPage';
import { resolveRobots } from '@/data/seo/robots';
import { guides } from '@/data/seo/guides';

export const Route = createFileRoute('/guides/$slug')({
  loader: ({ params }) => {
    const guide = guides[params.slug];
    if (!guide) throw notFound();
    return { guide };
  },
  component: GuidePage,
  head: ({ params }) => {
    const guide = guides[params.slug];
    if (!guide) return {};
    const canonical = `${ORIGIN}/guides/${params.slug}`;
    return {
      meta: [
        { title: guide.seo.title },
        { name: 'description', content: guide.seo.description },
        { name: 'robots', content: resolveRobots(guide) },
        { property: 'og:title', content: guide.seo.ogTitle ?? guide.seo.title },
        { property: 'og:description', content: guide.seo.ogDescription ?? guide.seo.description },
        { property: 'og:url', content: canonical },
        { property: 'og:type', content: 'article' },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  },
});

function GuidePage() {
  const { guide } = Route.useLoaderData();
  return (
    <>
      <SeoRenderer def={guide} />
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
    </>
  );
}