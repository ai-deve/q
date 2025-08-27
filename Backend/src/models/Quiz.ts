import { ObjectId } from 'mongodb';
import { database } from '../config/database';

export interface QuizDocument {
  _id?: ObjectId;
  id: string;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  uniqueCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export class QuizModel {
  private static readonly COLLECTION_NAME = 'quizzes';

  static async create(quiz: Omit<QuizDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<QuizDocument> {
    const db = database.getDb();
    const collection = db.collection<QuizDocument>(this.COLLECTION_NAME);
    
    const quizDoc: QuizDocument = {
      ...quiz,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(quizDoc);
    return { ...quizDoc, _id: result.insertedId };
  }

  static async findByCode(uniqueCode: string): Promise<QuizDocument | null> {
    const db = database.getDb();
    const collection = db.collection<QuizDocument>(this.COLLECTION_NAME);
    return await collection.findOne({ uniqueCode });
  }

  static async findById(id: string): Promise<QuizDocument | null> {
    const db = database.getDb();
    const collection = db.collection<QuizDocument>(this.COLLECTION_NAME);
    return await collection.findOne({ id });
  }

  static async findAll(): Promise<QuizDocument[]> {
    const db = database.getDb();
    const collection = db.collection<QuizDocument>(this.COLLECTION_NAME);
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async update(id: string, updates: Partial<QuizDocument>): Promise<boolean> {
    const db = database.getDb();
    const collection = db.collection<QuizDocument>(this.COLLECTION_NAME);
    
    const result = await collection.updateOne(
      { id },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const db = database.getDb();
    const collection = db.collection<QuizDocument>(this.COLLECTION_NAME);
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }
}