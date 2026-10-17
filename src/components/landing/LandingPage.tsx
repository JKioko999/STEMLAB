import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight, Play, FlaskConical, Zap, Dna, Smartphone, ClipboardCheck, BarChart3,
  ChevronDown, Mail, MapPin, CheckCircle2, Users, GraduationCap, School
} from 'lucide-react';
import titrationBenchImg from '../../assets/images/titration_bench_1791271199117.jpg';
import physicsBenchImg from '../../assets/images/physics_circuit_bench_1791705834906.jpg';
import biologyBenchImg from '../../assets/images/biology_food_testing_1791705847555.jpg';
import teacherAnalyticsImg from '../../assets/images/workflow_teacher_analytics_1791560720875.jpg';

const container = 'max-w-6xl mx-auto px-5 sm:px-8';
const sectionTitle = 'text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white';
const sectionLead = 'mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl';
const btnPrimary = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[15px] shadow-sm transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-slate-950';
const btnSecondary = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-[15px] hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';

const steps = [
  { icon: ClipboardCheck, title: 'Teachers set the practical', body: 'Pick a ready-made KCSE-style experiment or write your own, then assign it to a class.' },
  { icon: FlaskConical, title: 'Students do it hands-on', body: 'They handle virtual apparatus, take readings and fill in a digital answer sheet, as many times as they need.' },
  { icon: BarChart3, title: 'Marks appear automatically', body: 'Answers are marked against the rubric, and teachers see each student’s attempts and progress.' }
];

const subjects = [
  { name: 'Chemistry', paper: 'Paper 233/3', icon: FlaskConical, img: titrationBenchImg, sim: 'titration', list: ['Acid–base titration', 'Qualitative salt analysis'] },
  { name: 'Physics', paper: 'Paper 232/3', icon: Zap, img: physicsBenchImg, sim: 'circuit', list: ['Ohm’s law and circuits', 'Hooke’s law'] },
  { name: 'Biology', paper: 'Paper 231/3', icon: Dna, img: biologyBenchImg, sim: 'food_test', list: ['Food tests', 'Osmosis'] }
];

const faqs = [
  { q: 'Do students need a computer?', a: 'No. It runs in the browser on a phone, tablet or laptop, so there is nothing to install.' },
  { q: 'Which practicals are included?', a: 'Titration, qualitative analysis, Ohm’s law, Hooke’s law, food tests and osmosis, with more being added. Teachers can also build their own.' },
  { q: 'How does marking work?', a: 'Students record readings and observations in a digital answer sheet. The platform marks them against the rubric and shows teachers the results, which they can review and adjust.' },
  { q: 'How does a school get started?', a: 'A school administrator registers the school, creates class streams and adds teachers. Students then sign up and choose their school and class.' },
  { q: 'Can students practise more than once?', a: 'Yes. Practice mode has no limit, since there are no reagents to use up or glassware to break.' }
];

export const LandingPage: React.FC = () => {
  const { setCurrentView, setAuthMode, experiments, startExperiment } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const goAuth = (mode: 'login' | 'register_student' | 'register_school') => {
    setAuthMode(mode);
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tryPractical = (sim: string) => {
    const exp = experiments.find(e => e.simulationType === sim) || experiments[0];
    if (exp) startExperiment(exp, null, 'practice');
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/20" />
        <div className={`${container} relative pt-16 pb-20 sm:pt-24 sm:pb-28 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[13px] font-semibold">
              Virtual science practicals for Kenyan secondary schools
            </p>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.08]">
              Science practicals your students can do anywhere
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Chemistry, Physics and Biology experiments that run in the browser. Students practise as often as they like, and teachers get the marking done for them.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => tryPractical('titration')} className={btnPrimary}>
                <Play className="w-4 h-4" /> Try a practical
              </button>
              <button onClick={() => goAuth('login')} className={btnSecondary}>
                Sign in <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              {['Works on any phone', 'No chemicals or glassware', 'Automatic marking'].map(t => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{t}</li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10">
              <img src={titrationBenchImg} alt="A student carrying out a titration in a school laboratory" className="w-full aspect-[4/3] object-cover" />
            </div>
            <div className="absolute -bottom-5 left-4 sm:-left-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center"><ClipboardCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-semibold">Titration practical</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Marked automatically</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/60">
        <div className={container}>
          <h2 className={sectionTitle}>How it works</h2>
          <p className={sectionLead}>Three simple steps from lesson plan to results.</p>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <div key={s.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center"><s.icon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /></div>
                  <span className="text-sm font-semibold text-slate-400">Step {i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="py-20 sm:py-24">
        <div className={container}>
          <h2 className={sectionTitle}>Practicals for every science subject</h2>
          <p className={sectionLead}>Based on the KCSE practical papers. Open any of them and try it for free.</p>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {subjects.map(s => (
              <article key={s.name} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={s.img} alt={`${s.name} laboratory equipment`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2"><s.icon className="w-5 h-5 text-emerald-600" />{s.name}</h3>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.paper}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
                    {s.list.map(item => <li key={item} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />{item}</li>)}
                  </ul>
                  <button onClick={() => tryPractical(s.sim)} className="mt-6 pt-1 inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold hover:gap-2.5 transition-all cursor-pointer self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">
                    Try {s.name.toLowerCase()} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* For schools */}
      <section id="schools" className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/60">
        <div className={`${container} grid lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
          <div>
            <h2 className={sectionTitle}>Built for the whole school</h2>
            <p className={sectionLead}>One platform for students, teachers and administrators.</p>
            <dl className="mt-8 space-y-6">
              {[
                { icon: GraduationCap, t: 'For students', d: 'Practise at home or at school until the method feels natural, with no fear of breaking anything.' },
                { icon: Users, t: 'For teachers', d: 'Assign practicals, review attempts and see who needs help, without spending hours marking.' },
                { icon: School, t: 'For schools', d: 'Each school has its own classes, teachers and student records, kept separate from every other school.' }
              ].map(i => (
                <div key={i.t} className="flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center"><i.icon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /></div>
                  <div>
                    <dt className="font-bold">{i.t}</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">{i.d}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
            <img src={teacherAnalyticsImg} alt="Teacher dashboard showing class results" loading="lazy" className="w-full object-cover" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className={sectionTitle}>Questions, answered</h2>
          <div className="mt-8 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {faqs.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left font-semibold text-[17px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  {f.q}
                  <ChevronDown className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="pb-5 -mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-5 sm:px-8 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto rounded-3xl bg-slate-900 text-white px-6 py-14 sm:px-14 sm:py-16 text-center relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 0%, #10b981 0, transparent 45%), radial-gradient(circle at 90% 100%, #6366f1 0, transparent 40%)' }} />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to get your class started?</h2>
            <p className="mt-3 text-slate-300 text-lg max-w-xl mx-auto">Enrol your school in minutes, or create a student account and try a practical today.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => goAuth('register_school')} className={btnPrimary}>Enrol your school</button>
              <button onClick={() => goAuth('register_student')} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 ring-1 ring-white/25 text-white font-semibold text-[15px] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Create a student account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className={`${container} py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm text-slate-600 dark:text-slate-400`}>
          <div>
            <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><FlaskConical className="w-4 h-4 text-emerald-600" />STEM-SPARK-LAB</p>
            <p className="mt-1">Virtual science practicals for secondary schools.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-x-8 gap-y-2">
            <a href="mailto:intellicaautomationgroup@gmail.com" className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white"><Mail className="w-4 h-4" />intellicaautomationgroup@gmail.com</a>
            <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" />Nairobi, Kenya</span>
          </div>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800/60 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} STEM-SPARK-LAB. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
