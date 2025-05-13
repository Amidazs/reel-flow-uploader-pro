
-- Enable RLS on the video_uploads table
ALTER TABLE public.video_uploads ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own videos
CREATE POLICY "Users can view their own videos"
ON public.video_uploads
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own videos
CREATE POLICY "Users can insert their own videos"
ON public.video_uploads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos"
ON public.video_uploads
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON public.video_uploads
FOR DELETE
USING (auth.uid() = user_id);

-- Allow anonymous uploads (for unauthenticated users)
CREATE POLICY "Allow anonymous uploads"
ON public.video_uploads
FOR INSERT
WITH CHECK (user_id IS NULL);
