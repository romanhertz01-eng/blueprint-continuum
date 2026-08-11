import { ORIGIN } from "@/lib/origin";
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { getPublishedItems, getPublishedTopics, countItemsByCategory, getCategories, PromptItem } from '@/data/prompts';
import { CategoryCard } from '@/components/prompts/CategoryCard';
import { PromptCard } from '@/components/prompts/PromptCard';
import { useLoadMore } from '@/components/prompts/useLoadMore';
import { TopicCloud } from '@/components/prompts/TopicCloud';

const TITLE = 'Библиотека промптов для нейросетей — готовые примеры | ERA2.ai';
const DESCRIPTION = 'Библиотека лучших промптов для ChatGPT, Midjourney, Claude и других нейросетей. Бесплатные примеры, копирование без регистрации, быстрый старт генерации в ERA2.';
const CANONICAL = `${ORIGIN}/prompts`;

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Главная", "item": `${ORIGIN}/` },
    { "@type": "ListItem", "position": 2, "name": "Промпты", "item": CANONICAL },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": TITLE,
  "description": DESCRIPTION,
  "url": CANONICAL,
};

export const Route = createFileRoute('/prompts/')({
  component: PromptsHub,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { name: 'robots', content: 'index,follow' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: CANONICAL },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: CANONICAL }],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify(breadcrumbLd) },
      { type: 'application/ld+json', children: JSON.stringify(collectionLd) },
    ],
  }),
});

function PromptsHub() {
  const items = getPublishedItems();
  const topics = getPublishedTopics();
  const categories = getCategories();
  const categoryCounts = countItemsByCategory();
  const { visible, hasMore, remaining, showMore } = useLoadMore<PromptItem>(items);

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70">Промпты</span>
        </nav>
        
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-[48px] font-bold leading-tight mb-4 text-foreground">
            Библиотека промптов ЭРА2
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Пользуйтесь бесплатно: копируйте готовые промпты без регистрации или переходите в генератор одной кнопкой для мгновенного результата.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Категории</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map(category => (
            <CategoryCard 
              key={category.slug} 
              category={category} 
              count={categoryCounts[category.slug as keyof typeof categoryCounts] || 0} 
            />
          ))}
        </div>
      </section>

      {/* Topic Chips */}
      <section className="max-w-7xl mx-auto px-6 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          <Link
            to="/prompts"
            className="px-4 py-2 rounded-full text-sm font-medium bg-[hsl(var(--primary))] text-white border border-transparent"
          >
            Все темы
          </Link>
          {topics.map(topic => (
            <Link
              key={topic.slug}
              to="/prompts/$topic"
              params={{ topic: topic.slug }}
              className="px-4 py-2 rounded-full text-sm font-medium bg-muted/30 text-muted-foreground border border-border hover:border-foreground/20 transition-colors"
            >
              {topic.cardTitle}
            </Link>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {visible.map(item => (
            <PromptCard key={item.slug} item={item} topics={topics} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mb-20">
            <button
              onClick={showMore}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Показать ещё ({remaining})
            </button>
          </div>
        )}

        <TopicCloud topics={topics} />
      </section>

      {/* SEO Text Block */}
      <section className="border-t border-border bg-muted/10">
        <div className="max-w-4xl mx-auto px-6 py-20 text-muted-foreground prose prose-sm prose-invert max-w-none">
          <div className="grid md:grid-cols-2 gap-12 text-[15px] leading-relaxed">
            <div>
              <h2 className="text-foreground text-xl font-semibold mb-4">Как пользоваться библиотекой</h2>
              <p className="mb-4">
                Библиотека промптов ЭРА2 создана, чтобы упростить ваш путь в мир генеративного искусства и ИИ-помощников. Каждый пример в нашей коллекции — это не просто текст, а проверенная комбинация параметров, настроенная под конкретные модели (от Nano Banana до GPT-4). Вы можете скопировать промпт в один клик и использовать его в любом сервисе, либо нажать «Попробовать», чтобы мы автоматически выставили все настройки в соответствующей студии ERA2.
              </p>
              <p>
                Важно понимать, что промпт для изображения кардинально отличается от промпта для видео. Если в первом случае мы описываем статичную композицию, свет и детализацию (например, 8k, Rembrandt lighting, bokeh), то для видео критически важны динамические глаголы и описание движения камеры (slow motion, cinematic pan, transformation).
              </p>
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold mb-4">Советы по генерации</h2>
              <p className="mb-4">
                Хотя интерфейс ЭРА2 поддерживает русский язык, для многих специализированных моделей английские промпты до сих пор работают точнее. Это связано с тем, что большинство базовых датасетов для обучения нейросетей были на английском языке. В нашей библиотеке мы предоставляем обе версии, чтобы вы могли сравнить результат и выбрать наиболее подходящий вариант.
              </p>
              <p>
                Не бойтесь экспериментировать: меняйте объекты, цветовую гамму или стиль в готовых шаблонах. Используйте блок «Что менять», который есть у каждого промпта, чтобы быстро адаптировать идею под свои задачи. Помните, что нейросети — это инструмент сотворчества, где ваш запрос задает вектор, а ИИ наполняет его деталями.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
