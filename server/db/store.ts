import { School, User, ClassGroup, Assignment, Attempt, ExperimentSpec, EmailDispatch } from '../../src/types';
import { INITIAL_EXPERIMENTS } from '../../src/data/experimentSpecs';

/**
 * ============================================================================
 * SERVER-SIDE DATA STORAGE
 * ============================================================================
 * Holds live application data in memory when operating without external Supabase
 * credentials. Standard KCSE experiments remain available; all schools, users,
 * classes, assignments, and attempts start clean and are populated as you create
 * them.
 * ============================================================================
 */

const DEFAULT_INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-alliance-science',
    name: 'Alliance High Science Wing',
    registrationNumber: 'MOE/REG/00101/2026',
    county: 'Kiambu',
    subCounty: 'Kikuyu',
    category: 'National',
    subscriptionPlan: 'Institutional Pro',
    adminName: 'Dr. David Ochieng',
    adminEmail: 'principal@alliancehigh.ac.ke',
    phone: '+254 711 000 111',
    totalStudents: 160,
    totalTeachers: 3,
    createdAt: '2026-01-10',
    status: 'active'
  },
  {
    id: 'sch-kenya-high',
    name: 'The Kenya High Laboratory',
    registrationNumber: 'MOE/REG/00102/2026',
    county: 'Nairobi',
    subCounty: 'Westlands',
    category: 'National',
    subscriptionPlan: 'Institutional Pro',
    adminName: 'Mrs. Mary Ouko',
    adminEmail: 'admin@kenyahigh.ac.ke',
    phone: '+254 722 000 222',
    totalStudents: 180,
    totalTeachers: 4,
    createdAt: '2026-01-15',
    status: 'active'
  }
];

const DEFAULT_INITIAL_CLASSES: ClassGroup[] = [
  {
    id: 'cls-f4-chem',
    schoolId: 'sch-alliance-science',
    name: 'Form 4 East (KCSE Chemistry Candidate)',
    formYear: 4,
    teacherId: 'usr-teacher-chem',
    teacherName: 'Mdm. Grace Kamau',
    subject: 'Chemistry',
    studentCount: 40
  },
  {
    id: 'cls-f4-phys',
    schoolId: 'sch-alliance-science',
    name: 'Form 4 West (KCSE Physics Candidate)',
    formYear: 4,
    teacherId: 'usr-teacher-phys',
    teacherName: 'Mr. Peter Otieno',
    subject: 'Physics',
    studentCount: 38
  },
  {
    id: 'cls-f4-bio',
    schoolId: 'sch-alliance-science',
    name: 'Form 4 North (KCSE Biology Candidate)',
    formYear: 4,
    teacherId: 'usr-teacher-bio',
    teacherName: 'Mrs. Sarah Ndwiga',
    subject: 'Biology',
    studentCount: 42
  },
  {
    id: 'cls-f3-chem',
    schoolId: 'sch-alliance-science',
    name: 'Form 3 Central (Practical Chemistry)',
    formYear: 3,
    teacherId: 'usr-teacher-chem',
    teacherName: 'Mdm. Grace Kamau',
    subject: 'Chemistry',
    studentCount: 40
  },
  {
    id: 'cls-kh-f4-chem',
    schoolId: 'sch-kenya-high',
    name: 'Form 4 Platinum (KCSE Chemistry Candidate)',
    formYear: 4,
    teacherId: 'usr-teacher-chem-2',
    teacherName: 'Mr. Andrew Barasa',
    subject: 'Chemistry',
    studentCount: 45
  }
];

export class BackendDataStore {
  public schools: School[] = [...DEFAULT_INITIAL_SCHOOLS];
  public users: User[] = [];
  public classes: ClassGroup[] = [...DEFAULT_INITIAL_CLASSES];
  public experiments: ExperimentSpec[] = [...INITIAL_EXPERIMENTS];
  public assignments: Assignment[] = [];
  public attempts: Attempt[] = [];
  public emails: EmailDispatch[] = [];

  // Reset helper
  public resetToDefaults() {
    this.schools = [...DEFAULT_INITIAL_SCHOOLS];
    this.users = [];
    this.classes = [...DEFAULT_INITIAL_CLASSES];
    this.experiments = [...INITIAL_EXPERIMENTS];
    this.assignments = [];
    this.attempts = [];
    this.emails = [];
  }
}

export const store = new BackendDataStore();
