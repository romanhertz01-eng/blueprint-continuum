# Fix Community Feed and My Prompts tab

Address "Something went wrong" errors on `/community` and the "My Prompts" tab in `AccountPage` caused by unsupported Supabase nested queries.

## Changes

### 1. Update `/community` Route (`src/routes/community.tsx`)
- Replace `useSuspenseQuery` with `useQuery`.
- Simplify the Supabase query to select only from the `posts` table (remove `author:profiles` and `likes_count:likes`).
- Add a secondary query to fetch authors (`profiles`) by `author_id` list and map them in the component.
- Add a secondary query to fetch like counts from the `likes` table and aggregate them by `post_id`.
- Implement a skeleton/spinner for loading state.
- Add error handling to display "Не удалось загрузить промпты" instead of crashing.
- Maintain sorting by `views` for "Popular".

### 2. Update "My Prompts" Tab (`src/pages/AccountPage.tsx`)
- Refactor `MyPostsList` component to handle errors gracefully.
- Ensure the query to `posts` remains simple (already is, but double-check).
- Add specific error message "Не удалось загрузить промпты" if the query fails.

## Technical Details
- **Data Mapping**: Combine `posts`, `profiles`, and `likes` data on the client side using unique IDs.
- **Error UI**: Use a simple alert or text block to show server errors.
- **Loading UI**: Use existing `lucide-react` icons for a simple spinner or a placeholder grid.

## Constraints
- Modify only `src/routes/community.tsx` and `src/pages/AccountPage.tsx`.
- Do not change DB schema, RLS policies, or general card layout.
