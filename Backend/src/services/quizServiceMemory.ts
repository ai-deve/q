import { Quiz, QuizResult } from '../types/quiz';

export class QuizService {
  private quizzes: Quiz[] = [];
  private quizResults: QuizResult[] = [];

  constructor() {
    console.log('Using in-memory quiz service');
  }

  async saveQuiz(quiz: Quiz): Promise<string> {
    this.quizzes.push(quiz);
    return quiz.id;
  }

  async getQuizByCode(code: string): Promise<Quiz | null> {
    return this.quizzes.find(quiz => quiz.uniqueCode === code) || null;
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return [...this.quizzes];
  }

  async saveQuizResult(result: QuizResult): Promise<string> {
    const resultWithId = { ...result, id: Date.now().toString() };
    this.quizResults.push(resultWithId);
    return resultWithId.id;
  }

  async getQuizResults(quizId?: string): Promise<QuizResult[]> {
    if (quizId) {
      return this.quizResults.filter(result => result.quizId === quizId);
    }
    return [...this.quizResults];
  }

  async getStudentResults(userId: string): Promise<QuizResult[]> {
    return this.quizResults.filter(result => result.userId === userId);
  }

  calculatePerformanceLevel(percentage: number): 'poor' | 'good' | 'excellent' {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 50) return 'good';
    return 'poor';
  }

  async getQuizStatistics(quizId: string): Promise<{
    totalParticipants: number;
    averageScore: number;
    performanceBreakdown: {
      excellent: number;
      good: number;
      poor: number;
    };
  }> {
    const results = this.quizResults.filter(result => result.quizId === quizId);
    
    if (results.length === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        performanceBreakdown: { excellent: 0, good: 0, poor: 0 }
      };
    }

    const totalScore = results.reduce((sum, result) => sum + result.percentage, 0);
    const averageScore = Math.round(totalScore / results.length);

    const performanceBreakdown = results.reduce(
      (breakdown, result) => {
        const level = result.performanceLevel as 'excellent' | 'good' | 'poor';
        breakdown[level]++;
        return breakdown;
      },
      { excellent: 0, good: 0, poor: 0 }
    );

    return {
      totalParticipants: results.length,
      averageScore,
      performanceBreakdown
    };
  }

  async getAllStatistics(): Promise<{
    totalParticipants: number;
    averageScore: number;
    performanceBreakdown: {
      excellent: number;
      good: number;
      poor: number;
    };
    quizCount: number;
  }> {
    const results = this.quizResults;
    const quizCount = this.quizzes.length;
    
    if (results.length === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        performanceBreakdown: { excellent: 0, good: 0, poor: 0 },
        quizCount
      };
    }

    const totalScore = results.reduce((sum, result) => sum + result.percentage, 0);
    const averageScore = Math.round(totalScore / results.length);

    const performanceBreakdown = results.reduce(
      (breakdown, result) => {
        const level = result.performanceLevel as 'excellent' | 'good' | 'poor';
        breakdown[level]++;
        return breakdown;
      },
      { excellent: 0, good: 0, poor: 0 }
    );

    return {
      totalParticipants: results.length,
      averageScore,
      performanceBreakdown,
      quizCount
    };
  }
}