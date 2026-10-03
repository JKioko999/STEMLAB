import { School, User, ClassGroup, Assignment, Attempt, ExperimentSpec } from '../types';
import { INITIAL_EXPERIMENTS } from './experimentSpecs';

export const SEED_SCHOOLS: School[] = [
  {
    id: 'sch-nairobi-school-00',
    name: 'Nairobi School',
    registrationNumber: 'MOE/REG/00102/NRB',
    county: 'Nairobi',
    subCounty: 'Westlands',
    category: 'National',
    subscriptionPlan: 'Institutional Pro',
    adminName: 'Mr. Kenneth Ngigi (Principal)',
    adminEmail: 'admin@nairobischool.ac.ke',
    phone: '+254 722 100 200',
    totalStudents: 780,
    totalTeachers: 24,
    createdAt: '2026-01-05',
    status: 'active'
  },
  {
    id: 'sch-nairobi-girls-01',
    name: "Nairobi Girls' High School",
    registrationNumber: 'MOE/REG/00108/NRB',
    county: 'Nairobi',
    subCounty: 'Westlands',
    category: 'National',
    subscriptionPlan: 'Institutional Pro',
    adminName: 'Dr. Esther Mwangi',
    adminEmail: 'admin@nairobigirls.ac.ke',
    phone: '+254 722 001 122',
    totalStudents: 450,
    totalTeachers: 12,
    createdAt: '2026-01-10',
    status: 'active'
  },
  {
    id: 'sch-kenya-high-03',
    name: 'The Kenya High School',
    registrationNumber: 'MOE/REG/00115/NRB',
    county: 'Nairobi',
    subCounty: 'Kilimani',
    category: 'National',
    subscriptionPlan: 'Institutional Pro',
    adminName: 'Mrs. Florence Ndegwa',
    adminEmail: 'admin@kenyahigh.ac.ke',
    phone: '+254 711 889 900',
    totalStudents: 510,
    totalTeachers: 14,
    createdAt: '2026-03-01',
    status: 'active'
  },
  {
    id: 'sch-lenana-06',
    name: 'Lenana School',
    registrationNumber: 'MOE/REG/00120/NRB',
    county: 'Nairobi',
    subCounty: 'Dagoretti',
    category: 'National',
    subscriptionPlan: 'Institutional Pro',
    adminName: 'Mr. William Kiprono',
    adminEmail: 'admin@lenanaschool.ac.ke',
    phone: '+254 722 334 556',
    totalStudents: 690,
    totalTeachers: 20,
    createdAt: '2026-02-01',
    status: 'active'
  },
  {
    id: 'sch-alliance-02',
    name: 'Alliance High School',
    registrationNumber: 'MOE/REG/00201/KBU',
    county: 'Kiambu',
    subCounty: 'Kikuyu',
    category: 'National',
    subscriptionPlan: 'Institutional Pro',
    adminName: 'Mr. David Kamau',
    adminEmail: 'admin@alliance.ac.ke',
    phone: '+254 733 445 566',
    totalStudents: 620,
    totalTeachers: 18,
    createdAt: '2026-02-14',
    status: 'active'
  },
  {
    id: 'sch-nakuru-04',
    name: 'Nakuru Boys High School',
    registrationNumber: 'MOE/REG/00340/NKR',
    county: 'Nakuru',
    subCounty: 'Nakuru Town West',
    category: 'Extra-County',
    subscriptionPlan: 'Standard KCSE Prep',
    adminName: 'Mr. Samuel Koech',
    adminEmail: 'admin@nakuruboys.ac.ke',
    phone: '+254 720 334 455',
    totalStudents: 380,
    totalTeachers: 9,
    createdAt: '2026-03-12',
    status: 'active'
  },
  {
    id: 'sch-kisumu-05',
    name: 'Kisumu Day Secondary School',
    registrationNumber: 'MOE/REG/00412/KSM',
    county: 'Kisumu',
    subCounty: 'Kisumu Central',
    category: 'County',
    subscriptionPlan: 'Standard KCSE Prep',
    adminName: 'Madam Alice Odhiambo',
    adminEmail: 'admin@kisumuday.ac.ke',
    phone: '+254 725 667 788',
    totalStudents: 290,
    totalTeachers: 8,
    createdAt: '2026-04-05',
    status: 'active'
  }
];

export const SEED_USERS: User[] = [
  // Super Admin (Platform Owner)
  {
    id: 'usr-super-admin',
    schoolId: null,
    name: 'Platform Owner & Director',
    email: 'jkioko999@gmail.com',
    role: 'super_admin',
    avatarColor: 'bg-emerald-600'
  },
  // School Admin (Nairobi School)
  {
    id: 'usr-admin-nairobi-school',
    schoolId: 'sch-nairobi-school-00',
    name: 'Mr. Kenneth Ngigi (Principal)',
    email: 'admin@nairobischool.ac.ke',
    role: 'school_admin',
    avatarColor: 'bg-blue-700'
  },
  // School Admin (Nairobi Girls)
  {
    id: 'usr-admin-nairobi-girls',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Dr. Esther Mwangi (Principal)',
    email: 'admin@nairobigirls.ac.ke',
    role: 'school_admin',
    avatarColor: 'bg-blue-600'
  },
  // School Admin (Alliance)
  {
    id: 'usr-admin-alliance',
    schoolId: 'sch-alliance-02',
    name: 'Mr. David Kamau (Principal)',
    email: 'admin@alliance.ac.ke',
    role: 'school_admin',
    avatarColor: 'bg-indigo-600'
  },

  // === TEACHERS: NAIROBI SCHOOL ===
  {
    id: 'usr-teacher-ns-chem',
    schoolId: 'sch-nairobi-school-00',
    name: 'Mr. David Omondi',
    email: 'chem.omondi@nairobischool.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Chemistry (Form 3 & 4)',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-teacher-ns-phys',
    schoolId: 'sch-nairobi-school-00',
    name: 'Mrs. Sarah Kariuki',
    email: 'phys.kariuki@nairobischool.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Physics (Form 3 & 4)',
    avatarColor: 'bg-cyan-600'
  },
  {
    id: 'usr-teacher-ns-bio',
    schoolId: 'sch-nairobi-school-00',
    name: 'Dr. George Odhiambo',
    email: 'bio.odhiambo@nairobischool.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Biology (Form 3 & 4)',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'usr-teacher-ns-chem-f2',
    schoolId: 'sch-nairobi-school-00',
    name: 'Mr. Kiprotich Chepkwony',
    email: 'chem.chepkwony@nairobischool.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Chemistry (Form 1 & 2)',
    avatarColor: 'bg-orange-600'
  },

  // === TEACHERS: NAIROBI GIRLS' HIGH ===
  {
    id: 'usr-teacher-kamau',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Mr. Peter Kamau',
    email: 'chem.kamau@nairobigirls.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Chemistry (Form 3 & 4)',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-teacher-otieno',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Mrs. Grace Otieno',
    email: 'phys.otieno@nairobigirls.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Physics (Form 3 & 4)',
    avatarColor: 'bg-cyan-600'
  },
  {
    id: 'usr-teacher-ng-bio',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Madam Beatrice Njeri',
    email: 'bio.njeri@nairobigirls.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Biology (Form 3 & 4)',
    avatarColor: 'bg-emerald-600'
  },

  // === TEACHERS: THE KENYA HIGH SCHOOL ===
  {
    id: 'usr-teacher-kh-chem',
    schoolId: 'sch-kenya-high-03',
    name: 'Dr. Angela Waweru',
    email: 'chem.waweru@kenyahigh.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Chemistry (Form 3 & 4)',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-teacher-kh-phys',
    schoolId: 'sch-kenya-high-03',
    name: 'Mr. Patrick Mutiso',
    email: 'phys.mutiso@kenyahigh.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Physics (Form 3 & 4)',
    avatarColor: 'bg-cyan-600'
  },
  {
    id: 'usr-teacher-kh-bio',
    schoolId: 'sch-kenya-high-03',
    name: 'Mrs. Caroline Nduta',
    email: 'bio.nduta@kenyahigh.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Biology (Form 3 & 4)',
    avatarColor: 'bg-emerald-600'
  },

  // === TEACHERS: ALLIANCE HIGH SCHOOL ===
  {
    id: 'usr-teacher-mutua',
    schoolId: 'sch-alliance-02',
    name: 'Mr. John Mutua',
    email: 'bio.mutua@alliance.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Biology (Form 3 & 4)',
    avatarColor: 'bg-emerald-700'
  },
  {
    id: 'usr-teacher-all-chem',
    schoolId: 'sch-alliance-02',
    name: 'Mr. Samuel Kibet',
    email: 'chem.kibet@alliance.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Chemistry (Form 3 & 4)',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-teacher-all-phys',
    schoolId: 'sch-alliance-02',
    name: 'Mr. Edward Onyango',
    email: 'phys.onyango@alliance.ac.ke',
    role: 'teacher',
    subjectSpecialization: 'Physics (Form 3 & 4)',
    avatarColor: 'bg-cyan-600'
  },

  // Students
  {
    id: 'usr-student-faith',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Faith Wanjiku',
    email: 'faith.wanjiku@student.ac.ke',
    role: 'student',
    admissionNumber: 'NGH/2024/0342',
    classId: 'cls-ngh-f3e',
    className: 'Form 3 East',
    teacherId: 'usr-teacher-kamau',
    teacherName: 'Mr. Peter Kamau',
    avatarColor: 'bg-violet-600'
  },
  {
    id: 'usr-student-kevin',
    schoolId: 'sch-nairobi-school-00',
    name: 'Kevin Mwenda',
    email: 'kevin.mwenda@student.ac.ke',
    role: 'student',
    admissionNumber: 'NS/2024/0819',
    classId: 'cls-ns-f4-chem',
    className: 'Form 4 Nairobi Pioneers',
    teacherId: 'usr-teacher-ns-chem',
    teacherName: 'Mr. David Omondi',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'usr-student-mercy',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Mercy Chebet',
    email: 'mercy.chebet@student.ac.ke',
    role: 'student',
    admissionNumber: 'NGH/2024/0388',
    classId: 'cls-ngh-f3e',
    className: 'Form 3 East',
    teacherId: 'usr-teacher-kamau',
    teacherName: 'Mr. Peter Kamau',
    avatarColor: 'bg-pink-600'
  },
  {
    id: 'usr-student-brian',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Brian Kiprop',
    email: 'brian.kiprop@student.ac.ke',
    role: 'student',
    admissionNumber: 'NGH/2023/0119',
    classId: 'cls-ngh-f4s',
    className: 'Form 4 Science',
    teacherId: 'usr-teacher-otieno',
    teacherName: 'Mrs. Grace Otieno',
    avatarColor: 'bg-teal-600'
  }
];

export const SEED_CLASSES: ClassGroup[] = [
  // Classes for Nairobi School
  {
    id: 'cls-ns-f4-chem',
    schoolId: 'sch-nairobi-school-00',
    name: 'Form 4 Nairobi Pioneers',
    formYear: 4,
    teacherId: 'usr-teacher-ns-chem',
    teacherName: 'Mr. David Omondi',
    subject: 'Chemistry',
    studentCount: 45
  },
  {
    id: 'cls-ns-f4-phys',
    schoolId: 'sch-nairobi-school-00',
    name: 'Form 4 Electrons',
    formYear: 4,
    teacherId: 'usr-teacher-ns-phys',
    teacherName: 'Mrs. Sarah Kariuki',
    subject: 'Physics',
    studentCount: 42
  },
  {
    id: 'cls-ns-f4-bio',
    schoolId: 'sch-nairobi-school-00',
    name: 'Form 4 Bio-Tech',
    formYear: 4,
    teacherId: 'usr-teacher-ns-bio',
    teacherName: 'Dr. George Odhiambo',
    subject: 'Biology',
    studentCount: 40
  },
  {
    id: 'cls-ns-f3-chem',
    schoolId: 'sch-nairobi-school-00',
    name: 'Form 3 Savannah',
    formYear: 3,
    teacherId: 'usr-teacher-ns-chem',
    teacherName: 'Mr. David Omondi',
    subject: 'Chemistry',
    studentCount: 44
  },
  {
    id: 'cls-ns-f3-phys',
    schoolId: 'sch-nairobi-school-00',
    name: 'Form 3 Mechanics',
    formYear: 3,
    teacherId: 'usr-teacher-ns-phys',
    teacherName: 'Mrs. Sarah Kariuki',
    subject: 'Physics',
    studentCount: 41
  },
  {
    id: 'cls-ns-f3-bio',
    schoolId: 'sch-nairobi-school-00',
    name: 'Form 3 Botany',
    formYear: 3,
    teacherId: 'usr-teacher-ns-bio',
    teacherName: 'Dr. George Odhiambo',
    subject: 'Biology',
    studentCount: 39
  },
  {
    id: 'cls-ns-f2-chem',
    schoolId: 'sch-nairobi-school-00',
    name: 'Form 2 Mara',
    formYear: 2,
    teacherId: 'usr-teacher-ns-chem-f2',
    teacherName: 'Mr. Kiprotich Chepkwony',
    subject: 'Chemistry',
    studentCount: 46
  },

  // Classes for Nairobi Girls' High School
  {
    id: 'cls-ngh-f3e',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Form 3 East',
    formYear: 3,
    teacherId: 'usr-teacher-kamau',
    teacherName: 'Mr. Peter Kamau',
    subject: 'Chemistry',
    studentCount: 42
  },
  {
    id: 'cls-ngh-f4s',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Form 4 Science',
    formYear: 4,
    teacherId: 'usr-teacher-otieno',
    teacherName: 'Mrs. Grace Otieno',
    subject: 'Physics',
    studentCount: 38
  },
  {
    id: 'cls-ngh-f3b',
    schoolId: 'sch-nairobi-girls-01',
    name: 'Form 3 Bio Stream',
    formYear: 3,
    teacherId: 'usr-teacher-ng-bio',
    teacherName: 'Madam Beatrice Njeri',
    subject: 'Biology',
    studentCount: 40
  },

  // Classes for The Kenya High School
  {
    id: 'cls-kh-f4-chem',
    schoolId: 'sch-kenya-high-03',
    name: 'Form 4 Chania',
    formYear: 4,
    teacherId: 'usr-teacher-kh-chem',
    teacherName: 'Dr. Angela Waweru',
    subject: 'Chemistry',
    studentCount: 43
  },
  {
    id: 'cls-kh-f4-phys',
    schoolId: 'sch-kenya-high-03',
    name: 'Form 4 Mara',
    formYear: 4,
    teacherId: 'usr-teacher-kh-phys',
    teacherName: 'Mr. Patrick Mutiso',
    subject: 'Physics',
    studentCount: 40
  },
  {
    id: 'cls-kh-f3-bio',
    schoolId: 'sch-kenya-high-03',
    name: 'Form 3 Yala',
    formYear: 3,
    teacherId: 'usr-teacher-kh-bio',
    teacherName: 'Mrs. Caroline Nduta',
    subject: 'Biology',
    studentCount: 44
  },

  // Classes for Alliance High School
  {
    id: 'cls-all-f3w',
    schoolId: 'sch-alliance-02',
    name: 'Form 3 West',
    formYear: 3,
    teacherId: 'usr-teacher-mutua',
    teacherName: 'Mr. John Mutua',
    subject: 'Biology',
    studentCount: 45
  },
  {
    id: 'cls-all-f4-chem',
    schoolId: 'sch-alliance-02',
    name: 'Form 4 Arthur',
    formYear: 4,
    teacherId: 'usr-teacher-all-chem',
    teacherName: 'Mr. Samuel Kibet',
    subject: 'Chemistry',
    studentCount: 42
  },
  {
    id: 'cls-all-f4-phys',
    schoolId: 'sch-alliance-02',
    name: 'Form 4 Wilberforce',
    formYear: 4,
    teacherId: 'usr-teacher-all-phys',
    teacherName: 'Mr. Edward Onyango',
    subject: 'Physics',
    studentCount: 44
  }
];

// Additional School-Tier experiment pre-loaded for Nairobi Girls' High
export const SEED_SCHOOL_EXPERIMENT: ExperimentSpec = {
  ...INITIAL_EXPERIMENTS[2],
  id: 'exp-ngh-custom-qualitative',
  title: "[School Practical] Form 3 Term 2 Qualitative Analysis Trial",
  ownerType: 'school',
  schoolId: 'sch-nairobi-girls-01',
  teacherId: 'usr-teacher-kamau',
  authorName: 'Mr. Peter Kamau (HOD Chemistry, Nairobi Girls)',
  clonedFrom: 'exp-chem-qualitative-03',
  status: 'published'
};

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-chem-001',
    schoolId: 'sch-nairobi-girls-01',
    teacherId: 'usr-teacher-kamau',
    teacherName: 'Mr. Peter Kamau',
    classId: 'cls-ngh-f3e',
    className: 'Form 3 East',
    experimentId: 'exp-chem-titration-01',
    experimentTitle: 'Acid-Base Titration: Standardization of Hydrochloric Acid',
    subject: 'chemistry',
    kcsePaper: '233/3 (KCSE Chemistry Practical Paper 3 - Q1)',
    mode: 'exam',
    deadline: '2026-10-15T18:00:00Z',
    timeLimitMinutes: 45,
    assignedAt: '2026-09-28T08:00:00Z',
    totalEnrolledStudents: 42,
    submittedCount: 28
  },
  {
    id: 'asg-phys-002',
    schoolId: 'sch-nairobi-girls-01',
    teacherId: 'usr-teacher-otieno',
    teacherName: 'Mrs. Grace Otieno',
    classId: 'cls-ngh-f4s',
    className: 'Form 4 Science',
    experimentId: 'exp-phys-ohms-law-02',
    experimentTitle: "Ohm's Law and Determination of Internal Resistance",
    subject: 'physics',
    kcsePaper: '232/3 (KCSE Physics Practical Paper 3 - Q1)',
    mode: 'exam',
    deadline: '2026-10-20T17:00:00Z',
    timeLimitMinutes: 45,
    assignedAt: '2026-09-30T09:30:00Z',
    totalEnrolledStudents: 38,
    submittedCount: 22
  },
  {
    id: 'asg-chem-practice-003',
    schoolId: 'sch-nairobi-girls-01',
    teacherId: 'usr-teacher-kamau',
    teacherName: 'Mr. Peter Kamau',
    classId: 'cls-ngh-f3e',
    className: 'Form 3 East',
    experimentId: 'exp-chem-qualitative-03',
    experimentTitle: 'Qualitative Analysis: Identification of Cations and Anions in Solid Q',
    subject: 'chemistry',
    kcsePaper: '233/3 (KCSE Chemistry Practical Paper 3 - Q2)',
    mode: 'practice',
    deadline: '2026-10-25T23:59:00Z',
    timeLimitMinutes: 60,
    assignedAt: '2026-10-01T10:00:00Z',
    totalEnrolledStudents: 42,
    submittedCount: 15
  }
];

export const SEED_ATTEMPTS: Attempt[] = [
  {
    id: 'att-faith-chem-01',
    schoolId: 'sch-nairobi-girls-01',
    assignmentId: 'asg-chem-001',
    isPracticeOpenLab: false,
    experimentId: 'exp-chem-titration-01',
    experimentTitle: 'Acid-Base Titration: Standardization of Hydrochloric Acid',
    subject: 'chemistry',
    studentId: 'usr-student-faith',
    studentName: 'Faith Wanjiku',
    studentAdmission: 'NGH/2024/0342',
    teacherId: 'usr-teacher-kamau',
    teacherName: 'Mr. Peter Kamau',
    classId: 'cls-ngh-f3e',
    className: 'Form 3 East',
    mode: 'exam',
    startedAt: '2026-10-01T14:10:00Z',
    submittedAt: '2026-10-01T14:48:00Z',
    status: 'graded',
    stepLogs: [
      { stepId: 1, status: 'passed', marksEarned: 1, marksPossible: 1, timestamp: '14:12' },
      { stepId: 2, status: 'passed', marksEarned: 2, marksPossible: 2, timestamp: '14:18' },
      { stepId: 3, status: 'passed', marksEarned: 1, marksPossible: 1, timestamp: '14:24' },
      { stepId: 4, status: 'passed', marksEarned: 2, marksPossible: 2, timestamp: '14:38' },
      { stepId: 5, status: 'passed', marksEarned: 2, marksPossible: 2, timestamp: '14:44' }
    ],
    answers: [
      {
        questionId: 'q-table-1',
        studentValue: {
          t1: { initial: 0.00, final: 24.50, titre: 24.50 },
          t2: { initial: 0.00, final: 24.50, titre: 24.50 },
          t3: { initial: 0.00, final: 24.40, titre: 24.40 }
        },
        autoScore: 5,
        teacherScore: 5,
        feedback: 'Excellent titre consistency within 0.10 cm³.'
      },
      {
        questionId: 'q-avg-volume',
        studentValue: 24.45,
        autoScore: 2,
        teacherScore: 2,
        feedback: 'Correct average calculation showing working.'
      },
      {
        questionId: 'q-molarity-calc',
        studentValue: 0.102,
        autoScore: 3,
        teacherScore: 3,
        feedback: 'Accurate stoichiometric formula and substitution.'
      },
      {
        questionId: 'q-color-obs',
        studentValue: 'Solution changed sharply from pink to colourless at the neutral equivalence point.',
        autoScore: 2,
        teacherScore: 2,
        feedback: 'Clear observation recorded.'
      }
    ],
    totalScore: 20,
    maxScore: 20,
    percentage: 100,
    teacherComments: 'Splendid lab practical attempt Faith! Great attention to meniscus readings and consistent titres.',
    teacherFeedbackReleased: true
  },
  {
    id: 'att-mercy-chem-02',
    schoolId: 'sch-nairobi-girls-01',
    assignmentId: 'asg-chem-001',
    isPracticeOpenLab: false,
    experimentId: 'exp-chem-titration-01',
    experimentTitle: 'Acid-Base Titration: Standardization of Hydrochloric Acid',
    subject: 'chemistry',
    studentId: 'usr-student-mercy',
    studentName: 'Mercy Chebet',
    studentAdmission: 'NGH/2024/0388',
    teacherId: 'usr-teacher-kamau',
    teacherName: 'Mr. Peter Kamau',
    classId: 'cls-ngh-f3e',
    className: 'Form 3 East',
    mode: 'exam',
    startedAt: '2026-10-01T15:00:00Z',
    submittedAt: '2026-10-01T15:40:00Z',
    status: 'submitted',
    stepLogs: [
      { stepId: 1, status: 'passed', marksEarned: 1, marksPossible: 1, timestamp: '15:05' },
      { stepId: 2, status: 'passed', marksEarned: 2, marksPossible: 2, timestamp: '15:12' },
      { stepId: 3, status: 'force_pushed', marksEarned: 0, marksPossible: 1, timestamp: '15:20' }, // force-pushed step!
      { stepId: 4, status: 'passed', marksEarned: 2, marksPossible: 2, timestamp: '15:32' },
      { stepId: 5, status: 'passed', marksEarned: 2, marksPossible: 2, timestamp: '15:38' }
    ],
    answers: [
      {
        questionId: 'q-table-1',
        studentValue: {
          t1: { initial: 0.00, final: 24.80, titre: 24.80 },
          t2: { initial: 0.00, final: 24.60, titre: 24.60 },
          t3: { initial: 0.00, final: 24.50, titre: 24.50 }
        },
        autoScore: 4
      },
      {
        questionId: 'q-avg-volume',
        studentValue: 24.55,
        autoScore: 2
      },
      {
        questionId: 'q-molarity-calc',
        studentValue: 0.1018,
        autoScore: 3
      },
      {
        questionId: 'q-color-obs',
        studentValue: 'pink to clear',
        autoScore: 2
      }
    ],
    totalScore: 16,
    maxScore: 20,
    percentage: 80,
    teacherFeedbackReleased: false
  }
];
