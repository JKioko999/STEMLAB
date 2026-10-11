import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, User, ClassGroup, Assignment, Attempt, ExperimentSpec, EmailDispatch } from '../types';
import { INITIAL_EXPERIMENTS } from '../data/experimentSpecs';
import { api } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  schools: School[];
  users: User[];
  classes: ClassGroup[];
  experiments: ExperimentSpec[];
  assignments: Assignment[];
  attempts: Attempt[];
  sentEmails: EmailDispatch[];
  latestDispatchedEmail: EmailDispatch | null;
  clearDispatchedEmail: () => void;
  changePassword: (userId: string, newPassword: string) => void;
  
  // Navigation & Lab state
  currentView: 'dashboard' | 'lab' | 'builder' | 'review_attempt' | 'auth' | 'landing';
  authMode: 'login' | 'register_student' | 'register_school' | 'register_admin';
  activeExperiment: ExperimentSpec | null;
  activeAssignment: Assignment | null;
  activeLabMode: 'practice' | 'exam';
  reviewingAttempt: Attempt | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  setCurrentView: (view: 'dashboard' | 'lab' | 'builder' | 'review_attempt' | 'auth' | 'landing') => void;
  setAuthMode: (mode: 'login' | 'register_student' | 'register_school' | 'register_admin') => void;
  
  // Registration
  registerSchool: (schoolData: Omit<School, 'id' | 'createdAt' | 'status' | 'totalStudents' | 'totalTeachers'>, adminPassword?: string) => School;
  registerSuperAdmin: (adminData: { name: string; email: string; password?: string }) => User;
  registerStudent: (studentData: { name: string; email: string; schoolId: string; classId: string; admissionNumber: string }) => User;
  registerTeacher: (teacherData: { name: string; email: string; schoolId: string; subjectSpecialization: string }) => User;
  
  // Deletion Actions
  deleteSchool: (schoolId: string) => void;
  deleteTeacher: (teacherId: string) => void;
  deleteUser: (userId: string) => void;
  deleteExperiment: (experimentId: string) => void;

  // School Admin Actions
  addClass: (classData: Omit<ClassGroup, 'id'>) => void;
  promoteExperimentToSchool: (experimentId: string, schoolId: string) => void;
  
  // Teacher Actions
  createAssignment: (assignmentData: Omit<Assignment, 'id' | 'assignedAt' | 'submittedCount'>) => Assignment;
  createExperiment: (spec: ExperimentSpec) => void;
  updateExperiment: (updatedSpec: ExperimentSpec) => void;
  cloneExperiment: (sourceId: string, authorTeacher: User) => ExperimentSpec;
  editingExperiment: ExperimentSpec | null;
  openExperimentEditor: (exp?: ExperimentSpec | null) => void;
  gradeStudentAttempt: (attemptId: string, scoreUpdates: { questionId: string; teacherScore: number; feedback?: string }[], teacherComments: string) => void;
  releaseGrades: (assignmentId: string) => void;

  // Student Actions
  startExperiment: (experiment: ExperimentSpec, assignment?: Assignment | null, mode?: 'practice' | 'exam') => void;
  submitExperimentAttempt: (attemptData: Omit<Attempt, 'id' | 'startedAt' | 'submittedAt'> & { startedAt: string }) => Attempt;
  openAttemptReview: (attempt: Attempt) => void;
  resetAllToDefaults: () => void;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'stem_spark_user_live_v4',
  SCHOOLS: 'stem_spark_schools_live_v4',
  USERS: 'stem_spark_users_live_v4',
  CLASSES: 'stem_spark_classes_live_v4',
  EXPERIMENTS: 'stem_spark_experiments_live_v4',
  ASSIGNMENTS: 'stem_spark_assignments_live_v4',
  ATTEMPTS: 'stem_spark_attempts_live_v4',
  EMAILS: 'stem_spark_emails_live_v4'
};

// Purge any legacy dummy keys on app startup so users start with a clean production slate
if (typeof window !== 'undefined') {
  [
    'stem_spark_user_v3', 'stem_spark_schools_v3', 'stem_spark_users_v3', 
    'stem_spark_classes_v3', 'stem_spark_experiments_v3', 'stem_spark_assignments_v3', 
    'stem_spark_attempts_v3', 'stem_spark_emails_v3',
    'stem_spark_user_v2', 'stem_spark_schools_v2', 'stem_spark_users_v2',
    'stem_spark_classes_v2', 'stem_spark_experiments_v2', 'stem_spark_assignments_v2',
    'stem_spark_attempts_v2', 'stem_spark_emails_v2'
  ].forEach(k => {
    try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
  });
}

const generateTempPassword = (prefix: 'Stem' | 'Tchr') => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}@${num}!`;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean live state: experiments remain, all others start completely clean and populate dynamically from live DB
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only return if it doesn't contain hardcoded mock IDs
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(s => s.id === 'sch-alliance-science' || s.id === 'sch-kenya-high')) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(c => c.id === 'cls-f4-chem' || c.schoolId === 'sch-alliance-science')) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [experiments, setExperiments] = useState<ExperimentSpec[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
    return saved ? JSON.parse(saved) : [...INITIAL_EXPERIMENTS];
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [attempts, setAttempts] = useState<Attempt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [sentEmails, setSentEmails] = useState<EmailDispatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMAILS);
    return saved ? JSON.parse(saved) : [];
  });

  const [latestDispatchedEmail, setLatestDispatchedEmail] = useState<EmailDispatch | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  // UI Flow State with initial URL detection
  const [currentView, setCurrentView] = useState<'dashboard' | 'lab' | 'builder' | 'review_attempt' | 'auth' | 'landing'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/auth') return 'auth';
      if (path === '/lab') return 'lab';
      if (path === '/builder') return 'builder';
      if (path === '/review') return 'review_attempt';
      if (path === '/dashboard') return 'dashboard';
    }
    return 'landing';
  });

  const [authMode, setAuthMode] = useState<'login' | 'register_student' | 'register_school' | 'register_admin'>('login');
  const [activeExperiment, setActiveExperiment] = useState<ExperimentSpec | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [activeLabMode, setActiveLabMode] = useState<'practice' | 'exam'>('practice');
  const [reviewingAttempt, setReviewingAttempt] = useState<Attempt | null>(null);
  const [editingExperiment, setEditingExperiment] = useState<ExperimentSpec | null>(null);

  // Theme State - Default to light
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stem_spark_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('stem_spark_theme', theme);
    } catch (e) {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Helper to sync clean web URL to browser address bar
  const syncUrlToView = (
    view: 'dashboard' | 'lab' | 'builder' | 'review_attempt' | 'auth' | 'landing',
    extra?: { experimentId?: string; attemptId?: string; mode?: string }
  ) => {
    if (typeof window === 'undefined') return;

    let targetPath = '/';
    const params = new URLSearchParams();

    if (view === 'landing') {
      targetPath = '/';
    } else if (view === 'auth') {
      targetPath = '/auth';
    } else if (view === 'dashboard') {
      targetPath = '/dashboard';
    } else if (view === 'lab') {
      targetPath = '/lab';
      if (extra?.experimentId) params.set('experimentId', extra.experimentId);
      if (extra?.mode) params.set('mode', extra.mode);
    } else if (view === 'builder') {
      targetPath = '/builder';
      if (extra?.experimentId) params.set('experimentId', extra.experimentId);
    } else if (view === 'review_attempt') {
      targetPath = '/review';
      if (extra?.attemptId) params.set('attemptId', extra.attemptId);
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const fullUrl = `${targetPath}${queryStr}`;

    if (window.location.pathname + window.location.search !== fullUrl) {
      window.history.pushState({ view, ...extra }, '', fullUrl);
    }
  };

  const setViewWithUrl = (view: 'dashboard' | 'lab' | 'builder' | 'review_attempt' | 'auth' | 'landing') => {
    setCurrentView(view);
    syncUrlToView(view);
  };

  const openExperimentEditor = (exp?: ExperimentSpec | null) => {
    setEditingExperiment(exp || null);
    setCurrentView('builder');
    syncUrlToView('builder', { experimentId: exp?.id });
  };

  // Sync with Backend /api on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [schs, usrs, clss, exps, asgs, atts, emls] = await Promise.all([
          api.schools.getAll().catch(() => null),
          api.users.getAll().catch(() => null),
          api.classes.getAll().catch(() => null),
          api.experiments.getAll().catch(() => null),
          api.assignments.getAll().catch(() => null),
          api.attempts.getAll().catch(() => null),
          api.emails.getAll().catch(() => null),
        ]);

        if (Array.isArray(schs)) setSchools(schs);
        if (Array.isArray(usrs)) {
          setUsers(prev => {
            if (!prev || prev.length === 0) return usrs;
            const mergedMap = new Map<string, User>();
            usrs.forEach(u => mergedMap.set(u.email.toLowerCase(), u));
            prev.forEach(localU => {
              const existing = mergedMap.get(localU.email.toLowerCase());
              if (existing) {
                mergedMap.set(localU.email.toLowerCase(), {
                  ...existing,
                  ...localU,
                  mustChangePassword: localU.mustChangePassword === false ? false : existing.mustChangePassword,
                  tempPassword: localU.mustChangePassword === false ? undefined : (localU.tempPassword || existing.tempPassword)
                });
              } else {
                mergedMap.set(localU.email.toLowerCase(), localU);
              }
            });
            return Array.from(mergedMap.values());
          });
        }
        if (Array.isArray(clss)) setClasses(clss);
        if (Array.isArray(exps) && exps.length > 0) setExperiments(exps);
        if (Array.isArray(asgs)) setAssignments(asgs);
        if (Array.isArray(atts)) setAttempts(atts);
        if (Array.isArray(emls)) setSentEmails(emls);
      } catch (err) {
        console.warn('Initial backend sync completed or using stored data.');
      }
    };

    loadBackendData();
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const experimentId = searchParams.get('experimentId');
      const attemptId = searchParams.get('attemptId');

      if (pathname === '/lab') {
        if (experimentId) {
          const foundExp = experiments.find(e => e.id === experimentId);
          if (foundExp) setActiveExperiment(foundExp);
        }
        setCurrentView('lab');
      } else if (pathname === '/builder') {
        if (experimentId) {
          const foundExp = experiments.find(e => e.id === experimentId);
          setEditingExperiment(foundExp || null);
        }
        setCurrentView('builder');
      } else if (pathname === '/review') {
        if (attemptId) {
          const foundAttempt = attempts.find(a => a.id === attemptId);
          if (foundAttempt) setReviewingAttempt(foundAttempt);
        }
        setCurrentView('review_attempt');
      } else if (pathname === '/auth') {
        setCurrentView('auth');
      } else if (pathname === '/' || pathname === '/landing') {
        setCurrentView('landing');
      } else {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [experiments, attempts]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(experiments));
  }, [experiments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(sentEmails));
  }, [sentEmails]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const login = (user: User) => {
    const latest = users.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()) || user;
    setCurrentUser(latest);
    setViewWithUrl('dashboard');
  };

  const logout = () => {
    setCurrentUser(null);
    setViewWithUrl('landing');
    setAuthMode('login');
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setViewWithUrl('dashboard');
    }
  };

  const clearDispatchedEmail = () => {
    setLatestDispatchedEmail(null);
  };

  const changePassword = (userId: string, newPassword: string) => {
    const targetUser = users.find(u => u.id === userId || (currentUser?.id === userId && u.email === currentUser.email));
    const targetEmail = targetUser?.email || currentUser?.email;

    setUsers(prev => prev.map(u => {
      const isMatch = u.id === userId || (targetEmail && u.email.toLowerCase() === targetEmail.toLowerCase());
      if (isMatch) {
        return {
          ...u,
          mustChangePassword: false,
          tempPassword: undefined,
          password: newPassword
        };
      }
      return u;
    }));

    if (currentUser?.id === userId || (targetEmail && currentUser?.email?.toLowerCase() === targetEmail.toLowerCase())) {
      setCurrentUser(prev => prev ? {
        ...prev,
        mustChangePassword: false,
        tempPassword: undefined,
        password: newPassword
      } : null);
    }

    api.users.changePassword(userId, newPassword, targetEmail).catch(err => console.warn('API sync:', err));
  };

  // 1. School Registration with Credentials Dispatch
  const registerSchool = (
    schoolData: Omit<School, 'id' | 'createdAt' | 'status' | 'totalStudents' | 'totalTeachers'>,
    adminPassword?: string
  ): School => {
    const schoolId = `sch-${Date.now().toString(36)}`;
    const adminUserId = `usr-admin-${Date.now().toString(36)}`;
    const tempPassword = adminPassword || generateTempPassword('Stem');
    const registrationNumber = schoolData.registrationNumber || `MOE/REG/${Math.floor(10000 + Math.random() * 90000)}/2026`;

    const newSchool: School = {
      ...schoolData,
      id: schoolId,
      registrationNumber: registrationNumber,
      totalStudents: 0,
      totalTeachers: 1,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const newAdminUser: User = {
      id: adminUserId,
      schoolId: schoolId,
      name: `${schoolData.adminName} (Principal)`,
      email: schoolData.adminEmail,
      role: 'school_admin',
      avatarColor: 'bg-indigo-600',
      mustChangePassword: true,
      tempPassword: tempPassword
    };

    const emailDispatch: EmailDispatch = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      recipientEmail: schoolData.adminEmail,
      recipientName: schoolData.adminName,
      recipientRole: 'school_admin',
      subject: `Official Welcome & Portal Activation: ${schoolData.name} STEM Spark Lab Admin Access`,
      tempPassword: tempPassword,
      messageBody: `Dear ${schoolData.adminName},\n\nYour secondary school "${schoolData.name}" (Registration Number: ${registrationNumber}) has been officially onboarded to STEM-SPARK-LAB Kenya.\n\nYour institutional administrator credentials have been provisioned:\n• Portal URL: STEM-SPARK-LAB Kenya\n• Official Username: ${schoolData.adminEmail}\n• Temporary Password: ${tempPassword}\n\nIMPORTANT: For institutional cybersecurity and data privacy, you are required to change this temporary password upon your initial sign in.\n\nRegards,\nSTEM-SPARK-LAB Directorate & Ministry Coordination`,
      sentAt: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString()}`,
      schoolName: schoolData.name
    };

    setSchools(prev => [newSchool, ...prev]);
    setUsers(prev => [newAdminUser, ...prev]);
    setSentEmails(prev => [emailDispatch, ...prev]);
    setLatestDispatchedEmail(emailDispatch);
    
    // Only automatically log in as the newly created School Admin if NO user is currently logged in!
    // If a Super Admin created this school, DO NOT hijack their session or prompt them to change password!
    if (!currentUser) {
      setCurrentUser(newAdminUser);
      setCurrentView('dashboard');
    }

    api.schools.create(
      { id: schoolId, ...schoolData },
      tempPassword,
      { schoolId, adminUserId }
    ).catch(err => console.warn('API sync:', err));

    return newSchool;
  };

  // 1b. Platform Super Administrator Registration
  const registerSuperAdmin = (adminData: { name: string; email: string; password?: string }): User => {
    const adminUserId = `usr-super-${Date.now().toString(36)}`;
    const newAdminUser: User = {
      id: adminUserId,
      schoolId: null,
      name: adminData.name,
      email: adminData.email.trim().toLowerCase(),
      role: 'super_admin',
      avatarColor: 'bg-slate-900',
      mustChangePassword: false,
      tempPassword: adminData.password
    };

    setUsers(prev => [newAdminUser, ...prev]);
    setCurrentUser(newAdminUser);
    setCurrentView('dashboard');

    api.users.registerAdmin({ id: adminUserId, ...adminData }).catch(err => console.warn('API sync:', err));

    return newAdminUser;
  };

  // 2. Student Registration
  const registerStudent = (studentData: {
    name: string;
    email: string;
    schoolId: string;
    classId: string;
    admissionNumber: string;
  }): User => {
    const studentId = `usr-student-${Date.now().toString(36)}`;
    const targetClass = classes.find(c => c.id === studentData.classId);

    const newStudentUser: User = {
      id: studentId,
      schoolId: studentData.schoolId,
      name: studentData.name,
      email: studentData.email,
      role: 'student',
      admissionNumber: studentData.admissionNumber,
      classId: studentData.classId,
      className: targetClass?.name || 'Class Stream',
      teacherId: targetClass?.teacherId,
      teacherName: targetClass?.teacherName,
      avatarColor: 'bg-emerald-600'
    };

    setUsers(prev => [newStudentUser, ...prev]);

    // Update class and school counts
    setClasses(prev => prev.map(c => c.id === studentData.classId ? { ...c, studentCount: c.studentCount + 1 } : c));
    setSchools(prev => prev.map(s => s.id === studentData.schoolId ? { ...s, totalStudents: s.totalStudents + 1 } : s));

    // Automatically log in as student
    setCurrentUser(newStudentUser);
    setCurrentView('dashboard');

    api.users.registerStudent({ id: studentId, ...studentData }).catch(err => console.warn('API sync:', err));

    return newStudentUser;
  };

  // 3. Teacher Appointment with Credentials Email
  const registerTeacher = (teacherData: {
    name: string;
    email: string;
    schoolId: string;
    subjectSpecialization: string;
  }): User => {
    const teacherId = `usr-teacher-${Date.now().toString(36)}`;
    const tempPassword = generateTempPassword('Tchr');
    const targetSchool = schools.find(s => s.id === teacherData.schoolId);

    const newTeacher: User = {
      id: teacherId,
      schoolId: teacherData.schoolId,
      name: teacherData.name,
      email: teacherData.email,
      role: 'teacher',
      subjectSpecialization: teacherData.subjectSpecialization,
      avatarColor: 'bg-amber-600',
      mustChangePassword: true,
      tempPassword: tempPassword
    };

    const emailDispatch: EmailDispatch = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      recipientEmail: teacherData.email,
      recipientName: teacherData.name,
      recipientRole: 'teacher',
      subject: `Teacher Appointment Notice: STEM Spark Lab Portal Invitation - ${targetSchool?.name || 'School'}`,
      tempPassword: tempPassword,
      messageBody: `Dear ${teacherData.name},\n\nYou have been officially appointed as a Science Teacher (${teacherData.subjectSpecialization}) at ${targetSchool?.name || 'your institution'} on STEM-SPARK-LAB.\n\nYour temporary teacher login credentials are:\n• Portal URL: STEM-SPARK-LAB Kenya Portal\n• Username / Login Email: ${teacherData.email}\n• Temporary Password: ${tempPassword}\n\nSECURITY NOTICE: You will be prompted to replace this temporary password with a private permanent password immediately upon login.\n\nRegards,\nOffice of the Principal & Science Department\n${targetSchool?.name || ''}`,
      sentAt: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString()}`,
      schoolName: targetSchool?.name
    };

    setUsers(prev => [newTeacher, ...prev]);
    setSchools(prev => prev.map(s => s.id === teacherData.schoolId ? { ...s, totalTeachers: s.totalTeachers + 1 } : s));
    setSentEmails(prev => [emailDispatch, ...prev]);
    setLatestDispatchedEmail(emailDispatch);

    api.users.registerTeacher({ id: teacherId, tempPassword, ...teacherData }).catch(err => console.warn('API sync:', err));

    return newTeacher;
  };

  // 4. Add Form Stream
  const addClass = (classData: Omit<ClassGroup, 'id'>) => {
    const studentCount = classData.studentCount !== undefined ? Number(classData.studentCount) : 40;
    const newClass: ClassGroup = {
      ...classData,
      id: `cls-${Date.now().toString(36)}`,
      studentCount: studentCount
    };
    setClasses(prev => [newClass, ...prev]);
    setSchools(prev => prev.map(s => s.id === classData.schoolId ? { ...s, totalStudents: s.totalStudents + studentCount } : s));

    api.classes.create(classData).catch(err => console.warn('API sync:', err));
  };

  const promoteExperimentToSchool = (experimentId: string, schoolId: string) => {
    const exp = experiments.find(e => e.id === experimentId);
    if (!exp) return;
    
    const schoolExp: ExperimentSpec = {
      ...exp,
      id: `exp-school-${Date.now().toString(36)}`,
      ownerType: 'school',
      schoolId: schoolId,
      title: `[School Approved] ${exp.title}`,
      status: 'published'
    };

    setExperiments(prev => [schoolExp, ...prev]);
    api.experiments.promoteToSchool(experimentId, schoolId).catch(err => console.warn('API sync:', err));
  };

  const deleteSchool = (schoolId: string) => {
    setSchools(prev => prev.filter(s => s.id !== schoolId));
    setUsers(prev => prev.filter(u => u.schoolId !== schoolId));
    setClasses(prev => prev.filter(c => c.schoolId !== schoolId));
    setAssignments(prev => prev.filter(a => a.schoolId !== schoolId));
    setExperiments(prev => prev.filter(e => e.schoolId !== schoolId));
    setAttempts(prev => prev.filter(a => a.schoolId !== schoolId));
    setSentEmails(prev => prev.filter(m => m.schoolName !== schools.find(s => s.id === schoolId)?.name));

    api.schools.delete(schoolId).catch(err => console.warn('API sync:', err));
  };

  const deleteTeacher = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    if (teacher && teacher.schoolId) {
      setSchools(prev => prev.map(s => s.id === teacher.schoolId ? { ...s, totalTeachers: Math.max(0, s.totalTeachers - 1) } : s));
    }
    setUsers(prev => prev.filter(u => u.id !== teacherId));
    setClasses(prev => prev.map(c => c.teacherId === teacherId ? { ...c, teacherId: '', teacherName: 'Unassigned' } : c));

    api.users.deleteTeacher(teacherId).catch(err => console.warn('API sync:', err));
  };

  const deleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'teacher') {
      deleteTeacher(userId);
      return;
    }
    if (targetUser && targetUser.schoolId && targetUser.role === 'student') {
      setSchools(prev => prev.map(s => s.id === targetUser.schoolId ? { ...s, totalStudents: Math.max(0, s.totalStudents - 1) } : s));
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
    api.users.delete(userId).catch(err => console.warn('API sync:', err));
  };

  const deleteExperiment = (experimentId: string) => {
    setExperiments(prev => prev.filter(e => e.id !== experimentId));
    setAssignments(prev => prev.filter(a => a.experimentId !== experimentId));

    api.experiments.delete(experimentId).catch(err => console.warn('API sync:', err));
  };

  const createAssignment = (assignmentData: Omit<Assignment, 'id' | 'assignedAt' | 'submittedCount'>): Assignment => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `asg-${Date.now().toString(36)}`,
      assignedAt: new Date().toISOString(),
      submittedCount: 0
    };
    setAssignments(prev => [newAssignment, ...prev]);

    api.assignments.create(assignmentData).catch(err => console.warn('API sync:', err));

    return newAssignment;
  };

  const createExperiment = (spec: ExperimentSpec) => {
    setExperiments(prev => [spec, ...prev]);
    api.experiments.create(spec).catch(err => console.warn('API sync:', err));
  };

  const updateExperiment = (updatedSpec: ExperimentSpec) => {
    setExperiments(prev => prev.map(e => e.id === updatedSpec.id ? updatedSpec : e));
    if (editingExperiment?.id === updatedSpec.id) {
      setEditingExperiment(updatedSpec);
    }
    api.experiments.update(updatedSpec.id, updatedSpec).catch(err => console.warn('API sync:', err));
  };

  const cloneExperiment = (sourceId: string, authorTeacher: User): ExperimentSpec => {
    const source = experiments.find(e => e.id === sourceId);
    if (!source) throw new Error('Experiment not found');

    const cloned: ExperimentSpec = {
      ...source,
      id: `exp-custom-${Date.now().toString(36)}`,
      title: `Copy of ${source.title}`,
      ownerType: 'teacher',
      schoolId: authorTeacher.schoolId,
      teacherId: authorTeacher.id,
      authorName: authorTeacher.name,
      clonedFrom: source.id,
      status: 'draft'
    };

    setExperiments(prev => [cloned, ...prev]);
    api.experiments.clone(sourceId, authorTeacher).catch(err => console.warn('API sync:', err));
    return cloned;
  };

  const gradeStudentAttempt = (
    attemptId: string,
    scoreUpdates: { questionId: string; teacherScore: number; feedback?: string }[],
    teacherComments: string
  ) => {
    setAttempts(prev => prev.map(att => {
      if (att.id !== attemptId) return att;

      const updatedAnswers = att.answers.map(ans => {
        const update = scoreUpdates.find(u => u.questionId === ans.questionId);
        if (update) {
          return {
            ...ans,
            teacherScore: update.teacherScore,
            feedback: update.feedback || ans.feedback
          };
        }
        return ans;
      });

      const questionMarks = updatedAnswers.reduce((acc, a) => acc + (a.teacherScore !== undefined ? a.teacherScore : a.autoScore), 0);
      const proceduralMarks = att.stepLogs.reduce((acc, l) => acc + l.marksEarned, 0);
      const totalScore = questionMarks + proceduralMarks;
      const percentage = Math.round((totalScore / att.maxScore) * 100);

      return {
        ...att,
        answers: updatedAnswers,
        totalScore,
        percentage,
        teacherComments,
        status: 'graded'
      };
    }));

    api.attempts.grade(attemptId, scoreUpdates, teacherComments).catch(err => console.warn('API sync:', err));
  };

  const releaseGrades = (assignmentId: string) => {
    setAttempts(prev => prev.map(att => {
      if (att.assignmentId === assignmentId) {
        return { ...att, teacherFeedbackReleased: true };
      }
      return att;
    }));

    api.attempts.releaseGrades(assignmentId).catch(err => console.warn('API sync:', err));
  };

  const startExperiment = (
    experiment: ExperimentSpec,
    assignment?: Assignment | null,
    mode?: 'practice' | 'exam'
  ) => {
    setActiveExperiment(experiment);
    setActiveAssignment(assignment || null);
    setActiveLabMode(mode || (assignment ? assignment.mode : 'practice'));
    setCurrentView('lab');
    syncUrlToView('lab', { experimentId: experiment.id, mode: mode || 'practice' });
  };

  const submitExperimentAttempt = (
    attemptData: Omit<Attempt, 'id' | 'startedAt' | 'submittedAt'> & { startedAt: string }
  ): Attempt => {
    const newAttempt: Attempt = {
      ...attemptData,
      id: `att-${Date.now().toString(36)}`,
      submittedAt: new Date().toISOString()
    };

    setAttempts(prev => [newAttempt, ...prev]);

    if (newAttempt.assignmentId) {
      setAssignments(prev => prev.map(asg => {
        if (asg.id === newAttempt.assignmentId) {
          return { ...asg, submittedCount: asg.submittedCount + 1 };
        }
        return asg;
      }));
    }

    api.attempts.submit(attemptData).catch(err => console.warn('API sync:', err));

    return newAttempt;
  };

  const openAttemptReview = (attempt: Attempt) => {
    setReviewingAttempt(attempt);
    setCurrentView('review_attempt');
    syncUrlToView('review_attempt', { attemptId: attempt.id });
  };

  const resetAllToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.EXPERIMENTS);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.EMAILS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    setSchools([]);
    setUsers([]);
    setClasses([]);
    setExperiments([...INITIAL_EXPERIMENTS]);
    setAssignments([]);
    setAttempts([]);
    setSentEmails([]);
    setCurrentUser(null);
    setViewWithUrl('landing');

    api.health.reset().catch(err => console.warn('API reset:', err));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        schools,
        users,
        classes,
        experiments,
        assignments,
        attempts,
        sentEmails,
        latestDispatchedEmail,
        clearDispatchedEmail,
        changePassword,
        currentView,
        authMode,
        activeExperiment,
        activeAssignment,
        activeLabMode,
        reviewingAttempt,
        theme,
        toggleTheme,
        login,
        logout,
        switchUser,
        setCurrentView: setViewWithUrl,
        setAuthMode,
        registerSchool,
        registerSuperAdmin,
        registerStudent,
        registerTeacher,
        deleteSchool,
        deleteTeacher,
        deleteUser,
        deleteExperiment,
        addClass,
        promoteExperimentToSchool,
        createAssignment,
        createExperiment,
        updateExperiment,
        cloneExperiment,
        editingExperiment,
        openExperimentEditor,
        gradeStudentAttempt,
        releaseGrades,
        startExperiment,
        submitExperimentAttempt,
        openAttemptReview,
        resetAllToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
