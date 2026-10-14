import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../shared/StatsCard';
import { 
  Plus, 
  Search, 
  MapPin, 
  Filter, 
  ExternalLink, 
  Play, 
  Mail, 
  Copy, 
  Trash2, 
  Eye, 
  X,
  Users as UsersIcon,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { ExperimentSpec, School, User } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { 
    schools, 
    users, 
    experiments, 
    attempts, 
    sentEmails,
    registerSchool, 
    deleteSchool,
    deleteUser,
    startExperiment, 
    switchUser,
    openSettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'schools' | 'users' | 'experiments' | 'analytics' | 'outbox'>('schools');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedCounty, setSelectedCounty] = useState('all');
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [selectedSchoolForDetails, setSelectedSchoolForDetails] = useState<School | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  // New School Form State
  const [newSchoolForm, setNewSchoolForm] = useState({
    name: '',
    registrationNumber: '',
    county: 'Nairobi',
    subCounty: 'Central',
    category: 'National' as const,
    subscriptionPlan: 'Institutional Pro' as const,
    adminName: '',
    adminEmail: '',
    phone: '+254 700 000 000'
  });

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalTeachers = users.filter(u => u.role === 'teacher').length;
  const globalExperiments = experiments.filter(e => e.ownerType === 'global');

  // Filtered Schools
  const filteredSchools = schools.filter(school => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = school.name.toLowerCase().includes(term) ||
                          (school.registrationNumber || '').toLowerCase().includes(term) ||
                          school.county.toLowerCase().includes(term) ||
                          school.adminName.toLowerCase().includes(term);
    const matchesCounty = selectedCounty === 'all' || school.county === selectedCounty;
    return matchesSearch && matchesCounty;
  });

  const [formError, setFormError] = useState('');
  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const uniqueCounties = Array.from(new Set(schools.map(s => s.county)));

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newSchoolForm.name.trim() || !newSchoolForm.registrationNumber.trim() || !newSchoolForm.adminName.trim() || !newSchoolForm.adminEmail.trim()) {
      setFormError('Fill in all required fields (school name, registration number, admin name, admin email).');
      return;
    }
    const targetSchoolName = newSchoolForm.name.trim();
    const targetAdminEmail = newSchoolForm.adminEmail.trim();

    registerSchool(newSchoolForm);
    setIsAddSchoolModalOpen(false);
    setSuccessNotification(`"${targetSchoolName}" registered successfully! Welcome credentials and temporary password sent directly to ${targetAdminEmail} from intellicaautomationgroup@gmail.com.`);
    setTimeout(() => setSuccessNotification(null), 6000);

    setNewSchoolForm({
      name: '',
      registrationNumber: '',
      county: 'Nairobi',
      subCounty: 'Central',
      category: 'National',
      subscriptionPlan: 'Institutional Pro',
      adminName: '',
      adminEmail: '',
      phone: '+254 700 000 000'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Direct Success Notification Toast */}
      {successNotification && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{successNotification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessNotification(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-100 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Admin overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Registered secondary schools, standardized practicals, and credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openSettings('password')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-sm cursor-pointer"
            title="Settings & Change Password"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setIsAddSchoolModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add school</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Registered schools"
          value={schools.length}
          subtitle={`Across ${uniqueCounties.length} counties`}
        />
        <StatsCard
          title="Students enrolled"
          value={totalStudents.toLocaleString()}
          subtitle="Active candidate accounts"
        />
        <StatsCard
          title="Teachers"
          value={totalTeachers}
          subtitle="Chemistry, physics, biology"
        />
        <StatsCard
          title="Practical attempts"
          value={attempts.length}
          subtitle="Completed student attempts"
        />
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-6 border-b border-slate-200 dark:border-slate-800 text-sm font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('schools')}
          className={`pb-2.5 -mb-px whitespace-nowrap transition-colors ${
            activeTab === 'schools'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Schools ({schools.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 -mb-px whitespace-nowrap transition-colors ${
            activeTab === 'users'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Registered Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('experiments')}
          className={`pb-2.5 -mb-px whitespace-nowrap transition-colors ${
            activeTab === 'experiments'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Curriculum practicals ({globalExperiments.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2.5 -mb-px whitespace-nowrap transition-colors ${
            activeTab === 'analytics'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Exam readiness
        </button>

        <button
          onClick={() => setActiveTab('outbox')}
          className={`pb-2.5 -mb-px whitespace-nowrap transition-colors ${
            activeTab === 'outbox'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Dispatched credentials ({sentEmails.length})
        </button>
      </div>

      {/* TAB 1: ALL REGISTERED SCHOOLS */}
      {activeTab === 'schools' && (
        <div className="space-y-3">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search school, principal, or county..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3" /> County:
              </span>
              <select
                value={selectedCounty}
                onChange={e => setSelectedCounty(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All counties ({schools.length})</option>
                {uniqueCounties.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schools Table */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Institution</th>
                    <th className="px-4 py-2.5">County</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Admin contact</th>
                    <th className="px-4 py-2.5">Plan</th>
                    <th className="px-4 py-2.5 text-right">Enrolled</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSchools.map(sch => {
                    const adminUser = users.find(u => u.schoolId === sch.id && u.role === 'school_admin');

                    return (
                      <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td 
                          onClick={() => setSelectedSchoolForDetails(sch)}
                          className="px-4 py-3 cursor-pointer group"
                        >
                          <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {sch.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {sch.registrationNumber || 'No code'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <div>{sch.county}</div>
                          <div className="text-[11px] text-slate-400">{sch.subCounty || 'Central'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {sch.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">{sch.adminName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{sch.adminEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {sch.subscriptionPlan}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-slate-900 dark:text-slate-100 font-medium">{sch.totalStudents} students</div>
                          <div className="text-[11px] text-slate-400">{sch.totalTeachers} teachers</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setSelectedSchoolForDetails(sch)}
                              className="px-2 py-1 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                              title="View details"
                            >
                              Details
                            </button>

                            {adminUser && (
                              <button
                                onClick={() => switchUser(adminUser.id)}
                                className="px-2 py-1 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
                                title="Login as school admin"
                              >
                                <span>Switch</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </button>
                            )}

                            <button
                              onClick={() => setSchoolToDelete(sch)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title={`Delete ${sch.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ALL REGISTERED USERS ACROSS PLATFORM */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          
          {/* User Search & Role Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Role:
              </span>
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All roles ({users.length})</option>
                <option value="super_admin">Platform Owner ({users.filter(u => u.role === 'super_admin').length})</option>
                <option value="school_admin">School Admin ({users.filter(u => u.role === 'school_admin').length})</option>
                <option value="teacher">Teachers ({users.filter(u => u.role === 'teacher').length})</option>
                <option value="student">Students ({users.filter(u => u.role === 'student').length})</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">User</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Affiliated School</th>
                    <th className="px-4 py-2.5">Details</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users
                    .filter(u => {
                      const term = searchTerm.toLowerCase();
                      const matchesSearch = u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
                      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map(u => {
                      const userSchool = schools.find(s => s.id === u.schoolId);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-slate-100">{u.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              u.role === 'super_admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                : u.role === 'school_admin'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : u.role === 'teacher'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}>
                              {u.role === 'super_admin' ? 'Platform Owner' : u.role === 'school_admin' ? 'School Admin' : u.role === 'teacher' ? 'Teacher' : 'Student'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {userSchool ? userSchool.name : (u.role === 'super_admin' ? 'System-Wide' : 'Unassigned')}
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {u.role === 'student' && u.admissionNumber && `Adm: ${u.admissionNumber} • ${u.className || ''}`}
                            {u.role === 'teacher' && (u.subjectSpecialization || 'Science Teacher')}
                            {u.role === 'school_admin' && 'Principal / Institutional Lead'}
                            {u.role === 'super_admin' && 'Master Platform Administrator'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => switchUser(u.id)}
                                className="px-2 py-1 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
                                title={`Switch to ${u.name}`}
                              >
                                <span>Switch</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </button>
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title={`Delete ${u.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No registered users in the database yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL EXPERIMENTS CATALOG */}
      {activeTab === 'experiments' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Official practical modules</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard curriculum practicals accessible across all registered secondary schools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalExperiments.map(exp => (
              <div 
                key={exp.id} 
                className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                      {exp.subject} • {exp.kcsePaper.split(' ')[0]}
                    </span>
                    <span className="text-xs text-slate-400">~{exp.estimatedDurationMinutes} min</span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">{exp.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>{exp.steps.length} steps</span>
                    <span>{exp.apparatus.length} apparatus</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => startExperiment(exp, null, 'practice')}
                    className="w-full py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch simulation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NATIONAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Curriculum assessment performance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated Paper 3 practical metrics across secondary schools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Chemistry (233/3)</div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">84.2%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average titre margin within ±0.15 cm³</p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Physics (232/3)</div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">79.6%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Circuit wiring completion rate</p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Biology (231/3)</div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">91.0%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Food test reagent observation concordancy</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMAIL OUTBOX */}
      {activeTab === 'outbox' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Dispatched credentials</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log of generated school admin and faculty onboarding accounts.
            </p>
          </div>

          {sentEmails.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No dispatched credentials recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sentEmails.map(mail => (
                <div key={mail.id} className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                        <span>{mail.recipientName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {mail.recipientRole === 'school_admin' ? 'Principal' : 'Teacher'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        <span>To: {mail.recipientEmail}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">From: {mail.senderEmail || 'intellicaautomationgroup@gmail.com'}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-xs text-slate-400 font-mono">
                      <div>{mail.sentAt}</div>
                      {mail.schoolName && <div className="text-slate-600 dark:text-slate-300 font-sans">{mail.schoolName}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block">Subject</span>
                      <div className="text-slate-800 dark:text-slate-200 truncate mt-0.5">{mail.subject}</div>
                    </div>

                    {mail.tempPassword && (
                      <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-medium text-slate-400 block">Temporary password</span>
                          <div className="text-slate-900 dark:text-slate-100 font-mono font-semibold text-xs mt-0.5">{mail.tempPassword}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(mail.tempPassword || '');
                          }}
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                    {mail.messageBody}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD SCHOOL */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Add school</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Register a secondary school into the platform.</p>
              </div>
              <button 
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSchool} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">School name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter official school name"
                    value={newSchoolForm.name}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Registration number *</label>
                  <input
                    type="text"
                    required
                    placeholder="MOE/REG/XXXXX"
                    value={newSchoolForm.registrationNumber}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, registrationNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">County *</label>
                  <input
                    type="text"
                    required
                    value={newSchoolForm.county}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, county: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newSchoolForm.category}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="National">National</option>
                    <option value="Extra-County">Extra-County</option>
                    <option value="County">County</option>
                    <option value="Sub-County">Sub-County</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Subscription tier</label>
                  <select
                    value={newSchoolForm.subscriptionPlan}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, subscriptionPlan: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Institutional Pro">Institutional Pro</option>
                    <option value="Standard KCSE Prep">Standard KCSE Prep</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Admin / Principal name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mr. Kenneth Ngigi"
                    value={newSchoolForm.adminName}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, adminName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Admin email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@school.ac.ke"
                    value={newSchoolForm.adminEmail}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, adminEmail: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="flex-1 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium shadow-sm"
                >
                  Save school
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {schoolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-md w-full p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete school</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-slate-100">{schoolToDelete.name}</strong>? This will remove all associated teachers, classes, and student accounts.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSchoolToDelete(null)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSchool(schoolToDelete.id);
                  setSchoolToDelete(null);
                }}
                className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER DELETE CONFIRMATION */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-md w-full p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete user</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <strong className="text-slate-900 dark:text-slate-100">{userToDelete.name}</strong> ({userToDelete.email}) from the system and Supabase database?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-sm"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCHOOL DETAILS */}
      {selectedSchoolForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-lg w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedSchoolForDetails.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedSchoolForDetails.county} County • {selectedSchoolForDetails.category}</p>
              </div>
              <button 
                onClick={() => setSelectedSchoolForDetails(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>Registration: <span className="font-mono text-slate-900 dark:text-slate-100">{selectedSchoolForDetails.registrationNumber || 'N/A'}</span></div>
                <div>Subscription: <span className="text-slate-900 dark:text-slate-100">{selectedSchoolForDetails.subscriptionPlan}</span></div>
                <div>Principal: <span className="text-slate-900 dark:text-slate-100">{selectedSchoolForDetails.adminName}</span></div>
                <div>Email: <span className="font-mono text-slate-900 dark:text-slate-100">{selectedSchoolForDetails.adminEmail}</span></div>
                <div>Students: <span className="text-slate-900 dark:text-slate-100 font-medium">{selectedSchoolForDetails.totalStudents}</span></div>
                <div>Teachers: <span className="text-slate-900 dark:text-slate-100 font-medium">{selectedSchoolForDetails.totalTeachers}</span></div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSchoolForDetails(null)}
                className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
