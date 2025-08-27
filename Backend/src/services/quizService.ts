import { MongoClient, WithId, Document } from 'mongodb';
import { Quiz, QuizResult } from '../types/quiz';
import { database } from '../config/database';

export class QuizService {
  private quizzes: Quiz[] = [];
  private quizResults: QuizResult[] = [];

  constructor() {
    // Database connection is handled by the centralized database module
  }

  async saveQuiz(quiz: Quiz): Promise<string> {
    const db = database.getDb();
    if (db) {
      const collection = db.collection('quizzes');
      const result = await collection.insertOne(quiz);
      return result.insertedId.toString();
    } else {
      // Fallback to in-memory storage
      this.quizzes.push(quiz);
      return quiz.id;
    }
  }

  async getQuizByCode(code: string): Promise<Quiz | null> {
    const db = database.getDb();
    if (db) {
      const collection = db.collection('quizzes');
      const quizDocument: WithId<Document> | null = await collection.findOne({ uniqueCode: code });
      
      if (!quizDocument) return null;

      const quiz: Quiz = {
        id: quizDocument._id.toString(),
        title: quizDocument.title,
        description: quizDocument.description,
        questions: quizDocument.questions,
        category: quizDocument.category,
        difficulty: quizDocument.difficulty,
        createdBy: quizDocument.createdBy,
        createdAt: quizDocument.createdAt,
        uniqueCode: quizDocument.uniqueCode,
        isActive: quizDocument.isActive,
      };

      return quiz;
    } else {
      // Fallback to in-memory storage
      return this.quizzes.find(quiz => quiz.uniqueCode === code) || null;
    }
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    const db = database.getDb();
    const collection = db.collection('quizzes');
    const quizDocuments = await collection.find({}).toArray();
    
    return quizDocuments.map(doc => ({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      questions: doc.questions,
      category: doc.category,
      difficulty: doc.difficulty,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      uniqueCode: doc.uniqueCode,
      isActive: doc.isActive,
    }));
  }

  async saveQuizResult(result: QuizResult): Promise<string> {
    const db = database.getDb();
    const collection = db.collection('quiz_results');
    const insertResult = await collection.insertOne(result);
    return insertResult.insertedId.toString();
  }

  async getQuizResults(quizId?: string): Promise<QuizResult[]> {
    const db = database.getDb();
    const collection = db.collection('quiz_results');
    const query = quizId ? { quizId } : {};
    const resultDocuments = await collection.find(query).toArray();
    
    return resultDocuments.map(doc => ({
      id: doc._id.toString(),
      quizId: doc.quizId,
      userId: doc.userId,
      userName: doc.userName,
      userEmail: doc.userEmail,
      score: doc.score,
      totalQuestions: doc.totalQuestions,
      percentage: doc.percentage,
      performanceLevel: doc.performanceLevel,
      answers: doc.answers,
      completedAt: doc.completedAt,
      quizTitle: doc.quizTitle,
    }));
  }

  async getStudentResults(userId: string): Promise<QuizResult[]> {
    const db = database.getDb();
    const collection = db.collection('quiz_results');
    const resultDocuments = await collection.find({ userId }).toArray();
    
    return resultDocuments.map(doc => ({
      id: doc._id.toString(),
      quizId: doc.quizId,
      userId: doc.userId,
      userName: doc.userName,
      userEmail: doc.userEmail,
      score: doc.score,
      totalQuestions: doc.totalQuestions,
      percentage: doc.percentage,
      performanceLevel: doc.performanceLevel,
      answers: doc.answers,
      completedAt: doc.completedAt,
      quizTitle: doc.quizTitle,
    }));
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
    const db = database.getDb();
    const collection = db.collection('quiz_results');
    
    const results = await collection.find({ quizId }).toArray();
    
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
    const db = database.getDb();
    const resultsCollection = db.collection('quiz_results');
    const quizzesCollection = db.collection('quizzes');
    
    const results = await resultsCollection.find({}).toArray();
    const quizCount = await quizzesCollection.countDocuments();
    
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
