import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/shared/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { SchoolAdminDashboard } from './components/schooladmin/SchoolAdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LabWorkspace } from './components/lab/LabWorkspace';
import { AttemptReviewView } from './components/teacher/AttemptReviewView';
import { ExperimentBuilder } from './components/teacher/ExperimentBuilder';
import { EmailDispatchModal } from './components/shared/EmailDispatchModal';
import { PasswordChangeModal } from './components/shared/PasswordChangeModal';
import { SettingsModal } from './components/shared/SettingsModal';

const AppContent: React.FC = () => {
  const { currentUser, currentView } = useApp();

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${
      currentUser
        ? 'bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
        : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    }`}>
      <Navbar />

      {/* Global Modals for Email Dispatch, Password Reset & Account Settings */}
      <EmailDispatchModal />
      <PasswordChangeModal />
      <SettingsModal />

      <main className="flex-1">
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'auth' && <AuthPage />}
        {!currentUser && currentView !== 'auth' && currentView !== 'landing' && currentView !== 'lab' && <LandingPage />}
        
        {currentUser && currentView === 'dashboard' && (
          <>
            {currentUser.role === 'super_admin' && <SuperAdminDashboard />}
            {currentUser.role === 'school_admin' && <SchoolAdminDashboard />}
            {currentUser.role === 'teacher' && <TeacherDashboard />}
            {currentUser.role === 'student' && <StudentDashboard />}
          </>
        )}

        {currentView === 'lab' && <LabWorkspace />}
        {currentUser && currentView === 'review_attempt' && <AttemptReviewView />}
        {currentUser && currentView === 'builder' && <ExperimentBuilder />}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">STEM-SPARK-LAB</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Secondary school science practicals</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span>Chemistry, Physics & Biology practicals</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
