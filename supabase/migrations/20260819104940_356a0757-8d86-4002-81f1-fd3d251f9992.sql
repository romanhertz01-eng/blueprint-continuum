DROP POLICY IF EXISTS "Authors can update their own posts" ON public.posts;
CREATE POLICY "Authors can update their own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id AND status = 'pending');

GRANT UPDATE ON public.posts TO authenticated;
