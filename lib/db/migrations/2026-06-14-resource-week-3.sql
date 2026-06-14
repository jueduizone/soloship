-- Add Week 3 to course resource stages.
-- Run this in Supabase SQL Editor for existing databases.

alter type public.resource_stage add value if not exists 'week_3' before 'demo_day';
