-- Create stories table to store generated stories and ensure uniqueness
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE,
  theme TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read stories (public feature)
CREATE POLICY "Stories are publicly readable" 
ON public.stories 
FOR SELECT 
USING (true);

-- Create index for faster hash lookups
CREATE INDEX idx_stories_content_hash ON public.stories(content_hash);

-- Create index for theme filtering
CREATE INDEX idx_stories_theme ON public.stories(theme);