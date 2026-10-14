import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  X,
  KeyRound,
  User as UserIcon,
  Sun,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  Shield,
  Bell,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  GraduationCap,
  Award,
  Layers,
  Laptop,
  Check,
  Save,
  RotateCcw
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    currentUser,
    schools,
    isSettingsOpen,
    setIsSettingsOpen,
    theme,
    setTheme,
    changePassword,
    userPreferences,
    updateUserPreferences,
    updateUserProfile,
    settingsActiveTab,
    setSettingsActiveTab
  } = useApp();

  const activeTab = settingsActiveTab || 'password';
  const setActiveTab = setSettingsActiveTab;

  // Change Password state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Profile Edit state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  if (!isSettingsOpen || !currentUser) return null;

  const currentSchool = schools.find(s => s.id === currentUser.schoolId);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsSubmittingPassword(true);

    try {
      changePassword(currentUser.id, newPassword);
      setPasswordSuccess('Password changed successfully! You can now use your new password for all subsequent logins.');
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    updateUserProfile({
      name: profileName.trim() || currentUser.name,
      phone: profilePhone.trim() || undefined
    });
    setProfileSuccess('Profile details saved successfully.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'National Super Admin', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'school_admin':
        return { label: 'School Administrator', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'teacher':
        return { label: 'Science Teacher', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'student':
        return { label: 'Secondary Student', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      default:
        return { label: role, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Account & Platform Settings</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{currentUser.name}</span>
                <span>·</span>
                <span className="font-mono">{currentUser.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Navigation Tabs + Content */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-[460px]">
          
          {/* Left Navigation Sidebar */}
          <nav className="sm:w-56 p-2 sm:p-3 bg-slate-50/50 dark:bg-slate-950/40 border-r border-slate-200 dark:border-slate-800 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible shrink-0 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
                activeTab === 'password'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
                activeTab === 'appearance'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span>Theme & Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Profile & Role Info</span>
            </button>

            <button
              onClick={() => setActiveTab('lab_preferences')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
                activeTab === 'lab_preferences'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>Lab & Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
                activeTab === 'notifications'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Alerts & Notifications</span>
            </button>

            <div className="mt-auto hidden sm:block p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">STEM Spark Lab</span>
              <span>KCSE Form 3 & 4 Science Suite v3.2</span>
            </div>
          </nav>

          {/* Right Tab Content Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
            
            {/* TAB 1: CHANGE PASSWORD */}
            {activeTab === 'password' && (
              <div className="space-y-4 max-w-lg animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>Change Account Password</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Update your password anytime to maintain strong security across school practicals and grading.
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Password Updated</span>
                      <span>{passwordSuccess}</span>
                    </div>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Update Error</span>
                      <span>{passwordError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Password (Optional Verification)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password if known"
                      value={currentPasswordInput}
                      onChange={e => setCurrentPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 shadow-2xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        New Password *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Min 6 characters</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter secure new password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 pr-10 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type new password to verify"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 shadow-2xs"
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Password Strength:</span>
                        <span className={`font-bold font-mono ${
                          newPassword.length >= 8 && /[0-9]/.test(newPassword)
                            ? 'text-emerald-500'
                            : newPassword.length >= 6
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        }`}>
                          {newPassword.length >= 8 && /[0-9]/.test(newPassword) ? 'Strong' : newPassword.length >= 6 ? 'Adequate' : 'Too Short'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            newPassword.length >= 8 && /[0-9]/.test(newPassword)
                              ? 'w-full bg-emerald-500'
                              : newPassword.length >= 6
                              ? 'w-2/3 bg-amber-500'
                              : 'w-1/3 bg-rose-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingPassword || !newPassword || !confirmPassword}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-md transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSubmittingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: THEME & APPEARANCE (MOVED FROM DASHBOARD HERE!) */}
            {activeTab === 'appearance' && (
              <div className="space-y-5 max-w-lg animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>Theme & Appearance Mode</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select your preferred visual environment for viewing workbenches and digital practical answer sheets.
                  </p>
                </div>

                {/* Theme Selector Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Light Theme Card */}
                  <div
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-3 relative ${
                      theme === 'light'
                        ? 'border-emerald-500 bg-white shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                          <Sun className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</span>
                      </div>
                      {theme === 'light' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Preview box */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="h-2 w-16 bg-slate-800 rounded-sm" />
                      <div className="h-1.5 w-24 bg-slate-300 rounded-sm" />
                      <div className="flex gap-1 pt-1">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="w-3 h-3 rounded-full bg-cyan-500" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug">
                      High-contrast clean white & grey, optimal for classroom projectors and daytime practicals.
                    </p>
                  </div>

                  {/* Dark Theme Card */}
                  <div
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-3 relative ${
                      theme === 'dark'
                        ? 'border-cyan-500 bg-slate-900 shadow-md text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center">
                          <Moon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</span>
                      </div>
                      {theme === 'dark' && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Preview box */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-2xs space-y-1.5">
                      <div className="h-2 w-16 bg-slate-100 rounded-sm" />
                      <div className="h-1.5 w-24 bg-slate-600 rounded-sm" />
                      <div className="flex gap-1 pt-1">
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="w-3 h-3 rounded-full bg-cyan-400" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      Sleek dark studio theme, reducing eye strain during lengthy multi-step virtual experiments.
                    </p>
                  </div>
                </div>

                {/* Additional display preference */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        Reduced Motion in Workbenches
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Simplify apparatus transitions and fluid drop animations
                      </span>
                    </div>
                    <button
                      onClick={() => updateUserPreferences({ reducedMotion: !userPreferences.reducedMotion })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        userPreferences.reducedMotion ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        userPreferences.reducedMotion ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROFILE & ROLE INFO */}
            {activeTab === 'profile' && (
              <div className="space-y-5 max-w-lg animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-500" />
                    <span>Profile & Institutional Credentials</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your institutional record and academic role on STEM Spark Lab.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {/* Role Badge and School Banner */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Current Role
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>

                  {currentSchool && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">{currentSchool.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{currentSchool.county} County</span>
                    </div>
                  )}

                  {/* Student-specific details */}
                  {currentUser.role === 'student' && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-850 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Admission No:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {currentUser.admissionNumber || 'ADM-2026'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Class Stream:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {currentUser.className || 'Form 3 East'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Teacher-specific details */}
                  {currentUser.role === 'teacher' && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-850 text-xs">
                      <span className="text-[10px] text-slate-400 block">Specialization:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {currentUser.subjectSpecialization || 'Chemistry & Biology Practical Lead'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Editable Profile Information Form */}
                <form onSubmit={handleProfileSave} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Permanent ID)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 shadow-2xs font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: LABORATORY & WORKBENCH PREFERENCES */}
            {activeTab === 'lab_preferences' && (
              <div className="space-y-4 max-w-lg animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>Workbench & Apparatus Simulation Settings</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Fine-tune physics behaviors, optical zoom, and interactive feedback for your science workbenches.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Sound Effects Toggle */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                        {userPreferences.soundEffects ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Apparatus Sound Effects
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Bubbling, pouring fluids, boiling, and electrical switch clicks
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => updateUserPreferences({ soundEffects: !userPreferences.soundEffects })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        userPreferences.soundEffects ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        userPreferences.soundEffects ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Auto-Save Drafts */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Save className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Auto-Save Digital Answer Sheet
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Automatically preserve meniscus values and graph points every 30 seconds
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => updateUserPreferences({ autoSaveDrafts: !userPreferences.autoSaveDrafts })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        userPreferences.autoSaveDrafts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        userPreferences.autoSaveDrafts ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Meniscus Loupe Magnification Level */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Default Burette Loupe Magnification
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {userPreferences.meniscusLoupeMagnification}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['2x', '3x', '4x'] as const).map(mag => (
                        <button
                          key={mag}
                          onClick={() => updateUserPreferences({ meniscusLoupeMagnification: mag })}
                          className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                            userPreferences.meniscusLoupeMagnification === mag
                              ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {mag} Zoom
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 max-w-lg animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-500" />
                    <span>Notification & Examination Alerts</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Control how you receive updates on newly dispatched science practicals and auto-marked attempts.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        Email Dispatch Alerts
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Receive email alerts whenever assignments are scheduled or marked
                      </span>
                    </div>
                    <button
                      onClick={() => updateUserPreferences({ emailNotifications: !userPreferences.emailNotifications })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        userPreferences.emailNotifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        userPreferences.emailNotifications ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Security: Passwords are encrypted and authenticated via institutional policy.
          </span>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
