export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string; // Changed from number to string to match backend
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in minutes
  createdBy: string;
  createdAt: Date;
  uniqueCode: string; // 6-digit unique code
  isActive: boolean;
}

export interface QuizResult {
  id?: string;
  quizId: string;
  userId: string;
  userName: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  performanceLevel: 'poor' | 'good' | 'excellent';
  answers: {
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
  completedAt: Date;
  quizTitle: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}