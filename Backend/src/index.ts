import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quizRoutes';
import { GeminiService } from './services/geminiService';
import { database } from './config/database';

dotenv.config();

const app = express();
const PORT = 3001; // Force port 3001 to avoid AirTunes conflict

// Ensure API key is available
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDQKa18SxnU0lw3OhrtlReT2p5xVGVMfi8';
if (!apiKey) {
  console.error('GEMINI_API_KEY is required');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5176', 'http://localhost:12000', 'https://work-1-acmjznxqxdfwakgs.prod-runtime.all-hands.dev'], // Allow both Vite dev servers and production
  credentials: true
}));
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Welcome to the EduAI Backend API!');
});

// API Routes
app.use('/api/quiz', quizRoutes);

// Initialize database and start server
async function startServer() {
  // Try to connect to database (optional for development)
  await database.connect();
  
  // Start server regardless of database connection status
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Using Gemini API key:', apiKey.substring(0, 10) + '...'); // Log first 10 chars for security
  });
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});
