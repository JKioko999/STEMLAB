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

export const clientUserToDb = (u: Partial<User>): any => {
  const row: any = {
    id: u.id,
    school_id: u.schoolId,
    name: u.name,
    email: u.email,
    role: u.role,
    admission_number: u.admissionNumber,
    subject_specialization: u.subjectSpecialization,
    class_id: u.classId,
    class_name: u.className,
    teacher_id: u.teacherId,
    teacher_name: u.teacherName,
    avatar_color: u.avatarColor,
    must_change_password: u.mustChangePassword ?? false,
    temp_password: u.tempPassword
  };
  if (u.password !== undefined) {
    row.password = u.password;
  }
  return row;
};

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

export const clientSchoolToDb = (s: Partial<School>): any => ({
  id: s.id,
  name: s.name,
  registration_number: s.registrationNumber,
  county: s.county,
  sub_county: s.subCounty,
  category: s.category,
  subscription_plan: s.subscriptionPlan,
  admin_name: s.adminName,
  admin_email: s.adminEmail,
  phone: s.phone,
  total_students: s.totalStudents ?? 0,
  total_teachers: s.totalTeachers ?? 0,
  status: s.status || 'active'
});

export const clientClassFromDb = (row: any): ClassGroup => ({
  id: row.id,
  schoolId: row.school_id,
  name: row.name,
  formYear: Number(row.form_year),
  teacherId: row.teacher_id,
  teacherName: row.teacher_name,
  subject: row.subject,
  studentCount: Number(row.student_count || 0)
});

export const clientClassToDb = (c: Partial<ClassGroup>): any => ({
  id: c.id,
  school_id: c.schoolId,
  name: c.name,
  form_year: c.formYear,
  teacher_id: c.teacherId,
  teacher_name: c.teacherName,
  subject: c.subject,
  student_count: c.studentCount ?? 0
});

export const clientExperimentFromDb = (row: any): ExperimentSpec => ({
  id: row.id,
  subject: row.subject,
  title: row.title,
  kcsePaper: row.kcse_paper,
  topic: row.topic,
  objectives: Array.isArray(row.objectives) ? row.objectives : [],
  estimatedDurationMinutes: Number(row.estimated_duration_minutes || 45),
  apparatus: Array.isArray(row.apparatus) ? row.apparatus : [],
  steps: Array.isArray(row.steps) ? row.steps : [],
  procedures: Array.isArray(row.simulation_config?.procedures) ? row.simulation_config.procedures : undefined,
  simulationType: row.simulation_type,
  simulationConfig: row.simulation_config || {},
  answerSheet: Array.isArray(row.answer_sheet) ? row.answer_sheet : [],
  ownerType: row.owner_type || 'global',
  schoolId: row.school_id,
  teacherId: row.teacher_id,
  authorName: row.author_name || 'KCSE National Science Curriculum',
  status: row.status || 'published',
  clonedFrom: row.cloned_from
});

export const clientExperimentToDb = (e: Partial<ExperimentSpec>): any => ({
  id: e.id,
  subject: e.subject,
  title: e.title,
  kcse_paper: e.kcsePaper,
  topic: e.topic,
  objectives: e.objectives || [],
  estimated_duration_minutes: e.estimatedDurationMinutes || 45,
  apparatus: e.apparatus || [],
  steps: e.steps || [],
  simulation_type: e.simulationType,
  simulation_config: {
    ...(e.simulationConfig || {}),
    ...(e.procedures ? { procedures: e.procedures } : {})
  },
  answer_sheet: e.answerSheet || [],
  owner_type: e.ownerType || 'global',
  school_id: e.schoolId,
  teacher_id: e.teacherId,
  author_name: e.authorName || 'KCSE National Science Curriculum',
  status: e.status || 'published',
  cloned_from: e.clonedFrom
});
