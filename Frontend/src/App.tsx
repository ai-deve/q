import React, { useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { RoleSelection } from './components/RoleSelection';
import { AdminPanel } from './components/AdminPanel';
import { UserPanel } from './components/UserPanel';
import { Quiz } from './types/quiz';
import { User, AuthState } from './types/auth';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [tempUserData, setTempUserData] = useState<{name: string, email: string} | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    const handleAuth = (name: string, email: string, password: string, isLogin: boolean) => {
        console.log('User authenticated:', name, email); // Debug log
    // In a real app, you would validate credentials with a backend
    console.log('User authenticated:', name, email); // Debug log
    setTempUserData({ name, email });
    setShowRoleSelection(true);
  };

    const handleRoleSelect = (role: 'admin' | 'user') => {
        console.log('Role selected:', role); // Debug log
        console.log('Role selected:', role); // Debug log
        console.log('Role selected:', role); // Debug log
        console.log('Role selected:', role); // Debug log
    if (!tempUserData) return;
    
    const user: User = {
      id: Date.now().toString(),
      name: tempUserData.name,
      email: tempUserData.email,
      role
    };

    setAuthState({
      isAuthenticated: true,
      user
    });
    setShowRoleSelection(false);
    setTempUserData(null);
  };

  const handleCreateQuiz = (newQuiz: Quiz) => {
    console.log('Adding new quiz to state:', newQuiz); // Debug log
    setQuizzes([...quizzes, newQuiz]);
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    // Do not clear quizzes so they persist for all users
  };

  // Show authentication form if not authenticated
  if (!authState.isAuthenticated && !showRoleSelection) {
    return <AuthForm onAuth={handleAuth} />;
  }

  // Show role selection if user just authenticated
  if (showRoleSelection && tempUserData) {
    return (
      <RoleSelection 
        onRoleSelect={handleRoleSelect} 
        userName={tempUserData.name}
      />
    );
  }

  // Show appropriate panel based on user role
  if (authState.user?.role === 'admin') {
    return (
      <AdminPanel
        quizzes={quizzes}
        onCreateQuiz={handleCreateQuiz}
        onLogout={handleLogout}
        userName={authState.user.name}
      />
    );
  }

  return (
    <UserPanel
      quizzes={quizzes}
      onLogout={handleLogout}
      userName={authState.user?.name || ''}
      userEmail={authState.user?.email || ''}
      userId={authState.user?.id || ''}
    />
  );
}

export default App;