import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { 
    schools, 
    classes, 
    users, 
    login, 
    registerStudent, 
    authMode, 
    setAuthMode,
    setCurrentView
  } = useApp();

  // Student registration form state
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    schoolId: schools[0]?.id || '',
    classId: '',
    admissionNumber: '',
    password: ''
  });

  // Filter state for student teacher selection
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

  // Selected school
  const selectedSchool = schools.find(s => s.id === studentForm.schoolId) || schools[0];

  // Classes registered under the selected school
  const availableClasses = classes.filter(c => c.schoolId === studentForm.schoolId);

  // Filtered classes based on subject and form year
  const filteredClasses = availableClasses.filter(c => {
    const matchesSubject = subjectFilter === 'all' || c.subject.toLowerCase() === subjectFilter;
    const matchesYear = formYearFilter === 'all' || c.formYear.toString() === formYearFilter;
    return matchesSubject && matchesYear;
  });

  const selectedClass = classes.find(c => c.id === studentForm.classId);

  const handleSchoolChange = (newSchoolId: string) => {
    setStudentForm(prev => ({
      ...prev,
      schoolId: newSchoolId,
      classId: ''
    }));
    setRegistrationError('');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');

    if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.admissionNumber.trim()) {
      setRegistrationError('Fill in all student fields (full name, email, and admission number).');
      return;
    }

    if (!studentForm.schoolId) {
      setRegistrationError('Select your secondary school.');
      return;
    }

    if (!studentForm.classId) {
      setRegistrationError('Select your registered class stream.');
      return;
    }

    const newStudent = registerStudent({
      name: studentForm.name.trim(),
      email: studentForm.email.trim(),
      schoolId: studentForm.schoolId,
      classId: studentForm.classId,
      admissionNumber: studentForm.admissionNumber.trim()
    });

    setSuccessMessage(`Account created for ${newStudent.name}. Redirecting to dashboard...`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetUser = users.find(u => u.email.toLowerCase() === loginForm.email.toLowerCase().trim());
    if (targetUser) {
      login(targetUser);
    } else {
      setLoginError('No registered user found with that email address.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Navigation back to landing page */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to overview</span>
          </button>
          
          <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
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
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
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
          
          {/* 1. STUDENT REGISTRATION */}
          {authMode === 'register_student' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Register student account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select your school and class stream to connect with your science teacher.
                </p>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                
                {/* Personal Details */}
                <div className="space-y-3">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    1. Student details
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Full name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kevin Mwenda"
                        value={studentForm.name}
                        onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Email address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. student@school.ac.ke"
                        value={studentForm.email}
                        onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Admission number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NS/2026/0819"
                        value={studentForm.admissionNumber}
                        onChange={e => setStudentForm({ ...studentForm, admissionNumber: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* School Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    2. Secondary school *
                  </label>

                  <select
                    value={studentForm.schoolId}
                    onChange={e => handleSchoolChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="" disabled>Select school...</option>
                    {schools.map(sch => (
                      <option key={sch.id} value={sch.id}>
                        {sch.name} — {sch.county} County ({sch.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stream Selection */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      3. Select stream under {selectedSchool?.name || 'school'} *
                    </span>

                    {/* Filter controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Filter className="w-3 h-3 text-slate-400" />
                        <span>Filter:</span>
                      </div>

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
                      No streams match the filter criteria under {selectedSchool?.name}.
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
                            className={`p-3 rounded-md border transition-colors cursor-pointer text-xs flex flex-col justify-between ${
                              isSelected
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-900 dark:border-slate-100'
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {cls.subject} · Form {cls.formYear}
                                </span>
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5">
                                  {cls.name}
                                </h4>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {cls.studentCount} capacity
                              </span>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                              Teacher: {cls.teacherName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedClass && (
                    <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Selected: <strong className="text-slate-900 dark:text-slate-100">{selectedClass.name}</strong> ({selectedClass.subject})</span>
                      <span>Teacher: {selectedClass.teacherName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-sm"
                  >
                    Complete registration
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 2. REGULAR LOGIN */}
          {authMode === 'login' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Sign in
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sign in with your registered school, faculty, or student account.
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
                    placeholder="e.g. faith.wanjiku@student.ac.ke"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password (optional for demo)
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-sm"
                >
                  Sign in
                </button>
              </form>

              {/* Instant Test Personas */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  Quick sign-in personas for testing:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(x => x.role === 'super_admin');
                      if (u) login(u);
                    }}
                    className="p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 text-left transition-colors"
                  >
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      Admin
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Super Admin
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(x => x.role === 'school_admin' && x.schoolId === 'sch-nairobi-school-00') || users.find(x => x.role === 'school_admin');
                      if (u) login(u);
                    }}
                    className="p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 text-left transition-colors"
                  >
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      School admin
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Mr. Kenneth Ngigi
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(x => x.id === 'usr-teacher-ns-chem') || users.find(x => x.role === 'teacher');
                      if (u) login(u);
                    }}
                    className="p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 text-left transition-colors"
                  >
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      Teacher
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Mr. David Omondi (Chem)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(x => x.id === 'usr-student-kevin') || users.find(x => x.role === 'student');
                      if (u) login(u);
                    }}
                    className="p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 text-left transition-colors"
                  >
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      Student
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Kevin Mwenda
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
