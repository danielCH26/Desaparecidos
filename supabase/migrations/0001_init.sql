-- Phase 1: Initial schema with RLS, auth trigger, and storage bucket
-- Applied via Supabase dashboard SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid()
        REFERENCES auth.users(id) ON DELETE CASCADE,
    cedula text UNIQUE NOT NULL,
    display_name text,
    real_phone text,
    real_email text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT cedula_format CHECK (cedula ~ '^[0-9]{6,10}$')
);

-- Reports table (missing persons)
CREATE TABLE public.reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    person_name text NOT NULL,
    person_age int,
    person_photo_url text,
    last_known_lat double precision NOT NULL,
    last_known_lng double precision NOT NULL,
    last_known_address text,
    last_seen_at timestamptz,
    contact_phone text NOT NULL,
    contact_email text,
    status text NOT NULL DEFAULT 'missing'
        CHECK (status IN ('missing', 'found', 'resolved')),
    published_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Comments table (per-report comments)
CREATE TABLE public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    body text NOT NULL
        CHECK (char_length(body) BETWEEN 1 AND 2000),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Saves table (user bookmarks)
CREATE TABLE public.saves (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (profile_id, report_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_comments_report_id ON public.comments(report_id);
CREATE INDEX idx_saves_profile_id ON public.saves(profile_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Check if user is the publisher of a report
CREATE OR REPLACE FUNCTION public.is_publisher(_report_id uuid, _uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.reports r
        WHERE r.id = _report_id AND r.published_by = _uid
    );
$$;

-- Check if user is the author of a comment
CREATE OR REPLACE FUNCTION public.is_comment_author(_comment_id uuid, _uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.comments c
        WHERE c.id = _comment_id AND c.author_id = _uid
    );
$$;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION public.is_publisher TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_comment_author TO authenticated;

-- =============================================================================
-- RLS POLICIES: profiles
-- =============================================================================

-- SELECT: owner only
CREATE POLICY "profiles_select_owner"
ON public.profiles FOR SELECT
USING (id = auth.uid());

-- UPDATE: owner only
CREATE POLICY "profiles_update_owner"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- INSERT: not allowed via RLS (trigger only)
-- DELETE: not allowed via RLS

-- =============================================================================
-- RLS POLICIES: reports
-- =============================================================================

-- SELECT: public read
CREATE POLICY "reports_select_public"
ON public.reports FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT: anon can insert with published_by=NULL, authenticated can insert their own
CREATE POLICY "reports_insert"
ON public.reports FOR INSERT
TO anon, authenticated
WITH CHECK (
    (published_by IS NULL) OR (published_by = auth.uid())
);

-- UPDATE: only publisher
CREATE POLICY "reports_update_owner"
ON public.reports FOR UPDATE
USING (public.is_publisher(id, auth.uid()));

-- DELETE: only publisher
CREATE POLICY "reports_delete_owner"
ON public.reports FOR DELETE
USING (public.is_publisher(id, auth.uid()));

-- =============================================================================
-- RLS POLICIES: comments
-- =============================================================================

-- SELECT: public read
CREATE POLICY "comments_select_public"
ON public.comments FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT: anon can insert with author_id=NULL, authenticated can insert their own
CREATE POLICY "comments_insert"
ON public.comments FOR INSERT
TO anon, authenticated
WITH CHECK (
    (author_id IS NULL) OR (author_id = auth.uid())
);

-- UPDATE: only author
CREATE POLICY "comments_update_author"
ON public.comments FOR UPDATE
USING (public.is_comment_author(id, auth.uid()));

-- DELETE: only author
CREATE POLICY "comments_delete_author"
ON public.comments FOR DELETE
USING (public.is_comment_author(id, auth.uid()));

-- =============================================================================
-- RLS POLICIES: saves
-- =============================================================================

-- SELECT: own saves only
CREATE POLICY "saves_select_owner"
ON public.saves FOR SELECT
USING (profile_id = auth.uid());

-- INSERT: own profile only
CREATE POLICY "saves_insert_owner"
ON public.saves FOR INSERT
WITH CHECK (profile_id = auth.uid());

-- DELETE: own saves only
CREATE POLICY "saves_delete_owner"
ON public.saves FOR DELETE
USING (profile_id = auth.uid());

-- UPDATE: not allowed (immutable)

-- =============================================================================
-- AUTH TRIGGER
-- =============================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cedula text;
BEGIN
    v_cedula := NEW.raw_user_meta_data->>'cedula';

    -- Validate cédula presence
    IF v_cedula IS NULL THEN
        RAISE EXCEPTION 'Cédula is required';
    END IF;

    -- Validate cédula format (digits only, 6-10 chars)
    IF v_cedula !~ '^[0-9]{6,10}$' THEN
        RAISE EXCEPTION 'Cédula must be 6-10 digits';
    END IF;

    -- Insert profile
    INSERT INTO public.profiles (id, cedula)
    VALUES (NEW.id, v_cedula);

    RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STORAGE BUCKET
-- =============================================================================

-- Create report-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'report-photos',
    'report-photos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Public read access to photos
CREATE POLICY "Public read access to report photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
    bucket_id = 'report-photos'
);

-- Authenticated only insert
CREATE POLICY "Authenticated can upload report photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'report-photos' AND owner = auth.uid()
);

-- Authenticated only update
CREATE POLICY "Authenticated can update own report photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'report-photos' AND owner = auth.uid()
);

-- Authenticated only delete
CREATE POLICY "Authenticated can delete own report photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'report-photos' AND owner = auth.uid()
);

-- =============================================================================
-- GRANTS
-- =============================================================================

-- Grant table access to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT ON public.reports TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT ON public.comments TO anon;

GRANT SELECT, INSERT, DELETE ON public.saves TO authenticated;

-- Grant sequence usage if needed
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
