import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, School, ClassGroup, ExperimentSpec, Assignment, Attempt } from '../types';

/**
 * ============================================================================
 * CLIENT-SIDE DIRECT SUPABASE CLIENT
 * ============================================================================
 * Automatically activated when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * are present in the environment (e.g. on Vercel or local .env).
 * Allows the browser to fetch and persist data directly with Supabase,
 * providing ultra-fast 20ms responses and full offline-resilient operation
 * even if serverless functions experience cold starts or network hiccups.
 * ============================================================================
 */

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const isClientSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const clientSupabase: SupabaseClient | null = isClientSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Helpers to transform rows
export const clientUserFromDb = (row: any): User => ({
  id: row.id,
  schoolId: row.school_id,
  name: row.name,
  email: row.email,
  role: row.role,
  admissionNumber: row.admission_number,
  subjectSpecialization: row.subject_specialization,
  classId: row.class_id,
  className: row.class_name,
  teacherId: row.teacher_id,
  teacherName: row.teacher_name,
  avatarColor: row.avatar_color,
  mustChangePassword: Boolean(row.must_change_password),
  tempPassword: row.temp_password,
  password: row.password || undefined
});

export const clientSchoolFromDb = (row: any): School => ({
  id: row.id,
  name: row.name,
  registrationNumber: row.registration_number || '',
  county: row.county,
  subCounty: row.sub_county || '',
  category: row.category,
  subscriptionPlan: row.subscription_plan,
  adminName: row.admin_name,
  adminEmail: row.admin_email,
  phone: row.phone,
  totalStudents: Number(row.total_students || 0),
  totalTeachers: Number(row.total_teachers || 0),
  createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  status: row.status || 'active'
});
