-- ============================================================================
-- STEM-SPARK-LAB: SUPABASE POSTGRESQL DATABASE SCHEMA
-- ============================================================================
-- Copy and paste this script directly into your Supabase Dashboard SQL Editor
-- to provision all tables, relations, and indexes.
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Schools Table
CREATE TABLE IF NOT EXISTS public.schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT,
  county TEXT NOT NULL,
  sub_county TEXT,
  category TEXT NOT NULL CHECK (category IN ('National', 'Extra-County', 'County', 'Sub-County', 'Private')),
  subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('Basic', 'Standard KCSE Prep', 'Institutional Pro')),
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  phone TEXT,
  total_students INTEGER DEFAULT 0,
  total_teachers INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users Table (Super Admin, School Admin, Teachers, Students)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'school_admin', 'teacher', 'student')),
  admission_number TEXT,
  subject_specialization TEXT,
  class_id TEXT,
  class_name TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  avatar_color TEXT,
  must_change_password BOOLEAN DEFAULT FALSE,
  temp_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Classes / Form Streams Table
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  form_year INTEGER NOT NULL CHECK (form_year IN (1, 2, 3, 4)),
  teacher_id TEXT,
  teacher_name TEXT,
  subject TEXT NOT NULL,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Experiments Table (Global, School, Teacher Tiers)
CREATE TABLE IF NOT EXISTS public.experiments (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL CHECK (subject IN ('chemistry', 'physics', 'biology')),
  title TEXT NOT NULL,
  kcse_paper TEXT NOT NULL,
  topic TEXT NOT NULL,
  objectives JSONB DEFAULT '[]'::jsonb,
  estimated_duration_minutes INTEGER DEFAULT 45,
  apparatus JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  simulation_type TEXT NOT NULL,
  simulation_config JSONB DEFAULT '{}'::jsonb,
  answer_sheet JSONB DEFAULT '[]'::jsonb,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('global', 'school', 'teacher')),
  school_id TEXT REFERENCES public.schools(id) ON DELETE SET NULL,
  teacher_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  cloned_from TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  experiment_id TEXT NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  experiment_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  kcse_paper TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam')),
  deadline TIMESTAMPTZ NOT NULL,
  time_limit_minutes INTEGER DEFAULT 45,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  total_enrolled_students INTEGER DEFAULT 0,
  submitted_count INTEGER DEFAULT 0
);

-- 7. Practical Attempts Table
CREATE TABLE IF NOT EXISTS public.attempts (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assignment_id TEXT REFERENCES public.assignments(id) ON DELETE SET NULL,
  is_practice_open_lab BOOLEAN DEFAULT FALSE,
  experiment_id TEXT NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  experiment_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_admission TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  class_id TEXT,
  class_name TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  step_logs JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  total_score NUMERIC(5,2) DEFAULT 0,
  max_score NUMERIC(5,2) DEFAULT 20,
  percentage NUMERIC(5,2) DEFAULT 0,
  teacher_comments TEXT,
  teacher_feedback_released BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Dispatched Emails Log Table
CREATE TABLE IF NOT EXISTS public.dispatched_emails (
  id TEXT PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_role TEXT NOT NULL,
  subject TEXT NOT NULL,
  temp_password TEXT,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  school_name TEXT
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_school_id ON public.users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_experiments_owner ON public.experiments(owner_type, school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_school ON public.assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assignment ON public.attempts(assignment_id);
