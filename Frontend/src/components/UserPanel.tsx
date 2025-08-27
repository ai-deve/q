import React, { useState } from 'react';
import { Trophy, LogOut, Play } from 'lucide-react';
import { QuizParticipation } from './QuizParticipation';

interface UserPanelProps {
  quizzes: any[];
  onLogout: () => void;
  userName: string;
  userEmail: string;
  userId: string;
}

export function UserPanel({ quizzes, onLogout, userName, userEmail, userId }: UserPanelProps) {
  const [showQuizParticipation, setShowQuizParticipation] = useState(false);

  const currentUser = {
    id: userId,
    name: userName,
    email: userEmail
  };

  if (showQuizParticipation) {
    return (
      <QuizParticipation 
        onBack={() => setShowQuizParticipation(false)}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">User Dashboard</h1>
            <p className="text-gray-600">Welcome {userName}! Ready to take a quiz?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-800">{userName}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-red-600"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Join Quiz</h2>
              <p className="text-gray-600">Click below to enter a quiz code and start your quiz</p>
            </div>

            <button
              onClick={() => setShowQuizParticipation(true)}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}