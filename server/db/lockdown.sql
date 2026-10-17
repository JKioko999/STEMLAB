-- ============================================================================
-- STEM-SPARK-LAB: lock the database down. Run once in the Supabase SQL Editor.
--
-- The app talks to Supabase ONLY from the server, using SUPABASE_SERVICE_ROLE_KEY.
-- The service role bypasses Row Level Security, so turning RLS on with no policies
-- blocks the public anon key completely while the app keeps working.
--
-- Make sure SUPABASE_SERVICE_ROLE_KEY is set in Vercel BEFORE running this,
-- otherwise the server will lose access too.
-- ============================================================================
ALTER TABLE public.schools           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatched_emails ENABLE ROW LEVEL SECURITY;

-- Existing accounts that still have readable passwords upgrade to hashes
-- automatically the next time each person signs in. To force it for everyone now,
-- clear the old values and have people use "Forgot password?":
--   UPDATE public.users SET password = NULL, temp_password = NULL
--   WHERE password NOT LIKE 'scrypt$%' OR temp_password NOT LIKE 'scrypt$%';

-- Old email-log rows may contain readable temporary passwords:
--   UPDATE public.dispatched_emails SET temp_password = NULL;
