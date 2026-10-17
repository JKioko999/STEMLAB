import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, User, UserRole, ClassGroup, Assignment, Attempt, ExperimentSpec, EmailDispatch, UserPreferences, COMPANY_SENDER_EMAIL, COMPANY_SENDER_NAME } from '../types';
import { INITIAL_EXPERIMENTS } from '../data/experimentSpecs';
import { api, authToken } from '../services/api';

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
  changePassword: (userId: string, newPassword: string, currentPassword?: string) => Promise<void>;
  
  // Settings & Preferences
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsActiveTab: 'password' | 'appearance' | 'profile' | 'lab_preferences' | 'notifications';
  setSettingsActiveTab: (tab: 'password' | 'appearance' | 'profile' | 'lab_preferences' | 'notifications') => void;
  openSettings: (tab?: 'password' | 'appearance' | 'profile' | 'lab_preferences' | 'notifications') => void;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Navigation & Lab state
  currentView: 'dashboard' | 'lab' | 'builder' | 'review_attempt' | 'auth' | 'landing';
  landingTab: 'home' | 'about' | 'subjects' | 'workbenches' | 'curriculum' | 'schools' | 'faq';
  setLandingTab: (tab: 'home' | 'about' | 'subjects' | 'workbenches' | 'curriculum' | 'schools' | 'faq') => void;
  authMode: 'login' | 'register_student' | 'register_school' | 'register_admin' | 'forgot_password';
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
  setAuthMode: (mode: 'login' | 'register_student' | 'register_school' | 'register_admin' | 'forgot_password') => void;
  
  // Password Reset & OTP
  requestPasswordResetOtp: (email: string) => Promise<{ success: boolean; error?: string; otp?: string; user?: User; infoMessage?: string }>;
  verifyPasswordResetOtp: (email: string, enteredOtp: string) => Promise<{ valid: boolean; error?: string }>;
  resetPasswordWithOtp: (email: string, enteredOtp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Custom Email Dispatch
  sendUserEmail: (data: {
    to: string;
    toName?: string;
    subject: string;
    message: string;
    recipientRole?: UserRole;
    tempPassword?: string;
    schoolName?: string;
  }) => Promise<{ success: boolean; message: string; emailDispatch?: EmailDispatch }>;
  
  // Registration
  registerSchool: (schoolData: Omit<School, 'id' | 'createdAt' | 'status' | 'totalStudents' | 'totalTeachers'>, adminPassword?: string) => Promise<School>;
  registerSuperAdmin: (adminData: { name: string; email: string; password: string; setupKey?: string }) => Promise<User>;
  registerStudent: (studentData: { name: string; email: string; schoolId: string; classId: string; admissionNumber: string; password: string }) => Promise<User>;
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
    if (saved && authToken.get()) {
      try {
        const { password, tempPassword, ...safe } = JSON.parse(saved);
        return safe;
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
      if (path === '/auth' || path === '/forgot-password' || path === '/reset-password') return 'auth';
      if (path === '/lab') return 'lab';
      if (path === '/builder') return 'builder';
      if (path === '/review') return 'review_attempt';
      if (path === '/dashboard') return 'dashboard';
    }
    return 'landing';
  });

  const [landingTab, setLandingTab] = useState<'home' | 'about' | 'subjects' | 'workbenches' | 'curriculum' | 'schools' | 'faq'>('home');

  const [authMode, setAuthMode] = useState<'login' | 'register_student' | 'register_school' | 'register_admin' | 'forgot_password'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/forgot-password' || path === '/reset-password') return 'forgot_password';
    }
    return 'login';
  });

  // Password reset OTP active session
  const [activeResetSession, setActiveResetSession] = useState<{
    email: string;
    otp: string;
    expiresAt: number;
    user: User;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('stem_spark_reset_otp_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.expiresAt > Date.now()) return parsed;
        }
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (activeResetSession) {
        sessionStorage.setItem('stem_spark_reset_otp_session', JSON.stringify(activeResetSession));
      } else {
        sessionStorage.removeItem('stem_spark_reset_otp_session');
      }
    } catch (e) {}
  }, [activeResetSession]);
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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'password' | 'appearance' | 'profile' | 'lab_preferences' | 'notifications'>('password');

  const openSettings = (tab: 'password' | 'appearance' | 'profile' | 'lab_preferences' | 'notifications' = 'password') => {
    setSettingsActiveTab(tab);
    setIsSettingsOpen(true);
  };

  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('stem_user_preferences');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      soundEffects: true,
      reducedMotion: false,
      autoSaveDrafts: true,
      emailNotifications: true,
      meniscusLoupeMagnification: '3x'
    };
  });

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences(prev => {
      const updated = { ...prev, ...prefs };
      try {
        localStorage.setItem('stem_user_preferences', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
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
      targetPath = authMode === 'forgot_password' ? '/forgot-password' : '/auth';
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
      } else if (pathname === '/forgot-password' || pathname === '/reset-password') {
        setCurrentView('auth');
        setAuthMode('forgot_password');
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
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users.map(({ password, tempPassword, ...u }) => u)));
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
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(sentEmails.map(({ tempPassword, ...m }) => ({ ...m, messageBody: tempPassword ? m.messageBody.split(tempPassword).join('••••••••') : m.messageBody }))));
  }, [sentEmails]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify((({ password, tempPassword, ...u }) => u)(currentUser)));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    const onExpired = () => { setCurrentUser(null); setViewWithUrl('auth'); setAuthMode('login'); };
    window.addEventListener('stem:session-expired', onExpired);
    return () => window.removeEventListener('stem:session-expired', onExpired);
  }, []);

  const login = (user: User) => {
    setUsers(prev => {
      const exists = prev.some(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (exists) {
        return prev.map(u => (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()) ? { ...u, ...user } : u);
      }
      return [user, ...prev];
    });
    setCurrentUser(user);
    setViewWithUrl('dashboard');
  };

  const logout = () => {
    api.users.logout();
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

  const changePassword = async (userId: string, newPassword: string, currentPassword?: string) => {
    // The server is the authority; only update local state once it has accepted the change.
    await api.users.changePassword(newPassword, currentPassword);
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, mustChangePassword: false } : u)));
    setCurrentUser(prev => (prev && prev.id === userId ? { ...prev, mustChangePassword: false } : prev));
  };

  const requestPasswordResetOtp = async (email: string): Promise<{ success: boolean; error?: string; otp?: string; user?: User; infoMessage?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return { success: false, error: 'Please enter your registered email address.' };
    try {
      const res = await api.users.requestResetOtp(normalizedEmail);
      setActiveResetSession({ email: normalizedEmail, otp: '', expiresAt: Date.now() + 10 * 60 * 1000, user: { email: normalizedEmail } as User });
      return { success: true, user: { email: normalizedEmail, name: '' } as User, infoMessage: res.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Could not send a code. Please try again.' };
    }
  };

  const verifyPasswordResetOtp = async (email: string, enteredOtp: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const res = await api.users.verifyResetOtp(email, enteredOtp.trim());
      return res.success ? { valid: true } : { valid: false, error: 'That code is incorrect.' };
    } catch (err: any) {
      return { valid: false, error: err.message || 'Could not verify the code.' };
    }
  };

  const resetPasswordWithOtp = async (email: string, enteredOtp: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.users.changePassword(newPassword);
      setActiveResetSession(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Could not update your password. Please request a new code.' };
    }
  };

  const sendUserEmail = async (data: {
    to: string;
    toName?: string;
    subject: string;
    message: string;
    recipientRole?: UserRole;
    tempPassword?: string;
    schoolName?: string;
  }): Promise<{ success: boolean; message: string; emailDispatch?: EmailDispatch }> => {
    try {
      const res = await api.emails.send({
        to: data.to,
        toName: data.toName,
        subject: data.subject,
        message: data.message,
        recipientRole: data.recipientRole,
        tempPassword: data.tempPassword,
        schoolName: data.schoolName
      });

      if (res.emailDispatch) {
        setSentEmails(prev => [res.emailDispatch, ...prev]);
      }

      return { 
        success: true, 
        message: res.message || `Email sent from ${COMPANY_SENDER_EMAIL} to ${data.to}`, 
        emailDispatch: res.emailDispatch 
      };
    } catch (err: any) {
      console.warn('API send error:', err);
      const fallbackDispatch: EmailDispatch = {
        id: `email-${Date.now().toString(36)}`,
        senderEmail: COMPANY_SENDER_EMAIL,
        recipientEmail: data.to,
        recipientName: data.toName || data.to,
        recipientRole: data.recipientRole || 'student',
        subject: data.subject,
        messageBody: data.message,
        tempPassword: data.tempPassword,
        sentAt: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString()}`,
        schoolName: data.schoolName
      };
      setSentEmails(prev => [fallbackDispatch, ...prev]);
      return { 
        success: true, 
        message: `Email queued from ${COMPANY_SENDER_EMAIL} to ${data.to}.`, 
        emailDispatch: fallbackDispatch 
      };
    }
  };

  // 1. School registration (server creates the school + principal account, emails credentials, returns a session)
  const registerSchool = async (
    schoolData: Omit<School, 'id' | 'createdAt' | 'status' | 'totalStudents' | 'totalTeachers'>,
    adminPassword?: string
  ): Promise<School> => {
    const schoolId = `sch-${Date.now().toString(36)}`;
    const adminUserId = `usr-admin-${Date.now().toString(36)}`;
    const registrationNumber = schoolData.registrationNumber || `MOE/REG/${Math.floor(10000 + Math.random() * 90000)}/2026`;
    const res = await api.schools.create({ id: schoolId, ...schoolData, registrationNumber }, adminPassword, { schoolId, adminUserId });

    setSchools(prev => [res.school, ...prev]);
    setUsers(prev => [res.adminUser, ...prev]);
    if (res.emailDispatch) setSentEmails(prev => [res.emailDispatch, ...prev]);
    if (currentUser && res.emailDispatch) setLatestDispatchedEmail(res.emailDispatch);
    if (!currentUser && res.token) {
      setCurrentUser(res.adminUser);
      setCurrentView('dashboard');
    }
    return res.school;
  };

  // 1b. Platform Super Administrator registration (needs the setup key the first time)
  const registerSuperAdmin = async (adminData: { name: string; email: string; password: string; setupKey?: string }): Promise<User> => {
    const { user } = await api.users.registerAdmin(adminData);
    setUsers(prev => [user, ...prev.filter(u => u.id !== user.id)]);
    setCurrentUser(user);
    setCurrentView('dashboard');
    return user;
  };

  // 2. Student registration
  const registerStudent = async (studentData: {
    name: string; email: string; schoolId: string; classId: string; admissionNumber: string; password: string;
  }): Promise<User> => {
    const { user } = await api.users.registerStudent(studentData);
    setUsers(prev => [user, ...prev.filter(u => u.id !== user.id)]);
    setClasses(prev => prev.map(c => c.id === studentData.classId ? { ...c, studentCount: c.studentCount + 1 } : c));
    setSchools(prev => prev.map(s => s.id === studentData.schoolId ? { ...s, totalStudents: s.totalStudents + 1 } : s));
    setCurrentUser(user);
    setCurrentView('dashboard');
    return user;
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
      senderEmail: COMPANY_SENDER_EMAIL,
      recipientEmail: teacherData.email,
      recipientName: teacherData.name,
      recipientRole: 'teacher',
      subject: `Teacher Appointment Notice: STEM Spark Lab Portal Invitation - ${targetSchool?.name || 'School'}`,
      tempPassword: tempPassword,
      messageBody: `Dear ${teacherData.name},\n\nYou have been officially appointed as a Science Teacher (${teacherData.subjectSpecialization}) at ${targetSchool?.name || 'your institution'} on STEM-SPARK-LAB by Intellica Automation Group.\n\nYour temporary teacher login credentials are:\n• Portal URL: STEM-SPARK-LAB Kenya Portal\n• Username / Login Email: ${teacherData.email}\n• Temporary Password: ${tempPassword}\n\nSECURITY NOTICE: You will be prompted to replace this temporary password with a private permanent password immediately upon login.\n\nFrom: ${COMPANY_SENDER_NAME} <${COMPANY_SENDER_EMAIL}>\nRegards,\nIntellica Automation Group & STEM-SPARK-LAB Directorate\nSupport: ${COMPANY_SENDER_EMAIL}`,
      sentAt: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString()}`,
      schoolName: targetSchool?.name
    };

    setUsers(prev => [newTeacher, ...prev]);
    setSchools(prev => prev.map(s => s.id === teacherData.schoolId ? { ...s, totalTeachers: s.totalTeachers + 1 } : s));
    setSentEmails(prev => [emailDispatch, ...prev]);

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
        requestPasswordResetOtp,
        verifyPasswordResetOtp,
        resetPasswordWithOtp,
        sendUserEmail,
        isSettingsOpen,
        setIsSettingsOpen,
        settingsActiveTab,
        setSettingsActiveTab,
        openSettings,
        userPreferences,
        updateUserPreferences,
        updateUserProfile,
        setTheme,
        currentView,
        landingTab,
        setLandingTab,
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
