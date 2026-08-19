# Plan: Enable Article Editing for Authors

Enable authors to edit their community articles by fixing the database update policy and implementing an edit mode in the creation form, while adding entry points in the user account and article detail pages.

## Database Migration

- Update `public.posts` Row Level Security (RLS) policy for `UPDATE`.
- Fix the existing policy that caused infinite recursion/self-comparison errors.
- Ensure only authors can update their posts, and only if the post status is `pending`.

## Frontend Changes

### 1. Account Page (`src/pages/AccountPage.tsx`)
- Add a "Pencil" edit icon next to article entries in the "My Articles" tab.
- Link the icon to the `/community/new` route with `edit` and `type=article` search parameters.

### 2. Article Detail Page (`src/routes/community_.$id.tsx`)
- Add a "Edit" button in the actions bar for authors and administrators.
- Show the button only for `article` type posts.

### 3. Creation/Edit Form (`src/routes/community_.new.tsx`)
- Implement an edit mode triggered by the `edit` search parameter.
- Add `edit` to `validateSearch`.
- Fetch the existing post data using `useQuery` when in edit mode.
- Verify that the post is an article and the current user has permission (author or admin).
- Pre-fill the form with existing article data (title, excerpt, cover, body, category).
- Restrict visibility of publication kind selection (since the type is fixed).
- Update the submit handler to perform an `update` instead of an `insert` when in edit mode, resetting the status to `pending`.
- Handle cover image updates: allow keeping existing cover, replacing it, or deleting it.

## Technical Details

- **RLS Policy**:
  ```sql
  DROP POLICY IF EXISTS "Authors can update their own posts" ON public.posts;
  CREATE POLICY "Authors can update their own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id AND status = 'pending');
  ```
- **State Management**: Use a new `existingCoverUrl` state to track the original cover during edits.
- **Security**: Server-side RLS will enforce that only authors/admins can perform the update and that status must remain `pending` for non-admins (or be reset to it).
