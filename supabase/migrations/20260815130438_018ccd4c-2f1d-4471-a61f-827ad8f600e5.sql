-- 1. Profiles Table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    display_name text,
    avatar_url text,
    bio text,
    is_admin boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- 2. Posts Table
CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('text', 'image', 'video', 'audio', 'agent')),
    title text NOT NULL,
    prompt_ru text NOT NULL,
    provider_id text,
    sub_model_id text,
    params jsonb DEFAULT '{}'::jsonb NOT NULL,
    media jsonb DEFAULT '[]'::jsonb NOT NULL,
    category_slug text,
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'published', 'rejected')),
    rejection_reason text,
    views integer DEFAULT 0 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    published_at timestamptz
);

GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_posts_status_created_at ON public.posts (status, created_at);
CREATE INDEX idx_posts_author_id ON public.posts (author_id);

CREATE POLICY "Anyone can view published posts" 
ON public.posts FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authors can view their own posts" 
ON public.posts FOR SELECT 
TO authenticated 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all posts" 
ON public.posts FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Authenticated users can create posts" 
ON public.posts FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id AND status = 'pending');

CREATE POLICY "Authors can update their own posts" 
ON public.posts FOR UPDATE 
TO authenticated 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id AND status = (SELECT status FROM public.posts WHERE id = id));

CREATE POLICY "Admins can update post status" 
ON public.posts FOR UPDATE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Authors can delete their own posts" 
ON public.posts FOR DELETE 
TO authenticated 
USING (auth.uid() = author_id);

-- 3. Likes Table
CREATE TABLE public.likes (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

GRANT SELECT ON public.likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_likes_post_id ON public.likes (post_id);

CREATE POLICY "Likes are viewable by everyone" 
ON public.likes FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own likes" 
ON public.likes FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 4. Saves Table
CREATE TABLE public.saves (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

GRANT SELECT ON public.saves TO anon;
GRANT SELECT, INSERT, DELETE ON public.saves TO authenticated;
GRANT ALL ON public.saves TO service_role;

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saves are viewable by owner" 
ON public.saves FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saves" 
ON public.saves FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 5. Comments Table
CREATE TABLE public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    body text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

GRANT SELECT ON public.comments TO anon;
GRANT SELECT, INSERT, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_comments_post_id ON public.comments (post_id);

CREATE POLICY "Comments are viewable if post is published" 
ON public.comments FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND status = 'published'));

CREATE POLICY "Authenticated users can comment" 
ON public.comments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or admins can delete comments" 
ON public.comments FOR DELETE 
TO authenticated 
USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 6. Follows Table
CREATE TABLE public.follows (
    follower_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT cannot_follow_self CHECK (follower_id <> following_id)
);

GRANT SELECT ON public.follows TO anon;
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_follows_following_id ON public.follows (following_id);

CREATE POLICY "Follows are viewable by everyone" 
ON public.follows FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own follows" 
ON public.follows FOR ALL 
TO authenticated 
USING (auth.uid() = follower_id) 
WITH CHECK (auth.uid() = follower_id);

-- 7. Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_username text;
BEGIN
    new_username := SPLIT_PART(new.email, '@', 1) || LOWER(SUBSTRING(MD5(RANDOM()::text), 1, 4));
    
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (new.id, new_username, new_username);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
