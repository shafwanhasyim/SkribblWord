import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import AuthContext from '../context/AuthContext';

const LeaderboardPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch leaderboard data
    const fetchLeaderboard = async () => {
      try {
        const response = await apiClient.get('/scores/leaderboard');
        setScores(response.data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Gagal memuat data leaderboard. Silahkan coba lagi nanti.');
        
        // If we get 401 Unauthorized, token might be invalid/expired
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [logout, navigate]); // Dependencies for useEffect

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">Leaderboard</h1>
          <button 
            onClick={() => navigate('/')} 
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
          >
            Kembali ke Beranda
          </button>
        </div>
        
        {scores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-indigo-100 text-indigo-900">
                  <th className="py-3 px-4 text-left font-semibold">Peringkat</th>
                  <th className="py-3 px-4 text-left font-semibold">Username</th>
                  <th className="py-3 px-4 text-left font-semibold">Skor</th>
                  <th className="py-3 px-4 text-left font-semibold">Mode</th>
                  <th className="py-3 px-4 text-left font-semibold">Kesulitan</th>
                  <th className="py-3 px-4 text-left font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr 
                    key={score.id || index} 
                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {index === 0 && (
                          <span className="text-xl mr-2">🥇</span>
                        )}
                        {index === 1 && (
                          <span className="text-xl mr-2">🥈</span>
                        )}
                        {index === 2 && (
                          <span className="text-xl mr-2">🥉</span>
                        )}
                        <span>{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{score.username}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600">{score.score}</td>
                    <td className="py-3 px-4">{score.gameMode}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        score.difficulty === 'EASY' 
                          ? 'bg-green-100 text-green-800' 
                          : score.difficulty === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {score.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(score.createdAt).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded">
            <p className="text-gray-600">Belum ada data skor yang tersedia.</p>
            <p className="mt-2">Mulai bermain untuk muncul di leaderboard!</p>
          </div>
        )}
        
        
      </div>
    </div>
  );
};

export default LeaderboardPage;
