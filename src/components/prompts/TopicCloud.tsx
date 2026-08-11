import { Link } from '@tanstack/react-router';
import { PromptTopic } from '@/data/prompts/types';
import { getItemsByTopic } from '@/data/prompts';
import { cn } from '@/lib/utils';

interface TopicCloudProps {
  topics: PromptTopic[];
}

export const TopicCloud = ({ topics }: TopicCloudProps) => {
  // Фильтруем темы с 0 промптов и считаем количество
  const topicsWithCounts = topics
    .map(topic => ({
      ...topic,
      count: getItemsByTopic(topic.slug).length
    }))
    .filter(t => t.count > 0);

  if (topicsWithCounts.length === 0) return null;

  // Определяем пороги для размеров шрифта
  const counts = topicsWithCounts.map(t => t.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const range = max - min;
  
  const getFontSizeClass = (count: number) => {
    if (range === 0) return 'text-base';
    const percent = (count - min) / range;
    if (percent > 0.7) return 'text-xl md:text-2xl font-semibold';
    if (percent > 0.3) return 'text-base md:text-lg font-medium';
    return 'text-sm md:text-base';
  };

  return (
    <section className="py-12 border-t border-border mt-12">
      <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Все темы
      </h2>
      <div className="flex flex-wrap gap-x-6 gap-y-4 items-center">
        {topicsWithCounts.map((topic) => (
          <Link
            key={topic.slug}
            to="/prompts/$topic"
            params={{ topic: topic.slug }}
            className={cn(
              "transition-colors hover:text-[hsl(var(--primary))] text-muted-foreground",
              getFontSizeClass(topic.count)
            )}
          >
            {topic.cardTitle || topic.title}
            <span className="ml-1.5 text-xs opacity-50 font-normal">({topic.count})</span>
          </Link>
        ))}
      </div>
    </section>
  );
};
