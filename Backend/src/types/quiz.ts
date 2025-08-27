export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
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

export interface QuizGenerationRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  numberOfQuestions: number;
  category: string;
}

export interface QuizGenerationResponse {
  success: boolean;
  quiz?: Quiz;
  error?: string;
}
