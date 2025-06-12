// filepath: c:\UWIW_4\Big_Brain\CASLAB\OOP PROYEK\frontend\src\components\StandardGame.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import apiClient from '../api/apiClient';

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
  
  // Fungsi untuk mengakhiri permainan, sekarang lebih aman.
  // useCallback memastikan fungsi ini tidak dibuat ulang di setiap render,
  // kecuali dependensinya berubah.
  const handleEndGame = useCallback(async () => {
    // Penjaga (Guard Clause) untuk mencegah fungsi ini dipanggil berkali-kali
    if (isEnding || !gameState) return; 

    setIsEnding(true); // Tandai bahwa proses pengakhiran sedang berjalan

    try {
      // Panggil endpoint /end untuk memastikan skor disimpan di backend
      const response = await apiClient.post('/game/end');
      // Arahkan ke halaman game over dengan data skor final dari backend
      navigate('/game-over', { 
        state: { 
          score: response.data.score, 
          gameMode 
        }
      });
    } catch (err) {
      console.error('Error ending game, navigating with local score:', err);
      // Fallback: Jika API gagal, tetap arahkan dengan skor terakhir yang diketahui
      navigate('/game-over', { 
        state: { 
          score: gameState.score, 
          gameMode 
        } 
      });
    }
  }, [gameState, gameMode, navigate, isEnding]); // isEnding ditambahkan ke dependensi

  // Fungsi untuk memulai permainan baru
  const handleStartGame = async () => {
    setIsLoading(true);
    setError('');
    setIsEnding(false); // Reset status pengakhiran game
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
      
      // PERBAIKAN KUNCI: Cek kondisi game over dari respons backend
      if (response.data.isGameOver) {
        // Jika game berakhir, panggil fungsi end game, jangan set state lagi
        handleEndGame();
      } else {
        // Jika permainan berlanjut, baru perbarui state
        setGameState(response.data);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Gagal mengirim jawaban.');
    }
  };

  // useEffect untuk menangani timer, sekarang lebih sederhana
  useEffect(() => {
    // Jangan jalankan timer jika game belum dimulai atau bukan mode Time Attack
    if (gameMode !== 'TIME_ATTACK' || !gameState) {
      return;
    }

    // Jika waktu sudah 0, panggil handleEndGame
    if (gameState.timeLeftSeconds <= 0) {
      handleEndGame();
      return; // Hentikan eksekusi lebih lanjut
    }

    // Set interval untuk mengurangi waktu setiap detik
    const timerId = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeLeftSeconds: prev.timeLeftSeconds - 1,
      }));
    }, 1000);

    // Cleanup function untuk membersihkan interval saat komponen di-unmount
    return () => clearInterval(timerId);

  }, [gameState, gameMode, handleEndGame]); // handleEndGame ditambahkan ke dependensi

  // ===============================================
  // BAGIAN RENDER UTAMA DENGAN LOGIKA YANG DIPERBAIKI
  // ===============================================

  // Jika game sedang aktif, tampilkan UI permainan
  if (gameState) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-sm text-gray-600">Skor:</span>
            <h3 className="text-2xl font-bold text-indigo-700">{gameState.score}</h3>
          </div>
          
          {gameMode === 'TIME_ATTACK' && (
            <div className={`px-4 py-2 rounded-lg ${gameState.timeLeftSeconds > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'}`}>
              <span className="text-sm">Waktu:</span>
              <span className="ml-1 font-bold">{gameState.timeLeftSeconds}s</span>
            </div>
          )}
          
          {gameMode === 'SURVIVAL' && (
            <div>
              <span className="text-sm text-gray-600">Nyawa:</span>
              <div className="flex items-center">
                {Array.from({ length: gameState.lives || 0 }, (_, i) => (
                  <span key={i} className="text-red-500 text-xl mx-0.5">❤️</span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-indigo-50 p-6 rounded-lg mb-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Tebak kata ini:</p>
          <h2 className="text-4xl font-bold tracking-wider text-indigo-900 mb-2 flex justify-center flex-wrap">
            {/* PERBAIKAN PENTING: Tambahkan pengecekan sebelum .split() */}
            {gameState.scrambledWord && gameState.scrambledWord.split('').map((char, idx) => (
              <span key={idx} className="inline-block mx-1 min-w-8 py-2 border-b-2 border-indigo-400">
                {char}
              </span>
            ))}
          </h2>
        </div>
        
        <form onSubmit={handleSubmitAnswer}>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg text-center"
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
      </div>
    );
  }

  // Jika tidak ada gameState (game belum dimulai), tampilkan UI setup
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        Mode {gameMode.replace('_', ' ')}
      </h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Tingkat Kesulitan</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
          <option value="EASY">Mudah</option>
          <option value="MEDIUM">Sedang</option>
          <option value="HARD">Sulit</option>
          <option value="RANDOM">Acak</option>
        </select>
      </div>
      
      <div className="mt-8">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          onClick={handleStartGame}
          disabled={isLoading}
        >
          {isLoading ? 'Memulai...' : 'Mulai Permainan'}
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <button 
          className="text-gray-500 hover:text-indigo-600 transition duration-200"
          onClick={onBackToModeSelection}
        >
          Kembali ke Pilihan Mode
        </button>
      </div>
    </div>
  );
};

StandardGame.propTypes = {
  gameMode: PropTypes.oneOf(['TIME_ATTACK', 'SURVIVAL']).isRequired,
  onBackToModeSelection: PropTypes.func.isRequired
};

export default StandardGame;
