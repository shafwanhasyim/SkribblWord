import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import GamePage from './pages/GamePage';
import GameOverPage from './pages/GameOverPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import { AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <>
                      <Navigation />
                      <div className="container mx-auto px-4 py-8 flex-grow">
                        <HomePage />
                      </div>
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <>
                      <Navigation />
                      <div className="container mx-auto px-4 py-8 flex-grow">
                        <ProfilePage />
                      </div>
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <>
                      <Navigation />
                      <div className="container mx-auto px-4 py-8 flex-grow">
                        <LeaderboardPage />
                      </div>
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/game" 
                element={
                  <ProtectedRoute>
                    <>
                      <Navigation />
                      <div className="container mx-auto px-4 py-8 flex-grow">
                        <GamePage />
                      </div>
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/game-over" 
                element={
                  <ProtectedRoute>
                    <>
                      <Navigation />
                      <div className="container mx-auto px-4 py-8 flex-grow">
                        <GameOverPage />
                      </div>
                    </>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
