# Plan - Post Publication Page

Create a post publication page at `/community/new` for authorized users to share content with the community.

## User Interface
- **Route**: `/community/new` (protected by `RequireAuth`).
- **Post Type Selection**: Row of 5 chips (Text, Image, Video, Audio, Agent) using existing modality styles.
- **Title**: Input field, required, max 120 chars, with counter.
- **Prompt**: Textarea, required, max 4000 chars, min-height 160px.
- **Model**: Optional input with placeholder "Например: Kling AI, ChatGPT".
- **Category**: Dropdown dependent on post type (from `promptTopics` or `agentTopics`).
- **Files**: Upload zone for up to 3 files, max 50MB each (hidden for "Text").
  - Uploads to `posts` bucket in user-id folders.
  - Preview thumbnails with remove button.
- **Actions**: "Опубликовать" (save to `posts` table as `pending`) and "Отмена" (back).
- **Feedback**: Success message redirects to `/account`. Russian error messages for failures.
- **Style**: ERA2 design language (rounded corners, theme tokens, existing UI components).

## Technical Implementation
- Create `src/routes/community.new.tsx` for the publication page.
- Implement file upload logic using Supabase storage.
- Update `UserDropdown.tsx` to restore standard PRO/FREE badge logic (independent of `is_admin`).
- Ensure RLS policies created in previous steps are respected.

## User Review Required
- None at this stage.
