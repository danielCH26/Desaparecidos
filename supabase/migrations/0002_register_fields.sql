-- Update handle_new_user() to also capture real_email and real_phone from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cedula text := NEW.raw_user_meta_data->>'cedula';
  v_display_name text := NEW.raw_user_meta_data->>'display_name';
  v_real_email text := NEW.raw_user_meta_data->>'real_email';
  v_real_phone text := NEW.raw_user_meta_data->>'real_phone';
BEGIN
  -- Cédula: required, digits only, 6–10 chars
  IF v_cedula IS NULL OR v_cedula !~ '^[0-9]{6,10}$' THEN
    RAISE EXCEPTION 'Cédula missing or malformed: %', COALESCE(v_cedula, 'NULL');
  END IF;
  -- Email: optional, but if present must be valid format
  IF v_real_email IS NOT NULL AND v_real_email <> '' AND v_real_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
    RAISE EXCEPTION 'Email format invalid';
  END IF;
  -- Phone: optional, but if present must be valid format
  IF v_real_phone IS NOT NULL AND v_real_phone <> '' AND v_real_phone !~ '^\+?[\d\s-]{7,20}$' THEN
    RAISE EXCEPTION 'Phone format invalid';
  END IF;
  INSERT INTO public.profiles (id, cedula, display_name, real_email, real_phone)
  VALUES (
    NEW.id,
    v_cedula,
    NULLIF(v_display_name, ''),
    NULLIF(v_real_email, ''),
    NULLIF(v_real_phone, '')
  );
  RETURN NEW;
END; $$;
