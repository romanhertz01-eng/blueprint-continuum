ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected'));

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id AND status IN ('draft', 'pending'));

DROP POLICY IF EXISTS "Authors can update their own posts" ON public.posts;
CREATE POLICY "Authors can update their own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id AND status IN ('draft', 'pending'));