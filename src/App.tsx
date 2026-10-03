import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/shared/Navbar';
import { RoleBanner } from './components/shared/RoleBanner';
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
import { ShieldCheck, Award, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, currentView } = useApp();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar />
      {currentUser && currentView !== 'landing' && <RoleBanner />}

      {/* Global Modals for Email Dispatch & Password Reset */}
      <EmailDispatchModal />
      <PasswordChangeModal />

      <main className="flex-1">
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'auth' && <AuthPage />}
        {!currentUser && currentView !== 'auth' && currentView !== 'landing' && <LandingPage />}
        
        {currentUser && currentView === 'dashboard' && (
          <>
            {currentUser.role === 'super_admin' && <SuperAdminDashboard />}
            {currentUser.role === 'school_admin' && <SchoolAdminDashboard />}
            {currentUser.role === 'teacher' && <TeacherDashboard />}
            {currentUser.role === 'student' && <StudentDashboard />}
          </>
        )}

        {currentUser && currentView === 'lab' && <LabWorkspace />}
        {currentUser && currentView === 'review_attempt' && <AttemptReviewView />}
        {currentUser && currentView === 'builder' && <ExperimentBuilder />}
      </main>

      {/* Institutional Platform Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white">STEM-SPARK-LAB</span>
            <span className="text-slate-600">|</span>
            <span>Kenyan KCSE Virtual Science Laboratory Ecosystem</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              KCSE Paper 3 (233/3, 232/3, 231/3) Aligned
            </span>
            <span className="text-slate-600">•</span>
            <span>Multi-Tenant Architecture</span>
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
