import { MongoClient, Db } from 'mongodb';

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp';
      this.client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 2000, // 2 second timeout
        connectTimeoutMS: 2000
      });
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      console.log('Falling back to in-memory storage for development');
      // Reset client and db to null on failure
      this.client = null;
      this.db = null;
      // Don't throw error, just log it and continue without MongoDB
    }
  }

  getDb(): Db | null {
    return this.db;
  }

  isConnected(): boolean {
    return this.db !== null;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }
}

export const database = new Database();