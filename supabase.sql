-- Run these updates in Supabase SQL editor for full assessment compliance.

-- 0) profiles.website column is required by assignment
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS website TEXT;

-- 1) Automatically create profile row on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substring(replace(NEW.id::text, '-', '') from 1 for 12)
  );

  INSERT INTO public.profiles (id, username, first_name, last_name)
  VALUES (
    NEW.id,
    generated_username,
    NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Keep posts_count in sync
CREATE OR REPLACE FUNCTION public.sync_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET posts_count = posts_count + 1 WHERE id = NEW.author_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = OLD.author_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_count_trigger ON posts;
CREATE TRIGGER posts_count_trigger
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION public.sync_posts_count();

-- 3) Keep like_count in sync
CREATE OR REPLACE FUNCTION public.sync_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS like_count_trigger ON likes;
CREATE TRIGGER like_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION public.sync_like_count();

-- 4) Keep comment_count in sync
CREATE OR REPLACE FUNCTION public.sync_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_count_trigger ON comments;
CREATE TRIGGER comment_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION public.sync_comment_count();

-- 5) Row Level Security (strict ownership + public read where needed)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, user updates own row
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read" ON profiles
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "profiles_owner_update" ON profiles;
CREATE POLICY "profiles_owner_update" ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Posts: public read active posts, owner insert/update/delete
DROP POLICY IF EXISTS "posts_public_read_active" ON posts;
CREATE POLICY "posts_public_read_active" ON posts
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "posts_owner_insert" ON posts;
CREATE POLICY "posts_owner_insert" ON posts
FOR INSERT
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_owner_update" ON posts;
CREATE POLICY "posts_owner_update" ON posts
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_owner_delete" ON posts;
CREATE POLICY "posts_owner_delete" ON posts
FOR DELETE
USING (auth.uid() = author_id);

-- Comments: public read, owner create/delete
DROP POLICY IF EXISTS "comments_public_read" ON comments;
CREATE POLICY "comments_public_read" ON comments
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "comments_owner_insert" ON comments;
CREATE POLICY "comments_owner_insert" ON comments
FOR INSERT
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_owner_delete" ON comments;
CREATE POLICY "comments_owner_delete" ON comments
FOR DELETE
USING (auth.uid() = author_id);

-- Likes: public read, owner create/delete
DROP POLICY IF EXISTS "likes_public_read" ON likes;
CREATE POLICY "likes_public_read" ON likes
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "likes_owner_insert" ON likes;
CREATE POLICY "likes_owner_insert" ON likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_owner_delete" ON likes;
CREATE POLICY "likes_owner_delete" ON likes
FOR DELETE
USING (auth.uid() = user_id);

-- Follows: public read, owner create/delete
DROP POLICY IF EXISTS "follows_public_read" ON follows;
CREATE POLICY "follows_public_read" ON follows
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "follows_owner_insert" ON follows;
CREATE POLICY "follows_owner_insert" ON follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_owner_delete" ON follows;
CREATE POLICY "follows_owner_delete" ON follows
FOR DELETE
USING (auth.uid() = follower_id);

-- 6) Storage bucket + policies for avatars/posts uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('social_images', 'social_images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "social_images_public_read" ON storage.objects;
CREATE POLICY "social_images_public_read" ON storage.objects
FOR SELECT
USING (bucket_id = 'social_images');

DROP POLICY IF EXISTS "social_images_authenticated_upload" ON storage.objects;
CREATE POLICY "social_images_authenticated_upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'social_images');

DROP POLICY IF EXISTS "social_images_authenticated_update" ON storage.objects;
CREATE POLICY "social_images_authenticated_update" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'social_images')
WITH CHECK (bucket_id = 'social_images');

DROP POLICY IF EXISTS "social_images_authenticated_delete" ON storage.objects;
CREATE POLICY "social_images_authenticated_delete" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'social_images');
