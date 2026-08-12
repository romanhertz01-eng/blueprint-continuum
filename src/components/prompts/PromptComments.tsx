import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  author: string;
  text: string;
  rating: number;
  date: string;
}

interface PromptCommentsProps {
  slug: string;
}

// Детерминированные моки на основе слага
const getMockComments = (slug: string): Comment[] => {
  const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Если сид четный, возвращаем 2 комментария, если нет - 0
  if (seed % 2 !== 0) return [];

  return [
    {
      id: '1',
      author: 'Алексей',
      text: 'Отличный промпт, результат превзошел ожидания! Модель Nano Banana выдает очень чистые детали.',
      rating: 5,
      date: '12.08.2026'
    },
    {
      id: '2',
      author: 'Мария',
      text: 'Хороший результат, но пришлось немного подправить негативный промпт для удаления артефактов на фоне.',
      rating: 4,
      date: '11.08.2026'
    }
  ];
};

export function PromptComments({ slug }: PromptCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    // // BACKEND: GET /api/prompts/{slug}/comments
    setComments(getMockComments(slug));
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Вы',
      text: newComment,
      rating: rating,
      date: new Date().toLocaleDateString('ru-RU')
    };

    // // BACKEND: POST /api/prompts/{slug}/comments
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const averageRating = comments.length > 0 
    ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)
    : '0.0';

  return (
    <div className="mt-16 pt-12 border-t border-border w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">Отзывы</h2>
          <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-full border border-border">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={cn(
                    "w-3.5 h-3.5", 
                    star <= Number(averageRating) ? "fill-primary text-primary" : "text-muted-foreground/30"
                  )} 
                />
              ))}
            </div>
            <span className="text-[13px] font-medium text-foreground">{averageRating}</span>
            <span className="text-[13px] text-muted-foreground">({comments.length})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Список отзывов */}
        <div className="lg:col-span-2 space-y-8">
          {comments.length === 0 ? (
            <div className="text-muted-foreground text-[15px] italic py-8">
              Отзывов пока нет, будьте первым
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[15px]">{comment.author}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={cn(
                            "w-3 h-3", 
                            star <= comment.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[12px] text-muted-foreground">{comment.date}</span>
                </div>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {comment.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Форма отзыва */}
        <div className="bg-card border border-border rounded-2xl p-6 h-fit space-y-6">
          <h3 className="font-semibold text-[17px]">Оставить отзыв</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <span className="text-[13px] text-muted-foreground">Ваша оценка</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform active:scale-90"
                  >
                    <Star 
                      className={cn(
                        "w-6 h-6 transition-colors", 
                        star <= (hoverRating || rating) ? "fill-primary text-primary" : "text-muted-foreground/30"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[13px] text-muted-foreground">Комментарий</span>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Поделитесь вашим опытом использования..."
                className="w-full min-h-[100px] bg-muted/20 border border-border rounded-xl p-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!newComment.trim()}
              className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
            >
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
