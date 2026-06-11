-- Create table for user progress (no auth, keyed by email)
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  docs_submitted BOOLEAN NOT NULL DEFAULT false,
  login_ts BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (no auth in this app)
CREATE POLICY "Anyone can read progress" ON public.user_progress FOR SELECT USING (true);
CREATE POLICY "Anyone can insert progress" ON public.user_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update progress" ON public.user_progress FOR UPDATE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();