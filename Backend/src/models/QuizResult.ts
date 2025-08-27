import { ObjectId } from 'mongodb';
import { database } from '../config/database';

export interface QuizResultDocument {
  _id?: ObjectId;
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  answers: Array<{
    questionIndex: number;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    question: string;
  }>;
  score: number;
  totalQuestions: number;
  percentage: number;
  performanceLevel: 'poor' | 'good' | 'excellent';
  completedAt: Date;
  createdAt: Date;
}

export class QuizResultModel {
  private static readonly COLLECTION_NAME = 'quiz_results';

  static async create(result: Omit<QuizResultDocument, '_id' | 'createdAt'>): Promise<QuizResultDocument> {
    const db = database.getDb();
    const collection = db.collection<QuizResultDocument>(this.COLLECTION_NAME);
    
    const resultDoc: QuizResultDocument = {
      ...result,
      createdAt: new Date()
    };

    const insertResult = await collection.insertOne(resultDoc);
    return { ...resultDoc, _id: insertResult.insertedId };
  }

  static async findByQuizId(quizId: string): Promise<QuizResultDocument[]> {
    const db = database.getDb();
    const collection = db.collection<QuizResultDocument>(this.COLLECTION_NAME);
    return await collection.find({ quizId }).sort({ completedAt: -1 }).toArray();
  }

  static async findByUserId(userId: string): Promise<QuizResultDocument[]> {
    const db = database.getDb();
    const collection = db.collection<QuizResultDocument>(this.COLLECTION_NAME);
    return await collection.find({ userId }).sort({ completedAt: -1 }).toArray();
  }

  static async findAll(): Promise<QuizResultDocument[]> {
    const db = database.getDb();
    const collection = db.collection<QuizResultDocument>(this.COLLECTION_NAME);
    return await collection.find({}).sort({ completedAt: -1 }).toArray();
  }

  static async findById(id: string): Promise<QuizResultDocument | null> {
    const db = database.getDb();
    const collection = db.collection<QuizResultDocument>(this.COLLECTION_NAME);
    return await collection.findOne({ id });
  }

  static async getQuizStatistics(quizId: string): Promise<{
    totalParticipants: number;
    averageScore: number;
    performanceBreakdown: {
      excellent: number;
      good: number;
      poor: number;
    };
  }> {
    const db = database.getDb();
    const collection = db.collection<QuizResultDocument>(this.COLLECTION_NAME);
    
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
        breakdown[result.performanceLevel]++;
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

  static async getAllStatistics(): Promise<{
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
    const collection = db.collection<QuizResultDocument>(this.COLLECTION_NAME);
    
    const results = await collection.find({}).toArray();
    const quizzes = await db.collection('quizzes').countDocuments();
    
    if (results.length === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        performanceBreakdown: { excellent: 0, good: 0, poor: 0 },
        quizCount: quizzes
      };
    }

    const totalScore = results.reduce((sum, result) => sum + result.percentage, 0);
    const averageScore = Math.round(totalScore / results.length);

    const performanceBreakdown = results.reduce(
      (breakdown, result) => {
        breakdown[result.performanceLevel]++;
        return breakdown;
      },
      { excellent: 0, good: 0, poor: 0 }
    );

    return {
      totalParticipants: results.length,
      averageScore,
      performanceBreakdown,
      quizCount: quizzes
    };
  }
}