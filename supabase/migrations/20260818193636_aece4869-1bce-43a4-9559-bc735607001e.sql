UPDATE public.posts
SET body_html = replace(body_html, '<a href="/workspace">Воркспейсе</a>', '<a href="/agents">разделе Агенты</a>')
WHERE type = 'article' AND body_html LIKE '%/workspace%';

UPDATE public.posts
SET body_html = replace(body_html, '<a href="https://era2.ai">сайте ЭРА2</a>', '<a href="/prompts">библиотеке промптов</a>')
WHERE type = 'article' AND body_html LIKE '%era2.ai%';

UPDATE public.posts
SET body_html = replace(body_html, '<a href="/community">разделе Аудио</a>', '<a href="/audio">разделе Аудио</a>')
WHERE type = 'article' AND body_html LIKE '%разделе Аудио%';