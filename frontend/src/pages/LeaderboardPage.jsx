import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/apiClient';
import AuthContext from '../context/AuthContext';
import { ChevronLeft, Trophy, Medal, Award, Home, AlertCircle } from 'lucide-react';

const LeaderboardPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // PERBAIKAN: Fungsi fetch sekarang dinamis berdasarkan filter yang aktif
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Membangun URL secara dinamis
    let url = '/scores/leaderboard'; // Default untuk semua
    if (activeTab !== 'all' && activeDifficulty !== 'all') {
      url = `/scores/leaderboard/mode/${activeTab}/difficulty/${activeDifficulty}`;
    } else if (activeTab !== 'all') {
      url = `/scores/by-mode/${activeTab}`;
    } else if (activeDifficulty !== 'all') {
      url = `/scores/leaderboard/${activeDifficulty}`;
    }

    try {
      const response = await apiClient.get(url);
      setScores(response.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Gagal memuat data leaderboard. Silakan coba lagi nanti.');
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeDifficulty, logout, navigate]); // Dependensi diperbarui

  // PERBAIKAN: useEffect sekarang akan berjalan setiap kali filter berubah
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]); // Bergantung pada fungsi fetch yang sudah di-memoize

  // Fungsi-fungsi helper untuk styling (tidak ada perubahan)
  const getModeBadgeStyle = (mode) => {
    switch(mode) {
      case 'TIME_ATTACK': return 'bg-indigo-100 text-indigo-800';
      case 'SURVIVAL': return 'bg-red-100 text-red-800';
      case 'KIDS': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getDifficultyBadgeStyle = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 border';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border';
      case 'HARD': return 'bg-red-100 text-red-800 border';
      case 'RANDOM': return 'bg-blue-100 text-blue-800 border';
      default: return 'bg-gray-100 text-gray-800 border';
    }
  };

  if (loading) {
     return <div className="text-center p-10">Memuat...</div>
  }
  if (error) {
     return <div className="text-center p-10 text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <motion.div 
        className="container mx-auto max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-indigo-500 mr-3" />
                <h1 className="text-3xl font-extrabold text-gray-800">Leaderboard</h1>
              </div>
              <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                <ChevronLeft className="h-4 w-4" />
                <span>Kembali</span>
              </button>
            </div>
            
            {/* Filter tabs untuk Mode */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              <button onClick={() => setActiveTab('all')} className={`py-2 px-4 rounded-lg font-medium ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Semua Mode</button>
              <button onClick={() => setActiveTab('TIME_ATTACK')} className={`py-2 px-4 rounded-lg font-medium ${activeTab === 'TIME_ATTACK' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Time Attack</button>
              <button onClick={() => setActiveTab('SURVIVAL')} className={`py-2 px-4 rounded-lg font-medium ${activeTab === 'SURVIVAL' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Survival</button>
            </div>
            
            {/* Filter tabs untuk Kesulitan */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
              <button onClick={() => setActiveDifficulty('all')} className={`py-2 px-4 rounded-lg font-medium text-sm ${activeDifficulty === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}>Semua Kesulitan</button>
              <button onClick={() => setActiveDifficulty('EASY')} className={`py-2 px-4 rounded-lg font-medium text-sm ${activeDifficulty === 'EASY' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Mudah</button>
              <button onClick={() => setActiveDifficulty('MEDIUM')} className={`py-2 px-4 rounded-lg font-medium text-sm ${activeDifficulty === 'MEDIUM' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>Sedang</button>
              <button onClick={() => setActiveDifficulty('HARD')} className={`py-2 px-4 rounded-lg font-medium text-sm ${activeDifficulty === 'HARD' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>Sulit</button>
              <button onClick={() => setActiveDifficulty('RANDOM')} className={`py-2 px-4 rounded-lg font-medium text-sm ${activeDifficulty === 'RANDOM' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Acak</button>
            </div>
            
            {scores.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left font-semibold text-gray-600">Peringkat</th>
                      <th className="py-3 px-6 text-left font-semibold text-gray-600">Username</th>
                      <th className="py-3 px-6 text-left font-semibold text-gray-600">Skor</th>
                      <th className="py-3 px-6 text-left font-semibold text-gray-600">Mode</th>
                      <th className="py-3 px-6 text-left font-semibold text-gray-600">Kesulitan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* PERBAIKAN: Langsung map dari 'scores', tidak perlu 'filteredScores' lagi */}
                    {scores.map((score, index) => (
                      <motion.tr 
                        key={score.id || index}
                        className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="py-4 px-6 font-medium text-gray-700 flex items-center">
                          {index < 3 ? (
                            <Medal className={`mr-2 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-700'}`} />
                          ) : (
                            <span className="w-6 text-center mr-2">{index + 1}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-800">{score.username}</td>
                        <td className="py-4 px-6 font-bold text-indigo-600">{score.score}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs rounded-full ${getModeBadgeStyle(score.gameMode)}`}>
                            {score.gameMode.replace('_', ' ')}
                          </span>
                        </td>                          
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyBadgeStyle(score.difficulty)}`}>
                            {score.difficulty}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-16 bg-gray-50 rounded-xl">
                <p className="text-gray-600 font-medium">Belum ada data skor untuk kategori ini.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;
