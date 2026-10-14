import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { 
  ArrowLeft, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Lock,
  Building
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { 
    setAuthMode, 
    setCurrentView, 
    requestPasswordResetOtp, 
    verifyPasswordResetOtp, 
    resetPasswordWithOtp,
    login,
    schools
  } = useApp();

  // Workflow steps: 1 = email, 2 = otp, 3 = new password, 4 = complete
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Handle Step 1: Submit registered email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordResetOtp(trimmed);
      if (res.success && res.user) {
        setVerifiedUser(res.user);
        setStep(2);
        setResendCooldown(30);
        setSuccessNotice(res.infoMessage || `A 6-digit verification code has been dispatched to ${trimmed} from intellicaautomationgroup@gmail.com. Please check your email inbox.`);
      } else {
        setErrorMessage(res.error || `No registered account found with email "${trimmed}". Please use an already registered email.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request verification code. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Submit OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit OTP verification code.');
      return;
    }

    setLoading(true);
    try {
      const verification = await verifyPasswordResetOtp(email, cleanOtp);
      if (verification.valid) {
        setStep(3);
        setSuccessNotice('Identity verified successfully. You may now choose a new password.');
      } else {
        setErrorMessage(verification.error || 'Invalid verification code. Please enter the correct 6-digit code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await requestPasswordResetOtp(email);
      if (res.success) {
        setResendCooldown(30);
        setSuccessNotice(res.infoMessage || 'A new verification code has been dispatched from intellicaautomationgroup@gmail.com.');
      } else {
        setErrorMessage(res.error || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error resending code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Set new password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithOtp(email, otp, newPassword);
      if (res.success) {
        setStep(4);
      } else {
        setErrorMessage(res.error || 'Could not reset password. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 9) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);
  const userSchool = verifiedUser?.schoolId ? schools.find(s => s.id === verifiedUser.schoolId) : null;

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'Ministry / Platform Super Admin';
      case 'school_admin': return 'School Administrator';
      case 'teacher': return 'Science Teacher';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Top Header & Breadcrumb Navigation */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign in</span>
          </button>

          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Account Recovery
          </span>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between max-w-md mx-auto text-xs">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step === 1 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                  : step > 1 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-[11px] mt-1.5 font-medium ${
                step === 1 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
              }`}>
                Verify Email
              </span>
            </div>

            <div className={`flex-1 h-0.5 mx-2.5 transition-colors ${
              step > 1 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
            }`} />

            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step === 2 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                  : step > 2 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <span className={`text-[11px] mt-1.5 font-medium ${
                step === 2 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
              }`}>
                Input OTP
              </span>
            </div>

            <div className={`flex-1 h-0.5 mx-2.5 transition-colors ${
              step > 2 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
            }`} />

            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= 3 
                  ? (step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900')
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {step === 4 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
              </div>
              <span className={`text-[11px] mt-1.5 font-medium ${
                step >= 3 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
              }`}>
                New Password
              </span>
            </div>
          </div>
        </div>

        {/* Global Feedback Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successNotice && (
          <div className="mx-6 mt-4 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successNotice}</div>
          </div>
        )}

        <div className="p-6">
          
          {/* ========================================================================= */}
          {/* STEP 1: INPUT REGISTERED EMAIL */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Forgot your password?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Enter your registered institutional email address. Password reset requires an existing registered account. We will send a 6-digit One-Time Password (OTP) to verify your identity.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@school.ac.ke, student@school.edu"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Note: The email address must already be registered in STEM-SPARK-LAB.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying account & sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP Code</span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Remember your credentials? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: INPUT 6-DIGIT OTP */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Enter Verification Code (OTP)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  We have dispatched a 6-digit One-Time Password to <strong className="text-slate-900 dark:text-slate-100">{email}</strong> from <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">intellicaautomationgroup@gmail.com</span>. Enter it below to verify your account identity.
                </p>
              </div>

              {/* Verified User Identity Banner */}
              {verifiedUser && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center text-xs shrink-0">
                      {verifiedUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {verifiedUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {getRoleLabel(verifiedUser.role)} {userSchool ? `• ${userSchool.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Registered Account
                  </span>
                </div>
              )}

              {/* Security Notice */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Dispatched from intellicaautomationgroup@gmail.com</span>
                  For your account security, the 6-digit OTP code has been delivered solely to your registered email inbox. Check your inbox and spam folder.
                </div>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      6-Digit OTP Verification Code *
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Valid for 10 minutes
                    </span>
                  </div>
                  
                  <input
                    ref={otpInputRef}
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      setErrorMessage('');
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-center tracking-[0.4em] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={otp.length !== 6}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Verify Code & Continue</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setErrorMessage('');
                    }}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline cursor-pointer"
                  >
                    Change email address
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className={`font-semibold flex items-center gap-1 ${
                      resendCooldown > 0 
                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                        : 'text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CREATE NEW PASSWORD */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Set New Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Choose a new strong password for your registered account (<strong className="text-slate-900 dark:text-slate-100">{email}</strong>).
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={e => {
                        setNewPassword(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full pr-10 pl-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">Password strength:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 4 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={e => {
                        setConfirmPassword(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full pr-10 pl-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-[11px] mt-1 font-medium ${
                      newPassword === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match yet'}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Reset Password & Save</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: PASSWORD RESET SUCCESS */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 dark:border-emerald-600 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Password Reset Successfully!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Your password for <strong className="text-slate-800 dark:text-slate-200 font-mono">{email}</strong> has been updated. You can now log into your STEM-SPARK-LAB account with your new credentials.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2.5 pt-2">
                {verifiedUser && (
                  <button
                    type="button"
                    onClick={() => {
                      login(verifiedUser);
                    }}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Sign In & Open Dashboard Directly</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Return to Sign In Page
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
