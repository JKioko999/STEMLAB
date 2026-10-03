import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../shared/StatsCard';
import { 
  Building2, 
  Users, 
  BookOpen, 
  FlaskConical, 
  Plus, 
  Search, 
  MapPin, 
  Filter, 
  CheckCircle, 
  ExternalLink, 
  Play, 
  Layers, 
  TrendingUp,
  Sliders,
  Sparkles,
  Mail,
  Lock,
  Copy,
  Check,
  Send,
  Trash2,
  Eye,
  AlertTriangle,
  GraduationCap,
  Phone,
  X
} from 'lucide-react';
import { ExperimentSpec, School } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { 
    schools, 
    users, 
    classes,
    experiments, 
    attempts, 
    sentEmails,
    registerSchool, 
    deleteSchool,
    startExperiment, 
    switchUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'schools' | 'experiments' | 'analytics' | 'outbox'>('schools');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('all');
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [selectedSchoolForDetails, setSelectedSchoolForDetails] = useState<School | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  // New School Form Modal State
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
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (school.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          school.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          school.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCounty = selectedCounty === 'all' || school.county === selectedCounty;
    return matchesSearch && matchesCounty;
  });

  const [formError, setFormError] = useState('');

  const uniqueCounties = Array.from(new Set(schools.map(s => s.county)));

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newSchoolForm.name.trim() || !newSchoolForm.registrationNumber.trim() || !newSchoolForm.adminName.trim() || !newSchoolForm.adminEmail.trim()) {
      setFormError('Please fill in all required fields (School Name, Registration Number, Admin Name, and Admin Email).');
      return;
    }
    registerSchool(newSchoolForm);
    setIsAddSchoolModalOpen(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Platform Owner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-850 to-slate-900 border border-emerald-500/20 p-6 rounded-3xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Platform Owner Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            STEM-SPARK-LAB National Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Super Administrator Portal — Overseeing all registered secondary schools across Kenya, KCSE curricula, and digital lab infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddSchoolModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New School</span>
          </button>
        </div>
      </div>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registered Schools"
          value={schools.length}
          subtitle={`Across ${uniqueCounties.length} Kenyan counties`}
          icon={<Building2 className="w-5 h-5" />}
          color="emerald"
          trend={{ value: '+2 this month', isPositive: true }}
        />
        <StatsCard
          title="Candidate Students"
          value={totalStudents.toLocaleString()}
          subtitle="Active KCSE practical candidates"
          icon={<Users className="w-5 h-5" />}
          color="violet"
          trend={{ value: '100% active', isPositive: true }}
        />
        <StatsCard
          title="Science Teachers"
          value={totalTeachers}
          subtitle="Chemistry, Physics & Biology"
          icon={<BookOpen className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          title="Simulated Practicals"
          value={attempts.length}
          subtitle="Lab sessions completed & auto-graded"
          icon={<FlaskConical className="w-5 h-5" />}
          color="cyan"
          trend={{ value: 'Avg 88% pass rate', isPositive: true }}
        />
      </div>

      {/* Main Tabs */}
      <div className="border-b border-slate-800 flex space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('schools')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'schools'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Registered Schools ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('experiments')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'experiments'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Global KCSE Experiment Catalog ({globalExperiments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>National Exam Readiness Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('outbox')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'outbox'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Outbox & Passwords ({sentEmails.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL REGISTERED SCHOOLS */}
      {activeTab === 'schools' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search school name, principal or county..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> County:
              </span>
              <select
                value={selectedCounty}
                onChange={e => setSelectedCounty(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Counties ({schools.length})</option>
                {uniqueCounties.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schools Table */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-850 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
                  <tr>
                    <th className="px-6 py-4">Institution Name</th>
                    <th className="px-6 py-4">County / Sub-County</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Principal / Contact</th>
                    <th className="px-6 py-4">Subscription</th>
                    <th className="px-6 py-4 text-center">Enrolled</th>
                    <th className="px-6 py-4 text-right">Quick Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {filteredSchools.map(sch => {
                    const schoolStudents = users.filter(u => u.schoolId === sch.id && u.role === 'student').length;
                    const schoolTeachers = users.filter(u => u.schoolId === sch.id && u.role === 'teacher').length;
                    const adminUser = users.find(u => u.schoolId === sch.id && u.role === 'school_admin');

                    return (
                      <tr key={sch.id} className="hover:bg-slate-750/50 transition">
                        <td 
                          onClick={() => setSelectedSchoolForDetails(sch)}
                          className="px-6 py-4 cursor-pointer group"
                        >
                          <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition flex items-center gap-1.5">
                            <span>{sch.name}</span>
                            <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-400 transition" />
                          </div>
                          <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                            Reg: {sch.registrationNumber || 'MOE/REG/PENDING'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {sch.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{sch.county} County</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{sch.subCounty || 'Central'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-600">
                            {sch.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-semibold">{sch.adminName}</div>
                          <div className="text-[11px] text-slate-400">{sch.adminEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            sch.subscriptionPlan === 'Institutional Pro'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}>
                            {sch.subscriptionPlan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-white font-bold">{sch.totalStudents} students</div>
                          <div className="text-[11px] text-slate-400">{sch.totalTeachers} teachers</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedSchoolForDetails(sch)}
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition"
                              title="View Full School Details & Classes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {adminUser && (
                              <button
                                onClick={() => switchUser(adminUser.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition inline-flex items-center gap-1"
                                title="Login as School Principal"
                              >
                                <span>Principal</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={() => setSchoolToDelete(sch)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition"
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

      {/* TAB 2: GLOBAL EXPERIMENTS CATALOG */}
      {activeTab === 'experiments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Official KCSE Practical Modules</h2>
              <p className="text-xs text-slate-400">
                These standardized experiments are pre-loaded by the developer and automatically accessible across all registered secondary schools in Kenya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {globalExperiments.map(exp => (
              <div 
                key={exp.id} 
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 flex flex-col justify-between hover:border-slate-600 transition shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      exp.subject === 'chemistry' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      exp.subject === 'physics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {exp.subject} • {exp.kcsePaper}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">~{exp.estimatedDurationMinutes} mins</span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">{exp.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>

                  <div className="mt-4 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-300">Curriculum Objectives:</div>
                    <ul className="text-xs text-slate-400 space-y-1 pl-3 list-disc">
                      {exp.objectives.slice(0, 2).map((obj, i) => (
                        <li key={i} className="line-clamp-1">{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <span>{exp.steps.length} Guided Steps</span>
                    <span>{exp.apparatus.length} Apparatus Items</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 flex gap-2">
                  <button
                    onClick={() => startExperiment(exp, null, 'practice')}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Simulation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NATIONAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Kenya National Science Exam Readiness</h2>
            <p className="text-xs text-slate-400">
              Aggregated Paper 3 practical performance metrics across all participating secondary schools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/70">
              <div className="text-xs font-semibold text-slate-400 uppercase">Chemistry Paper 3 (233/3)</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">84.2% Pass Rate</div>
              <p className="text-xs text-slate-400 mt-1">Average burette titre consistency: ±0.12 cm³ (KNEC compliant)</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/70">
              <div className="text-xs font-semibold text-slate-400 uppercase">Physics Paper 3 (232/3)</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">79.6% Pass Rate</div>
              <p className="text-xs text-slate-400 mt-1">Ohm's law circuit wiring error rate down 42% after simulation practice</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/70">
              <div className="text-xs font-semibold text-slate-400 uppercase">Biology Paper 3 (231/3)</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">91.0% Pass Rate</div>
              <p className="text-xs text-slate-400 mt-1">Biuret & Benedict's observation/inference accuracy at distinction level</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMAIL DISPATCH OUTBOX & CREDENTIALS */}
      {activeTab === 'outbox' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Mail className="w-4 h-4" />
                <span>Automated Email Dispatch Gateway</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Dispatched Credentials & Invitation Logs
              </h2>
              <p className="text-xs text-slate-400">
                Audit trail of all temporary passwords and activation emails sent to School Principals and Science Teachers.
              </p>
            </div>

            <div className="text-xs text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 font-mono">
              Total Messages: {sentEmails.length}
            </div>
          </div>

          {/* Guidance Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
            <Send className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300 block">How Institutional Email Delivery Works:</span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                In this cloud sandbox environment, all generated temporary passwords and invitations are preserved in this log. To send an actual message to the recipient's real mailbox, click <strong>"Send via Web Gmail"</strong> or <strong>"Send via Mail App"</strong> on any entry below to send it directly from your own email account.
              </p>
            </div>
          </div>

          {/* Email Entries List */}
          {sentEmails.length === 0 ? (
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-12 text-center text-slate-400 space-y-3">
              <Mail className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="font-bold text-white text-sm">No Emails Dispatched Yet</div>
              <p className="text-xs max-w-md mx-auto">
                When you click <strong>"Onboard School"</strong> or when a principal appoints a teacher, an activation message with a temporary password will be logged here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentEmails.map(mail => {
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(mail.recipientEmail)}&su=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.messageBody)}`;
                const mailtoUrl = `mailto:${encodeURIComponent(mail.recipientEmail)}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.messageBody)}`;

                return (
                  <div key={mail.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{mail.recipientName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-700 text-slate-300">
                              {mail.recipientRole === 'school_admin' ? 'School Principal' : 'Subject Teacher'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{mail.recipientEmail}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-mono block">{mail.sentAt}</span>
                        {mail.schoolName && (
                          <span className="text-[10px] text-emerald-400 font-semibold">{mail.schoolName}</span>
                        )}
                      </div>
                    </div>

                    {/* Temporary Password & Subject */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject</span>
                        <div className="text-white font-medium truncate">{mail.subject}</div>
                      </div>

                      {mail.tempPassword && (
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-400 block">Temporary Password</span>
                            <div className="text-amber-200 font-mono font-extrabold text-sm">{mail.tempPassword}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(mail.tempPassword || '');
                              alert(`Copied temporary password "${mail.tempPassword}" to clipboard!`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Message Body Excerpt */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                      {mail.messageBody}
                    </div>

                    {/* Quick Real Delivery Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(mail.messageBody);
                          alert('Copied full email text to clipboard!');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </button>

                      <a
                        href={mailtoUrl}
                        className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send via Mail Client</span>
                      </a>

                      <a
                        href={gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Send via Web Gmail</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add School Modal */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Onboard New Secondary School</h3>
              </div>
              <button 
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-slate-300 font-medium mb-1">School Official Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maseno School"
                  value={newSchoolForm.name}
                  onChange={e => setNewSchoolForm({ ...newSchoolForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  School Registration Number (MOE / KNEC) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MOE/REG/00520/2026 or KNEC/SCH/401102"
                  value={newSchoolForm.registrationNumber}
                  onChange={e => setNewSchoolForm({ ...newSchoolForm, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Official Kenyan Ministry of Education school registration identifier
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">County *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kisumu"
                    value={newSchoolForm.county}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, county: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newSchoolForm.category}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="National">National</option>
                    <option value="Extra-County">Extra-County</option>
                    <option value="County">County</option>
                    <option value="Sub-County">Sub-County</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Principal / Admin *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Peter Otieno"
                    value={newSchoolForm.adminName}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, adminName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. principal@maseno.ac.ke"
                    value={newSchoolForm.adminEmail}
                    onChange={e => setNewSchoolForm({ ...newSchoolForm, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span>✉ Automated Email Dispatch:</span>
                </div>
                <p className="text-slate-400">
                  An official welcome invitation with an auto-generated temporary password will be immediately sent to <strong>{newSchoolForm.adminEmail || 'the principal email'}</strong>. The administrator will be required to set a permanent private password upon their initial login.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
                >
                  Create School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Full Details Modal */}
      {selectedSchoolForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 text-xs text-slate-300 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Institution Profile
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    {selectedSchoolForDetails.registrationNumber || 'MOE/REG/PENDING'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                    {selectedSchoolForDetails.category} School
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  {selectedSchoolForDetails.name}
                </h2>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedSchoolForDetails.county} County • {selectedSchoolForDetails.subCounty || 'Central Sub-County'}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSchoolForDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin & Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Principal / Science HOD</span>
                <div className="text-white font-bold">{selectedSchoolForDetails.adminName}</div>
                <div className="text-slate-400 truncate">{selectedSchoolForDetails.adminEmail}</div>
                <div className="text-slate-500">{selectedSchoolForDetails.phone || '+254 700 000 000'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Science Faculty</span>
                <div className="text-2xl font-bold text-white">
                  {users.filter(u => u.schoolId === selectedSchoolForDetails.id && u.role === 'teacher').length}
                </div>
                <div className="text-slate-400">Registered Science Teachers</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Candidates</span>
                <div className="text-2xl font-bold text-emerald-400">
                  {selectedSchoolForDetails.totalStudents}
                </div>
                <div className="text-slate-400">
                  Across {classes.filter(c => c.schoolId === selectedSchoolForDetails.id).length} Active Streams
                </div>
              </div>
            </div>

            {/* Registered Teachers in this school */}
            <div className="space-y-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Teachers Assigned to this Institution ({users.filter(u => u.schoolId === selectedSchoolForDetails.id && u.role === 'teacher').length})</span>
              </h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {users.filter(u => u.schoolId === selectedSchoolForDetails.id && u.role === 'teacher').length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-slate-950 rounded-xl">No teachers assigned yet.</p>
                ) : (
                  users.filter(u => u.schoolId === selectedSchoolForDetails.id && u.role === 'teacher').map(t => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${t.avatarColor || 'bg-amber-600'}`}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{t.name}</div>
                          <div className="text-[11px] text-slate-400">{t.email}</div>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {t.subjectSpecialization || 'Science'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Class Streams under this school */}
            <div className="space-y-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>Registered Form Streams & Labs ({classes.filter(c => c.schoolId === selectedSchoolForDetails.id).length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {classes.filter(c => c.schoolId === selectedSchoolForDetails.id).length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-slate-950 rounded-xl sm:col-span-2">No class streams created yet.</p>
                ) : (
                  classes.filter(c => c.schoolId === selectedSchoolForDetails.id).map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400">Teacher: {c.teacherName}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 block">
                          Form {c.formYear} • {c.subject}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{c.studentCount} students</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSchoolToDelete(selectedSchoolForDetails)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete School</span>
              </button>

              <div className="flex items-center gap-2">
                {users.find(u => u.schoolId === selectedSchoolForDetails.id && u.role === 'school_admin') && (
                  <button
                    type="button"
                    onClick={() => {
                      const admin = users.find(u => u.schoolId === selectedSchoolForDetails.id && u.role === 'school_admin');
                      if (admin) {
                        switchUser(admin.id);
                        setSelectedSchoolForDetails(null);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <span>Enter as Principal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedSchoolForDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete School Confirmation Modal */}
      {schoolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2.5 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete School</h3>
                <span className="text-[11px] text-rose-300">Irreversible administrative action</span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong>{schoolToDelete.name}</strong> (Registration Code: <span className="font-mono text-white">{schoolToDelete.registrationNumber || schoolToDelete.id}</span>)?
            </p>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-[11px] space-y-1">
              <span className="font-bold block">This deletion will automatically purge:</span>
              <div>• Principal and administrative accounts</div>
              <div>• All registered Science Teacher accounts</div>
              <div>• All Form stream classes and student enrollment records</div>
              <div>• All student practical examination submissions and grades</div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSchoolToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSchool(schoolToDelete.id);
                  setSchoolToDelete(null);
                  setSelectedSchoolForDetails(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete School</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
