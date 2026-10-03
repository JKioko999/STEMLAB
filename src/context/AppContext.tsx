import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, User, ClassGroup, Assignment, Attempt, ExperimentSpec, EmailDispatch } from '../types';
import { INITIAL_EXPERIMENTS } from '../data/experimentSpecs';
import { SEED_SCHOOLS, SEED_USERS, SEED_CLASSES, SEED_ASSIGNMENTS, SEED_ATTEMPTS, SEED_SCHOOL_EXPERIMENT } from '../data/seedData';

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
  authMode: 'login' | 'register_student' | 'register_school';
  activeExperiment: ExperimentSpec | null;
  activeAssignment: Assignment | null;
  activeLabMode: 'practice' | 'exam';
  reviewingAttempt: Attempt | null;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  setCurrentView: (view: 'dashboard' | 'lab' | 'builder' | 'review_attempt' | 'auth' | 'landing') => void;
  setAuthMode: (mode: 'login' | 'register_student' | 'register_school') => void;
  
  // Registration
  registerSchool: (schoolData: Omit<School, 'id' | 'createdAt' | 'status' | 'totalStudents' | 'totalTeachers'>, adminPassword?: string) => School;
  registerStudent: (studentData: { name: string; email: string; schoolId: string; classId: string; admissionNumber: string }) => User;
  registerTeacher: (teacherData: { name: string; email: string; schoolId: string; subjectSpecialization: string }) => User;
  
  // Deletion Actions
  deleteSchool: (schoolId: string) => void;
  deleteTeacher: (teacherId: string) => void;
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
  CURRENT_USER: 'stem_spark_user_v2',
  SCHOOLS: 'stem_spark_schools_v2',
  USERS: 'stem_spark_users_v2',
  CLASSES: 'stem_spark_classes_v2',
  EXPERIMENTS: 'stem_spark_experiments_v2',
  ASSIGNMENTS: 'stem_spark_assignments_v2',
  ATTEMPTS: 'stem_spark_attempts_v2',
  EMAILS: 'stem_spark_emails_v2'
};

const generateTempPassword = (prefix: 'Stem' | 'Tchr') => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}@${num}!`;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage fallbacks
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    return saved ? JSON.parse(saved) : SEED_SCHOOLS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : SEED_CLASSES;
  });

  const [experiments, setExperiments] = useState<ExperimentSpec[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
    return saved ? JSON.parse(saved) : [...INITIAL_EXPERIMENTS, SEED_SCHOOL_EXPERIMENT];
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : SEED_ASSIGNMENTS;
  });

  const [attempts, setAttempts] = useState<Attempt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return saved ? JSON.parse(saved) : SEED_ATTEMPTS;
  });

  const [sentEmails, setSentEmails] = useState<EmailDispatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMAILS);
    return saved ? JSON.parse(saved) : [];
  });

  const [latestDispatchedEmail, setLatestDispatchedEmail] = useState<EmailDispatch | null>(null);

  // Default to Super Admin (Platform Owner) so user lands straight into the requested top-level view
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return SEED_USERS[0]; // Super Admin
  });

  // UI Flow State
  const [currentView, setCurrentView] = useState<'dashboard' | 'lab' | 'builder' | 'review_attempt' | 'auth' | 'landing'>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register_student' | 'register_school'>('login');
  const [activeExperiment, setActiveExperiment] = useState<ExperimentSpec | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [activeLabMode, setActiveLabMode] = useState<'practice' | 'exam'>('practice');
  const [reviewingAttempt, setReviewingAttempt] = useState<Attempt | null>(null);
  const [editingExperiment, setEditingExperiment] = useState<ExperimentSpec | null>(null);

  const openExperimentEditor = (exp?: ExperimentSpec | null) => {
    setEditingExperiment(exp || null);
    setCurrentView('builder');
  };

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
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('auth');
    setAuthMode('login');
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setCurrentView('dashboard');
    }
  };

  const clearDispatchedEmail = () => {
    setLatestDispatchedEmail(null);
  };

  const changePassword = (userId: string, newPassword: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          mustChangePassword: false,
          tempPassword: undefined
        };
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        mustChangePassword: false,
        tempPassword: undefined
      } : null);
    }
  };

  // 1. Separate School Registration with Registration Number & Temporary Password Email
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

    // Dispatch official onboarding email with temporary password
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
    
    // If not super admin, switch to the new admin
    if (currentUser?.role !== 'super_admin') {
      setCurrentUser(newAdminUser);
      setCurrentView('dashboard');
    }

    return newSchool;
  };

  // 2. Separate Student Registration
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
      className: targetClass?.name || 'Form 3 East',
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

    return newStudentUser;
  };

  // 3. Teacher Appointment with Temporary Password Email
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

    // Dispatch appointment notification email
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

    return newTeacher;
  };

  // 4. Add Form Stream with Student Count field
  const addClass = (classData: Omit<ClassGroup, 'id'>) => {
    const studentCount = classData.studentCount !== undefined ? Number(classData.studentCount) : 40;
    const newClass: ClassGroup = {
      ...classData,
      id: `cls-${Date.now().toString(36)}`,
      studentCount: studentCount
    };
    setClasses(prev => [newClass, ...prev]);
    // Increment school total students
    setSchools(prev => prev.map(s => s.id === classData.schoolId ? { ...s, totalStudents: s.totalStudents + studentCount } : s));
  };

  const promoteExperimentToSchool = (experimentId: string, schoolId: string) => {
    const exp = experiments.find(e => e.id === experimentId);
    if (!exp) return;
    
    // Create a school tier copy or update
    const schoolExp: ExperimentSpec = {
      ...exp,
      id: `exp-school-${Date.now().toString(36)}`,
      ownerType: 'school',
      schoolId: schoolId,
      title: `[School Approved] ${exp.title}`,
      status: 'published'
    };

    setExperiments(prev => [schoolExp, ...prev]);
  };

  const deleteSchool = (schoolId: string) => {
    setSchools(prev => prev.filter(s => s.id !== schoolId));
    setUsers(prev => prev.filter(u => u.schoolId !== schoolId));
    setClasses(prev => prev.filter(c => c.schoolId !== schoolId));
    setAssignments(prev => prev.filter(a => a.schoolId !== schoolId));
    setExperiments(prev => prev.filter(e => e.schoolId !== schoolId));
    setAttempts(prev => prev.filter(a => a.schoolId !== schoolId));
    setSentEmails(prev => prev.filter(m => m.schoolName !== schools.find(s => s.id === schoolId)?.name));
  };

  const deleteTeacher = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    if (teacher && teacher.schoolId) {
      setSchools(prev => prev.map(s => s.id === teacher.schoolId ? { ...s, totalTeachers: Math.max(0, s.totalTeachers - 1) } : s));
    }
    setUsers(prev => prev.filter(u => u.id !== teacherId));
    setClasses(prev => prev.map(c => c.teacherId === teacherId ? { ...c, teacherId: '', teacherName: 'Unassigned' } : c));
  };

  const deleteExperiment = (experimentId: string) => {
    setExperiments(prev => prev.filter(e => e.id !== experimentId));
    setAssignments(prev => prev.filter(a => a.experimentId !== experimentId));
  };

  const createAssignment = (assignmentData: Omit<Assignment, 'id' | 'assignedAt' | 'submittedCount'>): Assignment => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `asg-${Date.now().toString(36)}`,
      assignedAt: new Date().toISOString(),
      submittedCount: 0
    };
    setAssignments(prev => [newAssignment, ...prev]);
    return newAssignment;
  };

  const createExperiment = (spec: ExperimentSpec) => {
    setExperiments(prev => [spec, ...prev]);
  };

  const updateExperiment = (updatedSpec: ExperimentSpec) => {
    setExperiments(prev => prev.map(e => e.id === updatedSpec.id ? updatedSpec : e));
    if (editingExperiment?.id === updatedSpec.id) {
      setEditingExperiment(updatedSpec);
    }
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

      // Recalculate total score
      const proceduralScores = att.stepLogs.reduce((acc, step) => acc + step.marksEarned, 0);
      const questionScores = updatedAnswers.reduce((acc, ans) => acc + (ans.teacherScore !== undefined ? ans.teacherScore : ans.autoScore), 0);
      const newTotal = proceduralScores + questionScores;
      const newPercentage = Math.round((newTotal / att.maxScore) * 100);

      return {
        ...att,
        answers: updatedAnswers,
        totalScore: newTotal,
        percentage: newPercentage,
        teacherComments,
        status: 'graded',
        teacherFeedbackReleased: true
      };
    }));
  };

  const releaseGrades = (assignmentId: string) => {
    setAttempts(prev => prev.map(att => {
      if (att.assignmentId === assignmentId) {
        return { ...att, teacherFeedbackReleased: true };
      }
      return att;
    }));
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

    // If linked to assignment, increment submitted count
    if (newAttempt.assignmentId) {
      setAssignments(prev => prev.map(asg => {
        if (asg.id === newAttempt.assignmentId) {
          return { ...asg, submittedCount: asg.submittedCount + 1 };
        }
        return asg;
      }));
    }

    return newAttempt;
  };

  const openAttemptReview = (attempt: Attempt) => {
    setReviewingAttempt(attempt);
    setCurrentView('review_attempt');
  };

  const resetAllToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.EXPERIMENTS);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    setSchools(SEED_SCHOOLS);
    setUsers(SEED_USERS);
    setClasses(SEED_CLASSES);
    setExperiments([...INITIAL_EXPERIMENTS, SEED_SCHOOL_EXPERIMENT]);
    setAssignments(SEED_ASSIGNMENTS);
    setAttempts(SEED_ATTEMPTS);
    setCurrentUser(SEED_USERS[0]);
    setCurrentView('dashboard');
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
        login,
        logout,
        switchUser,
        setCurrentView,
        setAuthMode,
        registerSchool,
        registerStudent,
        registerTeacher,
        deleteSchool,
        deleteTeacher,
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
