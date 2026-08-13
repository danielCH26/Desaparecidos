-- legal-and-consent: add accepted_terms_at column for tracking acceptance of legal docs
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accepted_terms_at timestamptz;
