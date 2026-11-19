// Type definitions for the quiz application

export interface QuizOption {
  key: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  level: number;
  difficulty: string;
  type: 'single' | 'multiple' | 'essay';
  question: string;
  options: QuizOption[];
  correctAnswer: string | string[];
  points: number;
  explanation: string;
}

export interface QuizConfig {
  title: string;
  description: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  totalPoints: number;
  passingScore: number;
  grades: Grade[];
}

export interface Grade {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface ParticipantAnswer {
  questionId: number;
  answer: string | string[];
  timeSpent?: number;
}

export interface QuizAttempt {
  id?: string;
  participant_name: string;
  started_at: string;
  submitted_at?: string;
  duration_seconds?: number;
  total_score: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  status: 'in_progress' | 'completed' | 'submitted';
  created_at?: string;
}

export interface QuizAnswer {
  id?: string;
  attempt_id: string;
  question_number: number;
  answer: Record<string, unknown>;
  is_correct: boolean;
  score: number;
  created_at?: string;
}

export interface QuizResult {
  participantName: string;
  totalScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  durationSeconds: number;
  percentage: number;
  grade: Grade;
  answers: ParticipantAnswer[];
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: number;
  question: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  explanation: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface AdminStats {
  totalParticipants: number;
  totalCompleted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export interface AdminAttempt extends QuizAttempt {
  answers?: QuizAnswer[];
}

export interface CSVExportData {
  participantName: string;
  score: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  duration: string;
  percentage: number;
  grade: string;
  startedAt: string;
  submittedAt: string;
}