-- Migration: Add department and municipality columns to reports
-- Date: 2024

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS municipality text;
