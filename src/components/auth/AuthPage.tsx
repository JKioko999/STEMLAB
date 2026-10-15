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
  GraduationCap
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { 
    schools, 
    classes, 
    users, 
    login, 
    registerSchool,
    registerStudent, 
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

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');

    if (!schoolForm.name.trim() || !schoolForm.adminName.trim() || !schoolForm.adminEmail.trim()) {
      setRegistrationError('Fill in all required school and administrator fields.');
      return;
    }

    try {
      const created = registerSchool({
        name: schoolForm.name.trim(),
        registrationNumber: schoolForm.registrationNumber.trim() || `MOE/REG/${Math.floor(10000 + Math.random() * 90000)}/2026`,
        county: schoolForm.county.trim() || 'Nairobi',
        subCounty: schoolForm.subCounty.trim() || 'Central',
        category: schoolForm.category,
        subscriptionPlan: schoolForm.subscriptionPlan,
        adminName: schoolForm.adminName.trim(),
        adminEmail: schoolForm.adminEmail.trim(),
        phone: schoolForm.phone.trim() || '+254 700 000 000'
      }, schoolForm.adminPassword.trim() || undefined);

      setSuccessMessage(`School ${created.name} registered. Opening dashboard...`);
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to register school');
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
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

    try {
      const newStudent = registerStudent({
        name: studentForm.name.trim(),
        email: studentForm.email.trim(),
        schoolId: studentForm.schoolId,
        classId: studentForm.classId,
        admissionNumber: studentForm.admissionNumber.trim(),
        password: studentForm.password.trim() || undefined
      });

      setSuccessMessage(`Account created for ${newStudent.name}. Redirecting to dashboard...`);
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to register student');
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
      // 1. Authenticate with backend server API (which checks database and strictly validates password)
      const res = await api.users.login(trimmedEmail, cleanPassword);
      if (res.success && res.user) {
        login(res.user);
        setIsSubmitting(false);
        return;
      }
    } catch (apiErr: any) {
      const errMsg = apiErr.message || '';

      // Fallback check against local users state if server is unreachable
      const localUser = users.find(u => u.email.toLowerCase() === trimmedEmail);
      if (localUser) {
        const hasPermanentPassword = Boolean(localUser.password && localUser.password.trim().length > 0);
        const expected = hasPermanentPassword ? localUser.password : localUser.tempPassword;
        if (expected && expected.trim() === cleanPassword) {
          login(localUser);
          setIsSubmitting(false);
          return;
        } else {
          setLoginError('Incorrect password. Please verify your credentials or use "Forgot password" to reset.');
          setIsSubmitting(false);
          return;
        }
      }

      setLoginError(errMsg || 'Invalid credentials. No registered account found with that email address.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Navigation back to landing page */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to overview</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setLoginError(''); setRegistrationError(''); }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('register_student'); setLoginError(''); setRegistrationError(''); }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                authMode === 'register_student'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Register student
            </button>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {registrationError && (
          <div className="mx-6 mt-4 p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center space-x-2 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{registrationError}</span>
          </div>
        )}

        <div className="p-6">
          
          {/* 1. REGISTER SCHOOL */}
          {authMode === 'register_school' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        School name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter official school name"
                        value={schoolForm.name}
                        onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Registration number (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MOE/REG/00102"
                        value={schoolForm.registrationNumber}
                        onChange={e => setSchoolForm({ ...schoolForm, registrationNumber: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        County *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nairobi"
                        value={schoolForm.county}
                        onChange={e => setSchoolForm({ ...schoolForm, county: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={schoolForm.category}
                        onChange={e => setSchoolForm({ ...schoolForm, category: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="National">National</option>
                        <option value="Extra-County">Extra-County</option>
                        <option value="County">County</option>
                        <option value="Sub-County">Sub-County</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Curriculum package
                      </label>
                      <select
                        value={schoolForm.subscriptionPlan}
                        onChange={e => setSchoolForm({ ...schoolForm, subscriptionPlan: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Principal / Administrator name *
                      </label>
                      <input
                        type="text"
                        required
                        value={schoolForm.adminName}
                        onChange={e => setSchoolForm({ ...schoolForm, adminName: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Administrator email address *
                      </label>
                      <input
                        type="email"
                        required
                        value={schoolForm.adminEmail}
                        onChange={e => setSchoolForm({ ...schoolForm, adminEmail: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Institutional password (optional)
                      </label>
                      <input
                        type="password"
                        value={schoolForm.adminPassword}
                        onChange={e => setSchoolForm({ ...schoolForm, adminPassword: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Contact phone number
                      </label>
                      <input
                        type="tel"
                        placeholder="+254 700 000 000"
                        value={schoolForm.phone}
                        onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
                    <p className="text-xs text-slate-500">A school must be registered first before students can be enrolled.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register_school')}
                    className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors"
                  >
                    Register school now
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Select your secondary school *
                      </label>
                      <select
                        required
                        value={studentForm.schoolId}
                        onChange={e => handleSchoolChange(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        {schools.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.county} County)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Student full name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentForm.name}
                        onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Student admission number *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentForm.admissionNumber}
                        onChange={e => setStudentForm({ ...studentForm, admissionNumber: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Student email address *
                      </label>
                      <input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
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
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Sign in
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sign in with your registered school administrator, teacher, or student email.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot_password');
                        setLoginError('');
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign in'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
