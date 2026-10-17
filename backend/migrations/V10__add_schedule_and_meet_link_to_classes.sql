-- Migration V10: Add schedule and meet_link to public.classes

ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS schedule TEXT,
ADD COLUMN IF NOT EXISTS meet_link TEXT;
