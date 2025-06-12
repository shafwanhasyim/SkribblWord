import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GameOverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ambil data skor dari state lokasi dengan fallback untuk mencegah error
  const { score, gameMode } = location.state || { score: 0, gameMode: 'UNKNOWN' };
  
  // Menentukan gaya warna berdasarkan game mode
  const getGameModeColor = () => {
    return gameMode === 'TIME_ATTACK' 
      ? 'bg-indigo-600 hover:bg-indigo-700' 
      : 'bg-red-600 hover:bg-red-700';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full text-center">
        <div className="bg-yellow-50 p-8 rounded-lg border-2 border-yellow-300">
          <h1 className="text-4xl font-extrabold text-yellow-800 mb-4">Permainan Selesai!</h1>
          
          <div className="mb-8">
            <span className="text-lg text-gray-700">Skor Akhir Anda:</span>
            <h2 className="text-6xl font-bold text-yellow-700 mt-4">{score}</h2>
            {gameMode !== 'UNKNOWN' && (
              <div className="mt-3">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  Mode: {gameMode === 'TIME_ATTACK' ? 'Time Attack' : 'Survival'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/game')}
              className={`${getGameModeColor()} text-white font-bold py-3 px-8 rounded-lg transition duration-200`}
            >
              Main Lagi
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
            >
              Ke Beranda
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => navigate('/leaderboard')}
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Lihat Papan Peringkat
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverPage;
