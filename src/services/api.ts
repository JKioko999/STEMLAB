import { 
  School, 
  User, 
  ClassGroup, 
  Assignment, 
  Attempt, 
  ExperimentSpec, 
  EmailDispatch 
} from '../types';

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
    create: (schoolData: Omit<School, 'id' | 'createdAt' | 'status' | 'totalStudents' | 'totalTeachers'>, adminPassword?: string) =>
      fetchJSON<{ school: School; adminUser: User; emailDispatch: EmailDispatch }>(`${BASE_URL}/schools`, {
        method: 'POST',
        body: JSON.stringify({ schoolData, adminPassword }),
      }),
    delete: (id: string) =>
      fetchJSON<{ success: boolean; deletedSchoolId: string }>(`${BASE_URL}/schools/${id}`, {
        method: 'DELETE',
      }),
  },

  // Users (Teachers, Students, Administrators)
  users: {
    getAll: (params?: { schoolId?: string; role?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchJSON<User[]>(`${BASE_URL}/users${query ? `?${query}` : ''}`);
    },
    registerStudent: (studentData: { name: string; email: string; schoolId: string; classId: string; admissionNumber: string }) =>
      fetchJSON<User>(`${BASE_URL}/users/student`, {
        method: 'POST',
        body: JSON.stringify(studentData),
      }),
    registerTeacher: (teacherData: { name: string; email: string; schoolId: string; subjectSpecialization: string }) =>
      fetchJSON<{ teacher: User; emailDispatch: EmailDispatch }>(`${BASE_URL}/users/teacher`, {
        method: 'POST',
        body: JSON.stringify(teacherData),
      }),
    deleteTeacher: (teacherId: string) =>
      fetchJSON<{ success: boolean; deletedTeacherId: string }>(`${BASE_URL}/users/teacher/${teacherId}`, {
        method: 'DELETE',
      }),
    changePassword: (userId: string, newPassword: string) =>
      fetchJSON<{ success: boolean }>(`${BASE_URL}/users/change-password`, {
        method: 'POST',
        body: JSON.stringify({ userId, newPassword }),
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
  },
};
