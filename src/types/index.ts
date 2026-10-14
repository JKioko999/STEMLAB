export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student';

export interface School {
  id: string;
  name: string;
  registrationNumber?: string; // Kenyan MOE / KNEC School Registration Code
  county: string;
  subCounty?: string;
  category: 'National' | 'Extra-County' | 'County' | 'Sub-County' | 'Private';
  subscriptionPlan: 'Basic' | 'Standard KCSE Prep' | 'Institutional Pro';
  adminName: string;
  adminEmail: string;
  phone?: string;
  totalStudents: number;
  totalTeachers: number;
  createdAt: string;
  status: 'active' | 'pending';
}

export interface User {
  id: string;
  schoolId: string | null; // null for super_admin
  name: string;
  email: string;
  role: UserRole;
  admissionNumber?: string; // For students
  subjectSpecialization?: string; // For teachers, e.g. "Chemistry & Biology"
  classId?: string; // For students
  className?: string; // e.g. "Form 3 East"
  teacherId?: string; // For students, the assigned teacher they are connected to
  teacherName?: string;
  avatarColor?: string;
  mustChangePassword?: boolean; // Flag to force password update on first login
  tempPassword?: string; // Generated temporary password sent via email
  phone?: string;
}

export interface UserPreferences {
  soundEffects: boolean;
  reducedMotion: boolean;
  autoSaveDrafts: boolean;
  emailNotifications: boolean;
  meniscusLoupeMagnification: '2x' | '3x' | '4x';
}

export const COMPANY_SENDER_EMAIL = 'intellicaautomationgroup@gmail.com';
export const COMPANY_SENDER_NAME = 'Intellica Automation Group';

export interface EmailDispatch {
  id: string;
  senderEmail?: string; // Always intellicaautomationgroup@gmail.com
  recipientEmail: string;
  recipientName: string;
  recipientRole: UserRole;
  subject: string;
  tempPassword?: string;
  messageBody: string;
  sentAt: string;
  schoolName?: string;
}

export interface ClassGroup {
  id: string;
  schoolId: string;
  name: string; // e.g. "Form 3 East"
  formYear: number; // 3 or 4
  teacherId: string;
  teacherName: string;
  subject: 'Chemistry' | 'Physics' | 'Biology' | 'General Science';
  studentCount: number;
}

export type SubjectType = 'chemistry' | 'physics' | 'biology';
export type ExperimentTier = 'global' | 'school' | 'teacher';
export type SimulationType = 'titration' | 'solubility' | 'circuit' | 'qualitative' | 'food_test' | 'osmosis' | 'hookes_law' | 'thermochemistry' | 'universal' | 'general';

export interface ApparatusItem {
  id: string;
  name: string;
  subject: SubjectType;
  icon: string;
  isDistractor?: boolean;
  quantity?: number;
}

export interface ExperimentStep {
  id: number;
  instruction: string;
  validationType: 'apparatus_placed' | 'connection_made' | 'volume_set' | 'reading_recorded' | 'reagent_added' | 'run_simulation' | 'heated' | 'diluted' | 'filtered' | 'observation_made';
  validationDetail?: string;
  marks: number;
  hint?: string;
  allowForcePush: boolean;
  procedureNumber?: number; // 1 for Procedure I, 2 for Procedure II, etc.
  procedureTitle?: string;
  expectedResult?: string; // Exact observation or result expected by the teacher for this step
}

export interface ProcedureSpec {
  id: string; // e.g. "proc-1"
  number: number; // 1, 2, ...
  title: string; // e.g. "Procedure I: Titration of Solution C against Solution B"
  description?: string;
  steps: ExperimentStep[];
}

export interface AnswerSheetQuestion {
  id: string;
  type: 'data_table' | 'observation_inference' | 'calculation' | 'short_answer' | 'multiple_choice' | 'graph' | 'graph_plotting';
  prompt: string;
  maxMarks: number;
  procedureNumber?: number; // Optional procedure linkage (e.g. 1 for Table A, 2 for Table B)
  // Specific config for data tables (e.g. burette readings: initial, final, volume used)
  tableType?: 'titration' | 'temperature' | 'solubility' | 'custom';
  tableHeaders?: string[];
  tableRows?: { label: string; simulatedValue: number; tolerance: number }[];
  // For graph plotting questions
  graphConfig?: {
    xLabel: string;
    yLabel: string;
    xMin: number;
    xMax: number;
    xStep?: number;
    yMin: number;
    yMax: number;
    yStep?: number;
    expectedPoints?: { x: number; y: number }[];
    curveType?: 'smooth_curve' | 'best_fit_line';
  };
  // For written responses
  writingType?: 'single_line' | 'multi_line';
  acceptedKeywords?: string[];
  // For observation & inference
  observationAcceptedKeywords?: string[];
  inferenceAcceptedKeywords?: string[];
  modelAnswer?: string;
  // For calculation
  correctNumericValue?: number;
  tolerance?: number;
  unit?: string;
  formulaHint?: string;
  // For MCQs
  options?: string[];
  correctOptionIndex?: number;
}

export interface ExperimentSpec {
  id: string;
  subject: SubjectType;
  title: string;
  kcsePaper: string; // e.g. "233/3 (Chemistry Practical)"
  topic: string;
  objectives: string[];
  estimatedDurationMinutes: number;
  apparatus: ApparatusItem[];
  steps: ExperimentStep[];
  procedures?: ProcedureSpec[]; // Multi-procedure support (Procedure I, Procedure II, etc.)
  simulationType: SimulationType;
  simulationConfig: {
    // Titration params
    acidConcentrationM?: number; // e.g. 0.1M HCl
    baseVolumeCm3?: number; // e.g. 25.0 cm3
    unknownMolarity?: number; // target concentration e.g. 0.098 M
    indicator?: string; // 'Phenolphthalein' | 'Methyl Orange'
    equivalencePointCm3?: number; // e.g. 24.50 cm3
    colorBefore?: string; // e.g. 'Colourless' or 'Pink'
    colorAfter?: string; // e.g. 'Bright yellow precipitate' or 'Blue-black' or 'Permanent pale pink'
    colorHexBefore?: string; // e.g. '#e2e8f0'
    colorHexAfter?: string; // e.g. '#facc15'
    expectedObservation?: string; // teacher's exact expected observation
    expectedGas?: string; // e.g. 'Hydrogen', 'Carbon dioxide', 'Oxygen', 'None'
    precipitateName?: string; // e.g. 'Lead(II) iodide precipitate'
    initialTemperature?: number;
    finalTemperature?: number;
    maxTemperature?: number;
    reactionType?: string;
    
    // Circuit params (Ohm's Law)
    emfVoltage?: number; // e.g. 3.0 V
    internalResistance?: number; // e.g. 0.5 ohm
    resistorValues?: number[]; // e.g. [2, 4, 6, 8, 10]
    
    // Qualitative params
    unknownSolidName?: string; // e.g. "Solid Q (Hydrated Iron(II) Ammonium Sulphate)"
    cation?: string; // Fe2+
    anion?: string; // SO4(2-)
    
    // Food tests
    sampleName?: string;
    nutrientsPresent?: string[];
  };
  answerSheet: AnswerSheetQuestion[];
  ownerType: ExperimentTier;
  schoolId?: string | null;
  teacherId?: string | null;
  authorName: string;
  status: 'draft' | 'published';
  clonedFrom?: string;
}

export interface Assignment {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  experimentId: string;
  experimentTitle: string;
  subject: SubjectType;
  kcsePaper: string;
  mode: 'practice' | 'exam';
  deadline: string;
  timeLimitMinutes: number;
  assignedAt: string;
  totalEnrolledStudents: number;
  submittedCount: number;
}

export interface StepLogEntry {
  stepId: number;
  status: 'passed' | 'failed' | 'force_pushed';
  marksEarned: number;
  marksPossible: number;
  timestamp: string;
}

export interface StudentAnswer {
  questionId: string;
  studentValue: any;
  autoScore: number;
  teacherScore?: number;
  feedback?: string;
}

export interface Attempt {
  id: string;
  schoolId: string;
  assignmentId?: string; // null if practice mode from open library
  isPracticeOpenLab?: boolean;
  experimentId: string;
  experimentTitle: string;
  subject: SubjectType;
  studentId: string;
  studentName: string;
  studentAdmission: string;
  teacherId?: string;
  teacherName?: string;
  classId?: string;
  className?: string;
  mode: 'practice' | 'exam';
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'graded';
  stepLogs: StepLogEntry[];
  answers: StudentAnswer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  teacherComments?: string;
  teacherFeedbackReleased?: boolean;
}
