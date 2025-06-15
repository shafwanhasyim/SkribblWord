// filepath: c:\UWIW_4\Big_Brain\CASLAB\OOP PROYEK\frontend\src\components\StandardGame.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import apiClient from '../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Heart, Zap, ArrowLeft, Loader, CheckCircle } from 'lucide-react';

const StandardGame = ({ gameMode, onBackToModeSelection }) => {
  // State untuk konfigurasi dan UI
  const [difficulty, setDifficulty] = useState('EASY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk logika permainan
  const [gameState, setGameState] = useState(null);
  const [playerInput, setPlayerInput] = useState('');
  // State untuk mencegah panggilan ganda saat game berakhir
  const [isEnding, setIsEnding] = useState(false);
  
  const navigate = useNavigate();
  
  // PERBAIKAN: Fungsi tunggal dan aman untuk mengakhiri permainan.
  // useCallback memastikan fungsi ini tidak dibuat ulang di setiap render.
  const handleEndGame = useCallback(async () => {
    // Penjaga (Guard Clause) untuk mencegah fungsi ini dipanggil berkali-kali.
    if (isEnding || !gameState) return; 

    setIsEnding(true); // Tandai bahwa proses pengakhiran sedang berjalan.

    try {
      // Panggil endpoint /end untuk memastikan skor disimpan di backend.
      const response = await apiClient.post('/game/end');
      // Arahkan ke halaman game over dengan data skor final dari backend.
      navigate('/game-over', { 
        state: { 
          score: response.data.score, 
          gameMode 
        }
      });
    } catch (err) {
      console.error('Error ending game, navigating with local score:', err);
      // Fallback: Jika API gagal, tetap arahkan dengan skor terakhir yang diketahui.
      navigate('/game-over', { 
        state: { 
          score: gameState.score, 
          gameMode 
        } 
      });
    }
  }, [gameState, gameMode, navigate, isEnding]);

  // Fungsi untuk memulai permainan baru
  const handleStartGame = async () => {
    setIsLoading(true);
    setError('');
    setIsEnding(false); // Reset status pengakhiran game saat memulai yang baru.
    try {
      const response = await apiClient.post('/game/start', {
        gameMode,
        difficulty
      });
      setGameState(response.data);
    } catch (err) {
      console.error('Error starting game:', err);
      setError(err.response?.data?.message || 'Gagal memulai permainan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengirim jawaban
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!playerInput.trim() || !gameState) return;
    
    try {
      const response = await apiClient.post('/game/submit', {
        answer: playerInput
      });
      
      setPlayerInput(''); // Selalu reset input
      
      // PERBAIKAN: Cek kondisi game over dari respons backend.
      if (response.data.isGameOver) {
        // Jika game berakhir, panggil fungsi end game. Navigasi akan ditangani di sana.
        handleEndGame();
      } else {
        // Jika permainan berlanjut, baru perbarui state.
        setGameState(response.data);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Gagal mengirim jawaban.');
    }
  };

  // useEffect untuk menangani timer, sekarang lebih aman dan sederhana.
  useEffect(() => {
    if (gameMode !== 'TIME_ATTACK' || !gameState) {
      return;
    }

    // Jika waktu sudah 0 atau kurang saat render, langsung akhiri.
    if (gameState.timeLeftSeconds <= 0) {
      handleEndGame();
      return;
    }

    // Set interval untuk mengurangi waktu setiap detik.
    const timerId = setInterval(() => {
      setGameState(prev => {
        // Penjaga untuk mencegah error jika state tiba-tiba null.
        if (!prev) {
          clearInterval(timerId);
          return null;
        }
        return { ...prev, timeLeftSeconds: prev.timeLeftSeconds - 1 };
      });
    }, 1000);

    // Cleanup function untuk membersihkan interval.
    return () => clearInterval(timerId);

  }, [gameState, gameMode, handleEndGame]);

  // =======================================================
  // BAGIAN RENDER UTAMA DENGAN STRUKTUR YANG LEBIH AMAN
  // =======================================================

  // Kondisi 1: Tampilkan UI permainan JIKA gameState ada.
  if (gameState) {
    return (
      <motion.div 
        className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          {/* Skor */}
          <div>
            <span className="text-sm text-gray-600">Skor:</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-indigo-700">{gameState.score}</h3>
          </div>
          
          {/* Streak */}
          <div className="text-center">
            <span className="text-sm text-gray-600">Streak</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-amber-500 flex items-center justify-center">
              {gameState.streakCount}
              {gameState.streakCount >= 3 && <span className="ml-1">🔥</span>}
            </h3>
          </div>

          {/* Timer atau Nyawa */}
          {gameMode === 'TIME_ATTACK' ? (
            <div>
              <span className="text-sm text-gray-600">Waktu:</span>
              <h3 className={`text-2xl sm:text-3xl font-bold ${gameState.timeLeftSeconds <= 10 ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>{gameState.timeLeftSeconds}s</h3>
            </div>
          ) : (
            <div>
              <span className="text-sm text-gray-600">Nyawa:</span>
              <div className="flex items-center mt-1">
                {Array.from({ length: gameState.lives || 0 }).map((_, i) => (
                  <Heart key={i} className="text-red-500 fill-current" size={24} />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-indigo-50 p-6 rounded-lg mb-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Tebak kata ini:</p>
          <div className="text-3xl sm:text-4xl font-bold tracking-wider text-indigo-900 flex justify-center flex-wrap gap-2">
            {/* PERBAIKAN PENTING: Tambahkan pengecekan sebelum .split() */}
            {gameState.scrambledWord && gameState.scrambledWord.split('').map((char, idx) => (
              <span key={idx} className="bg-white shadow-sm rounded-md px-3 py-2 border-b-4 border-indigo-200">
                {char}
              </span>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmitAnswer}>
          <input
            type="text"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg text-center"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value.toUpperCase())}
            placeholder="Ketik jawaban Anda..."
            autoComplete="off"
            autoFocus
          />
          <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
            Kirim Jawaban
          </button>
        </form>
      </motion.div>
    );
  }

  // Kondisi 2 (DEFAULT): Jika tidak ada gameState, tampilkan UI setup.
  return (
    <motion.div 
      className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        {gameMode === 'TIME_ATTACK' ? <Clock size={30} className="text-indigo-500" /> : <Heart size={30} className="text-red-500" />}
        <h2 className="text-3xl font-bold text-gray-800">
          Mode {gameMode.replace('_', ' ')}
        </h2>
      </div>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{error}</div>}
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Tingkat Kesulitan</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
          <option value="EASY">Mudah</option>
          <option value="MEDIUM">Sedang</option>
          <option value="HARD">Sulit</option>
          <option value="RANDOM">Acak</option>
        </select>
      </div>
      
      <div className="mt-8">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
          onClick={handleStartGame}
          disabled={isLoading}
        >
          {isLoading ? 'Memulai...' : 'Mulai Permainan'}
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <button 
          className="text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1 mx-auto"
          onClick={onBackToModeSelection}
        >
          <ArrowLeft size={16} />
          <span>Pilih Mode Lain</span>
        </button>
      </div>
    </motion.div>
  );
};

StandardGame.propTypes = {
  gameMode: PropTypes.oneOf(['TIME_ATTACK', 'SURVIVAL']).isRequired,
  onBackToModeSelection: PropTypes.func.isRequired
};

export default StandardGame;

