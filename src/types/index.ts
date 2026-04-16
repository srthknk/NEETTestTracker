export interface IUser {
  _id?: string;
  email: string;
  password: string;
  name: string;
  targetMarks: number;
  studentName?: string;
  studentEmail?: string;
  parentName?: string;
  parentEmails?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITest {
  _id?: string;
  userId: string;
  testName: string;
  coaching: 'Allen' | 'Aakash' | 'PW' | 'PW NRTS' | 'NTA NEET';
  date: Date;
  // Subject-wise marks (NEET structure)
  subjectWiseMarks: {
    physics: { obtained: number; total: number };
    chemistry: { obtained: number; total: number };
    botany: { obtained: number; total: number };
    zoology: { obtained: number; total: number };
  };
  totalMarksObtained: number; // Sum of all subjects
  totalMarksPossible: number; // Always 720 for NEET
  // Percentiles
  subjectWisePercentiles: {
    physics: number;
    chemistry: number;
    botany: number;
    zoology: number;
  };
  overallPercentile: number;
  // AIR (All India Rank)
  estimatedAIR: number;
  // Legacy fields (deprecated)
  marksObtained?: number;
  totalMarks?: number;
  accuracy?: number;
  timeTaken: number; // in minutes
  subjects: string[];
  chapters?: {
    physics?: string;
    chemistry?: string;
    botany?: string;
    zoology?: string;
  };
  syllabusCovered: string[];
  tags: ('full-syllabus' | 'part-test' | 'PYQ')[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubjectPerformance {
  _id?: string;
  userId: string;
  testId: string;
  subject: 'physics' | 'chemistry' | 'biology';
  maxMarks: number;
  marksObtained: number;
  accuracy: number;
  attemptedQuestions: number;
  correctAnswers: number;
  createdAt: Date;
}

export interface IMistakeLog {
  _id?: string;
  userId: string;
  testId: string;
  mistakeType: 'conceptual' | 'silly' | 'guessing';
  marksLost: number;
  description: string;
  subject: string;
  createdAt: Date;
}

export interface IAnalyticsSummary {
  _id?: string;
  userId: string;
  totalTestsAttempted: number;
  averageScore: number;
  highestScore: number;
  overallAccuracy: number;
  subjectWisePerformance: {
    physics: number;
    chemistry: number;
    botany: number;
    zoology: number;
  };
  mistakeAnalysis: {
    conceptual: number;
    silly: number;
    guessing: number;
  };
  estimatedAIR: number;
  lastUpdated: Date;
}

export interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
}
