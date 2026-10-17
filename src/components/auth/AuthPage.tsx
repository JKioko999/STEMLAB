import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { 
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  Shield,
  Building,
  GraduationCap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  FlaskConical,
  ShieldCheck,
  ClipboardCheck,
  Zap
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { 
    schools, 
    classes, 
    users, 
    login, 
    registerSchool,
    registerStudent, 
    registerSuperAdmin,
    authMode, 
    setAuthMode,
    setCurrentView
  } = useApp();

  if (authMode === 'forgot_password') {
    return <ForgotPasswordPage />;
  }

  // School registration form state
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    registrationNumber: '',
    county: 'Nairobi',
    subCounty: 'Central',
    category: 'National' as const,
    subscriptionPlan: 'Institutional Pro' as const,
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: ''
  });

  // Student registration form state
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    schoolId: schools[0]?.id || '',
    classId: '',
    admissionNumber: '',
    password: ''
  });

  // Filter state for student stream selection
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'chemistry' | 'physics' | 'biology'>('all');
  const [formYearFilter, setFormYearFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');

  // Regular login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    setupKey: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected school for student registration
  const selectedSchool = schools.find(s => s.id === studentForm.schoolId) || schools[0];

  // Classes registered under the selected school
  const availableClasses = classes.filter(c => c.schoolId === studentForm.schoolId);

  // Filtered classes based on subject and form year
  const filteredClasses = availableClasses.filter(c => {
    const matchesSubject = subjectFilter === 'all' || c.subject.toLowerCase() === subjectFilter;
    const matchesYear = formYearFilter === 'all' || c.formYear.toString() === formYearFilter;
    return matchesSubject && matchesYear;
  });

  const handleSchoolChange = (newSchoolId: string) => {
    setStudentForm(prev => ({
      ...prev,
      schoolId: newSchoolId,
      classId: ''
    }));
    setRegistrationError('');
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');
    if (schoolForm.adminPassword.trim().length < 8) {
      setRegistrationError('Choose a password of at least 8 characters for the administrator account.');
      return;
    }
    setIsSubmitting(true);

    if (!schoolForm.name.trim() || !schoolForm.adminName.trim() || !schoolForm.adminEmail.trim()) {
      setRegistrationError('Fill in all required school and administrator fields.');
      return;
    }

    try {
      const created = await registerSchool({
        name: schoolForm.name.trim(),
        registrationNumber: schoolForm.registrationNumber.trim() || `MOE/REG/${Math.floor(10000 + Math.random() * 90000)}/2026`,
        county: schoolForm.county.trim() || 'Nairobi',
        subCounty: schoolForm.subCounty.trim() || 'Central',
        category: schoolForm.category,
        subscriptionPlan: schoolForm.subscriptionPlan,
        adminName: schoolForm.adminName.trim(),
        adminEmail: schoolForm.adminEmail.trim(),
        phone: schoolForm.phone.trim() || '+254 700 000 000'
      }, schoolForm.adminPassword.trim());

      setSuccessMessage(`School ${created.name} registered. Opening dashboard...`);
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to register school');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');

    if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.admissionNumber.trim()) {
      setRegistrationError('Fill in all student fields (full name, email, and admission number).');
      return;
    }

    if (!studentForm.schoolId) {
      setRegistrationError('Select your registered secondary school.');
      return;
    }

    if (!studentForm.classId) {
      setRegistrationError('Select your registered class stream.');
      return;
    }

    if (studentForm.password.trim().length < 8) {
      setRegistrationError('Choose a password of at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStudent = await registerStudent({
        name: studentForm.name.trim(),
        email: studentForm.email.trim(),
        schoolId: studentForm.schoolId,
        classId: studentForm.classId,
        admissionNumber: studentForm.admissionNumber.trim(),
        password: studentForm.password.trim()
      });

      setSuccessMessage(`Account created for ${newStudent.name}. Redirecting to dashboard...`);
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to register student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
      setRegistrationError('Please fill in all fields (name, email, and password).');
      return;
    }
    if (adminForm.password.trim().length < 8) {
      setRegistrationError('Use a password of at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newAdmin = await registerSuperAdmin({
        name: adminForm.name.trim(),
        email: adminForm.email.trim().toLowerCase(),
        password: adminForm.password.trim(),
        setupKey: adminForm.setupKey.trim() || undefined
      });
      setSuccessMessage(`Platform Super Administrator account initialized for ${newAdmin.name}. Redirecting to dashboard...`);
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to initialize Platform Super Administrator');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const trimmedEmail = loginForm.email.toLowerCase().trim();
    const cleanPassword = loginForm.password.trim();

    if (!trimmedEmail || !cleanPassword) {
      setLoginError('Please enter both your email address and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.users.login(trimmedEmail, cleanPassword);
      if (res.success && res.user) login(res.user);
    } catch (apiErr: any) {
      setLoginError(apiErr.message || 'We could not sign you in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goMode = (m: 'login' | 'register_student' | 'register_school' | 'register_admin' | 'forgot_password') => {
    setAuthMode(m);
    setLoginError('');
    setRegistrationError('');
    setSuccessMessage('');
  };

  const panel = {
    login: { title: 'Welcome back', body: 'Pick up where you left off: assigned practicals, marked attempts, and class progress.' },
    register_student: { title: 'Join your class lab', body: 'Create your account, choose your school and stream, and start your KCSE practicals.' },
    register_school: { title: 'Bring your school online', body: 'Enrol your school, add science teachers, and give every student access to a virtual lab.' },
    register_admin: { title: 'Platform setup', body: 'Secure the master account that manages schools, curriculum and platform health.' }
  }[authMode as 'login' | 'register_student' | 'register_school' | 'register_admin'] || { title: 'Welcome', body: '' };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/20">
      <div className="w-full max-w-6xl grid lg:grid-cols-[5fr_7fr] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/5 overflow-hidden">

        {/* Brand panel */}
        <aside className="relative hidden lg:flex flex-col justify-between p-10 text-white bg-slate-900 overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, #10b981 0, transparent 45%), radial-gradient(circle at 90% 90%, #6366f1 0, transparent 40%)' }} />
          <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <FlaskConical className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="font-bold tracking-tight text-lg">STEM-SPARK-LAB</span>
          </div>

          <div className="relative space-y-6">
            <div>
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">{panel.title}</h1>
              <p className="mt-3 text-slate-300 text-[15px] leading-relaxed max-w-sm">{panel.body}</p>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-200">
              <li className="flex items-start gap-3"><Zap className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" /><span>Interactive KCSE chemistry, physics and biology practicals</span></li>
              <li className="flex items-start gap-3"><ClipboardCheck className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" /><span>Digital answer sheets with automatic marking for teachers</span></li>
              <li className="flex items-start gap-3"><ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" /><span>Each school's data stays separate and protected</span></li>
            </ul>
          </div>

          <p className="relative text-xs text-slate-400">Built for Kenyan secondary schools by Intellica Automation Group.</p>
        </aside>

        {/* Form panel */}
        <section className="min-w-0 flex flex-col">

        {/* Navigation back to landing page + mode switcher */}
        <div className="px-5 sm:px-8 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to overview</span>
            </button>
            <div className="lg:hidden flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <FlaskConical className="w-4 h-4 text-emerald-600" /> STEM-SPARK-LAB
            </div>
          </div>
          <div role="tablist" aria-label="Account actions" className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar self-start max-w-full">
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                onClick={() => goMode('login')}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'register_student'}
                onClick={() => goMode('register_student')}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  authMode === 'register_student'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Student
              </button>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div role="status" className="mx-5 sm:mx-8 mt-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {registrationError && (
          <div role="alert" className="mx-5 sm:mx-8 mt-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center space-x-2 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{registrationError}</span>
          </div>
        )}

        <div className="p-5 sm:p-8 flex-1">
          
          {/* 1. REGISTER SCHOOL */}
          {authMode === 'register_school' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Register new secondary school
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Onboard your institution to access standardized science practicals, manage teachers, and grade student laboratory attempts.
                </p>
              </div>

              <form onSubmit={handleSchoolSubmit} className="space-y-4">
                
                {/* School Details */}
                <div className="space-y-3">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    1. Institution details
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        School name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter official school name"
                        value={schoolForm.name}
                        onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Registration number (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MOE/REG/00102"
                        value={schoolForm.registrationNumber}
                        onChange={e => setSchoolForm({ ...schoolForm, registrationNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        County *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nairobi"
                        value={schoolForm.county}
                        onChange={e => setSchoolForm({ ...schoolForm, county: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={schoolForm.category}
                        onChange={e => setSchoolForm({ ...schoolForm, category: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="National">National</option>
                        <option value="Extra-County">Extra-County</option>
                        <option value="County">County</option>
                        <option value="Sub-County">Sub-County</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Curriculum package
                      </label>
                      <select
                        value={schoolForm.subscriptionPlan}
                        onChange={e => setSchoolForm({ ...schoolForm, subscriptionPlan: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="Institutional Pro">Institutional Pro (Full Lab)</option>
                        <option value="Standard KCSE Prep">Standard KCSE Prep</option>
                        <option value="Basic">Basic Science</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Administrator Details */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    2. School administrator account
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Principal / Administrator name *
                      </label>
                      <input
                        type="text"
                        required
                        value={schoolForm.adminName}
                        onChange={e => setSchoolForm({ ...schoolForm, adminName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Administrator email address *
                      </label>
                      <input
                        type="email"
                        required
                        value={schoolForm.adminEmail}
                        onChange={e => setSchoolForm({ ...schoolForm, adminEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Create a password * (at least 8 characters)
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={schoolForm.adminPassword}
                        onChange={e => setSchoolForm({ ...schoolForm, adminPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Contact phone number
                      </label>
                      <input
                        type="tel"
                        placeholder="+254 700 000 000"
                        value={schoolForm.phone}
                        onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-sm"
                  >
                    Complete school onboarding
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 2. REGISTER STUDENT */}
          {authMode === 'register_student' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Register student account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enroll as a student candidate to complete assignments, conduct standardized practicals, and view graded results.
                </p>
              </div>

              {schools.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 space-y-3">
                  <Building className="w-8 h-8 mx-auto text-slate-400" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">No secondary schools registered in database yet</p>
                    <p className="text-xs text-slate-500">Your school has not been added to the platform yet. Please ask your school to contact STEM-SPARK-LAB.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Select your secondary school *
                      </label>
                      <select
                        required
                        value={studentForm.schoolId}
                        onChange={e => handleSchoolChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        {schools.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.county} County)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Student full name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentForm.name}
                        onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Student admission number *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentForm.admissionNumber}
                        onChange={e => setStudentForm({ ...studentForm, admissionNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Create a password * (at least 8 characters)
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={studentForm.password}
                        onChange={e => setStudentForm({ ...studentForm, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Student email address *
                      </label>
                      <input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Class Stream Selection */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Select class stream *
                      </span>

                      {/* Filters */}
                      <div className="flex items-center space-x-2">
                        <select
                          value={subjectFilter}
                          onChange={e => setSubjectFilter(e.target.value as any)}
                          className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="all">All subjects</option>
                          <option value="chemistry">Chemistry</option>
                          <option value="physics">Physics</option>
                          <option value="biology">Biology</option>
                        </select>

                        <select
                          value={formYearFilter}
                          onChange={e => setFormYearFilter(e.target.value as any)}
                          className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="all">All forms</option>
                          <option value="1">Form 1</option>
                          <option value="2">Form 2</option>
                          <option value="3">Form 3</option>
                          <option value="4">Form 4</option>
                        </select>
                      </div>
                    </div>

                    {filteredClasses.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        No class streams created under {selectedSchool?.name || 'this school'} yet. The school administrator can add streams from the School Admin portal.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {filteredClasses.map(cls => {
                          const isSelected = studentForm.classId === cls.id;
                          return (
                            <div
                              key={cls.id}
                              onClick={() => {
                                setStudentForm(prev => ({ ...prev, classId: cls.id }));
                                setRegistrationError('');
                              }}
                              className={`p-3 rounded-md border text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between font-medium">
                                <span>{cls.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                  Form {cls.formYear}
                                </span>
                              </div>
                              <div className={`text-[11px] mt-1 ${isSelected ? 'text-white/80 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                                Subject: {cls.subject} • Teacher: {cls.teacherName || 'Unassigned'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={filteredClasses.length === 0}
                      className="w-full py-2 px-4 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-sm disabled:opacity-40"
                    >
                      Complete student registration
                    </button>
                  </div>

                </form>
              )}
            </div>
          )}

          {/* 3. REGULAR LOGIN */}
          {authMode === 'login' && (
            <div className="space-y-7 max-w-md">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Use the email address your school registered for you.
                </p>
              </div>

              {loginError && (
                <div role="alert" className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="username"
                      inputMode="email"
                      autoFocus
                      placeholder="you@school.ac.ke"
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => goMode('forgot_password')}
                      className="text-[13px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-10 pr-11 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(v => !v)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-slate-900"
                >
                  {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>) : 'Sign in'}
                </button>
              </form>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-5 gap-y-2">
                <span>New here?</span>
                <button type="button" onClick={() => goMode('register_student')} className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer">Create a student account</button>
              </div>
            </div>
          )}

          {/* 4. PLATFORM SUPER ADMIN SETUP */}
          {authMode === 'register_admin' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Platform Super Administrator Setup
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Set up or activate your Master Platform Administrator account to manage institutional deployments, curriculum, and global telemetry.
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-3.5 max-w-md">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={adminForm.name}
                    onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official administrator email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={adminForm.email}
                    onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Setup key * <span className="font-normal text-slate-500">(the SUPER_ADMIN_SETUP_KEY set in your hosting environment)</span>
                  </label>
                  <input
                    type="password"
                    autoComplete="off"
                    value={adminForm.setupKey}
                    onChange={e => setAdminForm({ ...adminForm, setupKey: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Permanent password *
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      placeholder="Choose your secure password"
                      value={adminForm.password}
                      onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition focus:outline-none focus:ring-1 focus:ring-slate-900 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Activate Platform Super Administrator
                </button>
              </form>
            </div>
          )}

        </div>

        </section>
      </div>
    </div>
  );
};