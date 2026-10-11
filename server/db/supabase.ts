import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { 
  School, 
  User, 
  ClassGroup, 
  ExperimentSpec, 
  Assignment, 
  Attempt, 
  EmailDispatch 
} from '../../src/types/index.js';
import { INITIAL_EXPERIMENTS } from '../../src/data/experimentSpecs.js';

dotenv.config();

/**
 * ============================================================================
 * SUPABASE DATABASE INTEGRATION & LIVE CONNECTION LAYER
 * ============================================================================
 * Supports both SUPABASE_URL / SUPABASE_ANON_KEY and VITE_ prefixed env vars.
 * Provides bidirectional transformations between PostgreSQL snake_case schema
 * and TypeScript camelCase domain models.
 * ============================================================================
 */

export const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
};

let supabaseClient: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url && 
    url.startsWith('https://') && 
    key && 
    !url.includes('your-project-id') &&
    !key.includes('your-anon-key')
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    const { url, key } = getSupabaseConfig();
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(' [SUPABASE] Connected to live Supabase database at:', url);
    } catch (err) {
      console.error(' [SUPABASE] Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseClient;
};

// ============================================================================
// ENTITY TRANSFORMERS: PostgreSQL (snake_case) <-> Application (camelCase)
// ============================================================================

export const schoolFromDb = (row: any): School => ({
  id: row.id,
  name: row.name,
  registrationNumber: row.registration_number || '',
  county: row.county,
  subCounty: row.sub_county || '',
  category: row.category,
  subscriptionPlan: row.subscription_plan,
  adminName: row.admin_name,
  adminEmail: row.admin_email,
  phone: row.phone || '',
  totalStudents: Number(row.total_students || 0),
  totalTeachers: Number(row.total_teachers || 0),
  createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  status: row.status || 'active'
});

export const schoolToDb = (s: Partial<School>): any => ({
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

export const userFromDb = (row: any): User => ({
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
  tempPassword: row.temp_password
});

export const userToDb = (u: Partial<User>): any => ({
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
});

export const classFromDb = (row: any): ClassGroup => ({
  id: row.id,
  schoolId: row.school_id,
  name: row.name,
  formYear: Number(row.form_year),
  teacherId: row.teacher_id,
  teacherName: row.teacher_name,
  subject: row.subject,
  studentCount: Number(row.student_count || 0)
});

export const classToDb = (c: Partial<ClassGroup>): any => ({
  id: c.id,
  school_id: c.schoolId,
  name: c.name,
  form_year: c.formYear,
  teacher_id: c.teacherId,
  teacher_name: c.teacherName,
  subject: c.subject,
  student_count: c.studentCount ?? 0
});

export const experimentFromDb = (row: any): ExperimentSpec => ({
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
  ownerType: row.owner_type,
  schoolId: row.school_id,
  teacherId: row.teacher_id,
  authorName: row.author_name,
  status: row.status || 'published',
  clonedFrom: row.cloned_from
});

export const experimentToDb = (e: Partial<ExperimentSpec>): any => ({
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

export const assignmentFromDb = (row: any): Assignment => ({
  id: row.id,
  schoolId: row.school_id,
  teacherId: row.teacher_id,
  teacherName: row.teacher_name,
  classId: row.class_id,
  className: row.class_name,
  experimentId: row.experiment_id,
  experimentTitle: row.experiment_title,
  subject: row.subject,
  kcsePaper: row.kcse_paper,
  mode: row.mode,
  deadline: row.deadline,
  timeLimitMinutes: row.time_limit_minutes,
  assignedAt: row.assigned_at,
  totalEnrolledStudents: Number(row.total_enrolled_students || 0),
  submittedCount: Number(row.submitted_count || 0)
});

export const assignmentToDb = (a: Partial<Assignment>): any => ({
  id: a.id,
  school_id: a.schoolId,
  teacher_id: a.teacherId,
  teacher_name: a.teacherName,
  class_id: a.classId,
  class_name: a.className,
  experiment_id: a.experimentId,
  experiment_title: a.experimentTitle,
  subject: a.subject,
  kcse_paper: a.kcsePaper,
  mode: a.mode,
  deadline: a.deadline,
  time_limit_minutes: a.timeLimitMinutes,
  total_enrolled_students: a.totalEnrolledStudents ?? 0,
  submitted_count: a.submittedCount ?? 0
});

export const attemptFromDb = (row: any): Attempt => ({
  id: row.id,
  schoolId: row.school_id,
  assignmentId: row.assignment_id,
  isPracticeOpenLab: Boolean(row.is_practice_open_lab),
  experimentId: row.experiment_id,
  experimentTitle: row.experiment_title,
  subject: row.subject,
  studentId: row.student_id,
  studentName: row.student_name,
  studentAdmission: row.student_admission,
  teacherId: row.teacher_id,
  teacherName: row.teacher_name,
  classId: row.class_id,
  className: row.class_name,
  mode: row.mode,
  startedAt: row.started_at,
  submittedAt: row.submitted_at,
  status: row.status,
  stepLogs: Array.isArray(row.step_logs) ? row.step_logs : [],
  answers: Array.isArray(row.answers) ? row.answers : [],
  totalScore: Number(row.total_score || 0),
  maxScore: Number(row.max_score || 20),
  percentage: Number(row.percentage || 0),
  teacherComments: row.teacher_comments,
  teacherFeedbackReleased: Boolean(row.teacher_feedback_released)
});

export const attemptToDb = (att: Partial<Attempt>): any => ({
  id: att.id,
  school_id: att.schoolId,
  assignment_id: att.assignmentId,
  is_practice_open_lab: att.isPracticeOpenLab ?? false,
  experiment_id: att.experimentId,
  experiment_title: att.experimentTitle,
  subject: att.subject,
  student_id: att.studentId,
  student_name: att.studentName,
  student_admission: att.studentAdmission,
  teacher_id: att.teacherId,
  teacher_name: att.teacherName,
  class_id: att.classId,
  class_name: att.className,
  mode: att.mode,
  started_at: att.startedAt,
  submitted_at: att.submittedAt,
  status: att.status || 'submitted',
  step_logs: att.stepLogs || [],
  answers: att.answers || [],
  total_score: att.totalScore ?? 0,
  max_score: att.maxScore ?? 20,
  percentage: att.percentage ?? 0,
  teacher_comments: att.teacherComments,
  teacher_feedback_released: att.teacherFeedbackReleased ?? false
});

export const emailFromDb = (row: any): EmailDispatch => ({
  id: row.id,
  recipientEmail: row.recipient_email,
  recipientName: row.recipient_name,
  recipientRole: row.recipient_role,
  subject: row.subject,
  tempPassword: row.temp_password,
  sentAt: row.sent_at,
  schoolName: row.school_name,
  messageBody: row.message_body
});

export const emailToDb = (e: Partial<EmailDispatch>): any => ({
  id: e.id,
  recipient_email: e.recipientEmail,
  recipient_name: e.recipientName,
  recipient_role: e.recipientRole,
  subject: e.subject,
  temp_password: e.tempPassword,
  sent_at: e.sentAt,
  school_name: e.schoolName,
  message_body: e.messageBody
});

/**
 * Ensures standard KCSE curriculum experiments exist in Supabase when connecting to a fresh DB.
 */
export const ensureExperimentsInSupabase = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { count, error } = await supabase.from('experiments').select('*', { count: 'exact', head: true });
    if (!error && (count === 0 || count === null)) {
      console.log(' [SUPABASE] Initializing standard KCSE experiments in Supabase...');
      const records = INITIAL_EXPERIMENTS.map(experimentToDb);
      const { error: insertErr } = await supabase.from('experiments').insert(records);
      if (insertErr) {
        console.warn(' [SUPABASE] Auto-seed experiments notice:', insertErr.message);
      } else {
        console.log(` [SUPABASE] Seeded ${records.length} standard experiments to Supabase successfully.`);
      }
    }
  } catch (err) {
    console.warn(' [SUPABASE] Check on experiments table:', err);
  }
};
