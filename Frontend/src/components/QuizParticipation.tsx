import React, { useState } from 'react';
import { Play, ArrowRight, CheckCircle, XCircle, Trophy, Target, TrendingUp } from 'lucide-react';
import { Quiz, Question, QuizResult, QuizAnswer } from '../types/quiz';

interface QuizParticipationProps {
  onBack: () => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export function QuizParticipation({ onBack, currentUser }: QuizParticipationProps) {
  const [quizCode, setQuizCode] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQuizByCode = async () => {
    if (!quizCode || quizCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/quiz/code/${quizCode}`);
      const data = await response.json();

      if (data.success) {
        setCurrentQuiz(data.quiz);
      } else {
        setError(data.error || 'Quiz not found');
      }
    } catch (error) {
      setError('Failed to fetch quiz');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null || !currentQuiz) {
      console.log('Cannot proceed: selectedAnswer or currentQuiz missing', { selectedAnswer, currentQuiz });
      return;
    }

    console.log('Processing question:', currentQuestionIndex + 1, 'of', currentQuiz.questions.length);

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === ['A', 'B', 'C', 'D'].indexOf(currentQuestion.correctAnswer);

    // Save answer
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswer,
      isCorrect: isCorrect
    };

    const updatedAnswers = [...quizAnswers, answer];
    setQuizAnswers(updatedAnswers);

    // Move to next question or complete quiz
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      console.log('Moving to next question');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      console.log('Quiz completed, submitting results...');
      // Submit quiz results
      await submitQuizResults(updatedAnswers);
    }
  };

  const submitQuizResults = async (answers: QuizAnswer[]) => {
    if (!currentQuiz || !currentUser) {
      console.error('Missing quiz or user data:', { currentQuiz, currentUser });
      return;
    }

    console.log('Submitting quiz results:', {
      quizId: currentQuiz.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      answers: answers.length,
      quizTitle: currentQuiz.title
    });

    setLoading(true);
    try {
      // Prepare answers for submission
      const submissionAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect
      }));

      const response = await fetch('http://localhost:3001/api/quiz/submit-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: currentQuiz.id,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          answers: submissionAnswers,
          quizTitle: currentQuiz.title
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setQuizResult(data.result);
        setQuizCompleted(true);
      } else {
        console.error('Submission failed:', data);
        setError('Failed to submit quiz results');
      }
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      setError('Failed to submit quiz results');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizAnswers([]);
    setQuizResult(null);
    setQuizCompleted(false);
    setQuizCode('');
    setError('');
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceIcon = (level: string) => {
    switch (level) {
      case 'excellent': return <Trophy className="w-6 h-6" />;
      case 'good': return <Target className="w-6 h-6" />;
      case 'poor': return <TrendingUp className="w-6 h-6" />;
      default: return <Target className="w-6 h-6" />;
    }
  };

  const getPerformanceMessage = (level: string, percentage: number) => {
    switch (level) {
      case 'excellent': return `Outstanding performance! You scored ${percentage}% - Keep up the excellent work!`;
      case 'good': return `Good job! You scored ${percentage}% - You're on the right track!`;
      case 'poor': return `You scored ${percentage}%. Don't worry, practice makes perfect!`;
      default: return `You scored ${percentage}%`;
    }
  };

  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Enter Quiz Code
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit Quiz Code
              </label>
              <input
                type="text"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 text-center font-mono text-lg"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-600"
              >
                Back
              </button>
              <button
                onClick={fetchQuizByCode}
                disabled={loading || quizCode.length !== 6}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Start Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${getPerformanceColor(quizResult.performanceLevel)} mb-4`}>
              {getPerformanceIcon(quizResult.performanceLevel)}
              <span className="font-bold text-lg capitalize">{quizResult.performanceLevel} Performance!</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 text-lg">{quizResult.quizTitle}</p>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{quizResult.score}</div>
              <div className="text-blue-100">Correct Answers</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{quizResult.percentage}%</div>
              <div className="text-purple-100">Overall Score</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{quizResult.totalQuestions}</div>
              <div className="text-green-100">Total Questions</div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="bg-white/60 rounded-xl p-6 mb-8 text-center">
            <p className="text-lg text-gray-700">
              {getPerformanceMessage(quizResult.performanceLevel, quizResult.percentage)}
            </p>
          </div>

          {/* Detailed Results */}
          <div className="bg-white/60 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Question Review</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quizResult.answers.map((answer, index) => {
                const question = currentQuiz.questions[index];
                return (
                  <div key={answer.questionId} className={`p-4 rounded-lg border-l-4 ${
                    answer.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-800 flex-1">
                        {index + 1}. {question.question}
                      </p>
                      {answer.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 ml-2" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 ml-2" />
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                        <strong>Your answer:</strong> {answer.selectedAnswer}
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-green-700">
                          <strong>Correct answer:</strong> {answer.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-semibold"
            >
              Take Another Quiz
            </button>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gray-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-600 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {currentQuiz.title}
          </h2>
          <div className="text-gray-600">
            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-600"
          >
            Back
          </button>
          
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
