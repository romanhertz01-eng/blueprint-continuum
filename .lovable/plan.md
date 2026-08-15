# Database Schema Implementation for Community Section

This plan outlines the implementation of the database schema and security policies for the community section, using Lovable Cloud (Supabase). No frontend changes will be made.

## User Review Required

> [!IMPORTANT]
> - The system will automatically create user profiles upon registration in `auth.users`.
> - A storage bucket named `posts` will be created for media uploads.
> - Row Level Security (RLS) will be strictly enforced on all tables.

## Proposed Changes

### Database Migrations

#### 1. Tables and Relationships
- **`profiles`**: User metadata linked to authentication.
- **`posts`**: Community posts with types (text, image, video, etc.) and moderation status.
- **`likes` & `saves`**: User interactions with posts.
- **`comments`**: User discussions on posts.
- **`follows`**: User-to-user follows with self-follow prevention.

#### 2. Security & RLS Policies
- Public read access for published content.
- Restrictive write access: users can only manage their own data.
- Admin-only fields and actions (e.g., `is_admin` toggle, post `status` updates).

#### 3. Automation
- **Trigger**: Automatically creates a profile entry when a new user signs up, generating a username from their email.

#### 4. Storage
- **`posts` bucket**: Configured for public reading and authenticated writing, with a 50MB file size limit.

## Technical Details

### Tables Schema
- `profiles`: `id (uuid, pk)`, `username (text, unique)`, `display_name (text)`, `avatar_url (text)`, `bio (text)`, `is_admin (boolean)`, `created_at (timestamptz)`.
- `posts`: `id (uuid, pk)`, `author_id (uuid -> profiles)`, `type (text)`, `title (text)`, `prompt_ru (text)`, `provider_id (text)`, `sub_model_id (text)`, `params (jsonb)`, `media (jsonb)`, `category_slug (text)`, `status (text)`, `rejection_reason (text)`, `views (int)`, `created_at (timestamptz)`, `published_at (timestamptz)`.
- `likes` / `saves`: `user_id (uuid -> profiles)`, `post_id (uuid -> posts)`, `created_at`.
- `comments`: `id (uuid, pk)`, `post_id (uuid -> posts)`, `author_id (uuid -> profiles)`, `body (text)`, `created_at`.
- `follows`: `follower_id (uuid -> profiles)`, `following_id (uuid -> profiles)`, `created_at`.

### RLS Summary
- `profiles`: Read: all. Write: owner (except `is_admin`).
- `posts`: Read: all (if published) / author / admin. Write: owner (pending status only). Status change: admin only.
- `likes/saves/follows`: Read: all. Write: owner.
- `comments`: Read: all (if post published). Create: authenticated. Delete: owner/admin.

### Grants
- Explicit `GRANT` statements for `authenticated`, `anon`, and `service_role` as required by Lovable Cloud best practices.
