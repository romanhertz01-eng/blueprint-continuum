import { useState } from 'react';

export function useLoadMore<T>(items: T[], initial = 12, step = 12) {
  const [visibleCount, setVisibleCount] = useState(initial);

  const visible: T[] = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const remaining = items.length - visibleCount;

  const showMore = () => {
    setVisibleCount((prev) => prev + step);
  };

  return {
    visible,
    hasMore,
    remaining: remaining > 0 ? remaining : 0,
    showMore,
  };
}
