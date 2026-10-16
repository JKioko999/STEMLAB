import { 
  School, 
  User, 
  ClassGroup, 
  Assignment, 
  Attempt, 
  ExperimentSpec, 
  EmailDispatch 
} from '../types';
import { 
  clientSupabase, 
  clientUserFromDb, 
  clientSchoolFromDb 
} from '../lib/supabase';

/**
 * ============================================================================
 * CLIENT-SIDE API SERVICE LAYER
 * ============================================================================
 * Communicates with backend endpoints at /api/*
 * If an endpoint is momentarily unavailable, fallback logic ensures uninterrupted
 * client experience.
 * ============================================================================
 */

const BASE_URL = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Backend Health & Status
  health: {
    check: () => fetchJSON<{
      status: string;
      supabaseConnected: boolean;
      databaseMode: string;
      counts: Record<string, number>;
    }>(`${BASE_URL}/health`),
    reset: () => fetchJSON<{ success: boolean; message: string }>(`${BASE_URL}/reset`, { method: 'POST' }),
  },

  // Schools
  schools: {
    getAll: () => fetchJSON<School[]>(`${BASE_URL}/schools`),
    getById: (id: string) => fetchJSON<{ school: School; teachers: User[]; classes: ClassGroup[]; studentCount: number }>(`${BASE_URL}/schools/${id}`),
    create: (
      schoolData: Omit<School, 'id' | 'createdAt' | 'status' | 'totalStudents' | 'totalTeachers'> & { id?: string },
      adminPassword?: string,
      extra?: { schoolId?: string; adminUserId?: string }
    ) =>
      fetchJSON<{ school: School; adminUser: User; emailDispatch: EmailDispatch }>(`${BASE_URL}/schools`, {
        method: 'POST',
        body: JSON.stringify({ schoolData, adminPassword, ...extra }),
      }),
    delete: (id: string) =>
      fetchJSON<{ success: boolean; deletedSchoolId: string }>(`${BASE_URL}/schools/${id}`, {
        method: 'DELETE',
      }),
  },

  // Users (Teachers, Students, Administrators)
  users: {
    getAll: async (params?: { schoolId?: string; role?: string; email?: string }) => {
      try {
        const query = new URLSearchParams(params as any).toString();
        return await fetchJSON<User[]>(`${BASE_URL}/users${query ? `?${query}` : ''}`);
      } catch (err) {
        if (clientSupabase) {
          try {
            let q = clientSupabase.from('users').select('*');
            if (params?.schoolId) q = q.eq('school_id', params.schoolId);
            if (params?.role) q = q.eq('role', params.role);
            if (params?.email) q = q.eq('email', params.email.toLowerCase().trim());
            const { data, error } = await q;
            if (!error && Array.isArray(data)) return data.map(clientUserFromDb);
          } catch (dbErr) {
            console.warn('[SUPABASE DIRECT] users.getAll notice:', dbErr);
          }
        }
        throw err;
      }
    },
    registerAdmin: async (adminData: { id?: string; name: string; email: string; password?: string }) => {
      try {
        return await fetchJSON<User>(`${BASE_URL}/users/admin`, {
          method: 'POST',
          body: JSON.stringify(adminData),
        });
      } catch (err) {
        if (clientSupabase) {
          try {
            const adminId = adminData.id || `usr-super-${Date.now().toString(36)}`;
            const row = {
              id: adminId,
              name: adminData.name.trim(),
              email: adminData.email.toLowerCase().trim(),
              role: 'super_admin',
              avatar_color: 'bg-slate-900',
              must_change_password: false,
              password: adminData.password ? String(adminData.password).trim() : null,
              temp_password: adminData.password ? String(adminData.password).trim() : null
            };
            const { data, error } = await clientSupabase.from('users').upsert(row, { onConflict: 'email' }).select().single();
            if (!error && data) return clientUserFromDb(data);
          } catch (dbErr) {
            console.warn('[SUPABASE DIRECT] registerAdmin notice:', dbErr);
          }
        }
        throw err;
      }
    },
    registerStudent: (studentData: { id?: string; name: string; email: string; schoolId: string; classId: string; admissionNumber: string; password?: string }) =>
      fetchJSON<User>(`${BASE_URL}/users/student`, {
        method: 'POST',
        body: JSON.stringify(studentData),
      }),
    registerTeacher: (teacherData: { id?: string; name: string; email: string; schoolId: string; subjectSpecialization: string; tempPassword?: string }) =>
      fetchJSON<{ teacher: User; emailDispatch: EmailDispatch }>(`${BASE_URL}/users/teacher`, {
        method: 'POST',
        body: JSON.stringify(teacherData),
      }),
    deleteTeacher: (teacherId: string) =>
      fetchJSON<{ success: boolean; deletedTeacherId: string }>(`${BASE_URL}/users/teacher/${teacherId}`, {
        method: 'DELETE',
      }),
    delete: (userId: string) =>
      fetchJSON<{ success: boolean; deletedUserId: string }>(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      }),
    login: async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      try {
        return await fetchJSON<{ success: boolean; user: User; message?: string }>(`${BASE_URL}/users/login`, {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail, password: cleanPassword }),
        });
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (msg.includes('Incorrect password') || msg.includes('Invalid credentials')) {
          throw err;
        }

        // Direct client Supabase fallback if server 500s or is unreachable
        if (clientSupabase) {
          try {
            const { data, error } = await clientSupabase
              .from('users')
              .select('*')
              .eq('email', normalizedEmail)
              .maybeSingle();

            if (!error && data) {
              const expected = (data.password && String(data.password).trim().length > 0)
                ? String(data.password).trim()
                : (data.temp_password ? String(data.temp_password).trim() : '');

              if (expected && expected === cleanPassword) {
                return { success: true, user: clientUserFromDb(data), message: 'Authenticated via direct Supabase' };
              } else {
                throw new Error('Incorrect password. Please verify your credentials or use "Forgot password" to reset.');
              }
            } else if (!error && !data) {
              throw new Error('Invalid credentials. No registered account found with that email address. Please register your school, student, or platform administrator account first.');
            }
          } catch (dbErr: any) {
            if (dbErr.message?.includes('Incorrect password') || dbErr.message?.includes('Invalid credentials')) {
              throw dbErr;
            }
          }
        }

        throw err;
      }
    },
    changePassword: (userId: string, newPassword: string, email?: string) =>
      fetchJSON<{ success: boolean; message?: string }>(`${BASE_URL}/users/change-password`, {
        method: 'POST',
        body: JSON.stringify({ userId, newPassword, email }),
      }),
    requestResetOtp: (email: string, userData?: Partial<User>) =>
      fetchJSON<{ success: boolean; message: string; simulated?: boolean; targetUser?: User }>(`${BASE_URL}/users/request-reset-otp`, {
        method: 'POST',
        body: JSON.stringify({ email, ...userData }),
      }),
    verifyResetOtp: (email: string, otp: string) =>
      fetchJSON<{ success: boolean; message: string }>(`${BASE_URL}/users/verify-reset-otp`, {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }),
  },

  // Classes / Form Streams
  classes: {
    getAll: (params?: { schoolId?: string; teacherId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchJSON<ClassGroup[]>(`${BASE_URL}/classes${query ? `?${query}` : ''}`);
    },
    create: (classData: Omit<ClassGroup, 'id'>) =>
      fetchJSON<ClassGroup>(`${BASE_URL}/classes`, {
        method: 'POST',
        body: JSON.stringify(classData),
      }),
  },

  // Experiments (3-tier: Global KCSE, School-approved, Teacher-custom)
  experiments: {
    getAll: (params?: { subject?: string; tier?: string; schoolId?: string; teacherId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchJSON<ExperimentSpec[]>(`${BASE_URL}/experiments${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => fetchJSON<ExperimentSpec>(`${BASE_URL}/experiments/${id}`),
    create: (spec: ExperimentSpec) =>
      fetchJSON<ExperimentSpec>(`${BASE_URL}/experiments`, {
        method: 'POST',
        body: JSON.stringify(spec),
      }),
    update: (id: string, spec: ExperimentSpec) =>
      fetchJSON<{ success: boolean; experiment: ExperimentSpec }>(`${BASE_URL}/experiments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(spec),
      }),
    delete: (id: string) =>
      fetchJSON<{ success: boolean; deletedExperimentId: string }>(`${BASE_URL}/experiments/${id}`, {
        method: 'DELETE',
      }),
    clone: (id: string, authorTeacher: User) =>
      fetchJSON<ExperimentSpec>(`${BASE_URL}/experiments/${id}/clone`, {
        method: 'POST',
        body: JSON.stringify({ authorTeacher }),
      }),
    promoteToSchool: (id: string, schoolId: string) =>
      fetchJSON<ExperimentSpec>(`${BASE_URL}/experiments/${id}/promote`, {
        method: 'POST',
        body: JSON.stringify({ schoolId }),
      }),
    parseAI: (text: string) =>
      fetchJSON<{ success: boolean; source: string; experiment: any }>(`${BASE_URL}/experiments/parse-ai`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
  },

  // Assignments
  assignments: {
    getAll: (params?: { schoolId?: string; teacherId?: string; classId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchJSON<Assignment[]>(`${BASE_URL}/assignments${query ? `?${query}` : ''}`);
    },
    create: (assignmentData: Omit<Assignment, 'id' | 'assignedAt' | 'submittedCount'>) =>
      fetchJSON<Assignment>(`${BASE_URL}/assignments`, {
        method: 'POST',
        body: JSON.stringify(assignmentData),
      }),
  },

  // Attempts
  attempts: {
    getAll: (params?: { assignmentId?: string; studentId?: string; teacherId?: string; schoolId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchJSON<Attempt[]>(`${BASE_URL}/attempts${query ? `?${query}` : ''}`);
    },
    submit: (attemptData: Omit<Attempt, 'id' | 'startedAt' | 'submittedAt'> & { startedAt: string }) =>
      fetchJSON<Attempt>(`${BASE_URL}/attempts`, {
        method: 'POST',
        body: JSON.stringify(attemptData),
      }),
    grade: (attemptId: string, scoreUpdates: { questionId: string; teacherScore: number; feedback?: string }[], teacherComments: string) =>
      fetchJSON<Attempt>(`${BASE_URL}/attempts/${attemptId}/grade`, {
        method: 'PUT',
        body: JSON.stringify({ scoreUpdates, teacherComments }),
      }),
    releaseGrades: (assignmentId: string) =>
      fetchJSON<{ success: boolean; assignmentId: string }>(`${BASE_URL}/attempts/release-grades`, {
        method: 'POST',
        body: JSON.stringify({ assignmentId }),
      }),
  },

  // Dispatched Welcome & Credential Emails
  emails: {
    getAll: (schoolName?: string) => {
      const query = schoolName ? `?schoolName=${encodeURIComponent(schoolName)}` : '';
      return fetchJSON<EmailDispatch[]>(`${BASE_URL}/emails${query}`);
    },
    send: (data: {
      to: string;
      toName?: string;
      subject: string;
      message: string;
      recipientRole?: string;
      tempPassword?: string;
      schoolName?: string;
    }) =>
      fetchJSON<{ success: boolean; message: string; emailDispatch: EmailDispatch; mailResult: any }>(`${BASE_URL}/emails/send`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getStatus: () =>
      fetchJSON<{
        success: boolean;
        senderEmail: string;
        senderName: string;
        configured: boolean;
        authAccount: string;
        deliveryMode: string;
        instructions: string;
      }>(`${BASE_URL}/emails/status`),
    test: (to: string) =>
      fetchJSON<{
        success: boolean;
        simulated: boolean;
        senderEmail: string;
        message: string;
        mailResult: any;
      }>(`${BASE_URL}/emails/test`, {
        method: 'POST',
        body: JSON.stringify({ to }),
      }),
  },
};
