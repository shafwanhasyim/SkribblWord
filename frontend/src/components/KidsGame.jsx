import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../api/apiClient';

const KidsGame = ({ onBackToModeSelection }) => {
  // State management
  const [wordData, setWordData] = useState(null); // For storing { wordId, imageUrl, letters }
  const [availableLetters, setAvailableLetters] = useState([]); // Array of clickable letter cards
  const [answerSlots, setAnswerSlots] = useState([]); // Array of answer slots
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStats, setGameStats] = useState({ currentWordNumber: 0, totalWords: 0 });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Function to start a new game - now uses the fetchNewWord function
  const handleStartGame = async () => {
    // Reset any game state before starting
    setScore(0);
    setGameStats({ currentWordNumber: 0, totalWords: 0 });
    
    // Use the reusable function to fetch the first word
    await fetchNewWord();
  };

  // New function to fetch a new word
  const fetchNewWord = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get a new word from the API
      const response = await apiClient.get('/game/kids/new');
      const data = response.data;
      
      // Set word data
      setWordData({
        wordId: data.wordId,
        imageUrl: data.imageUrl,
        letters: data.letters || data.availableLetters || []
      });
      
      setScore(data.score || 0);
      setGameStats({
        currentWordNumber: data.currentWordNumber || 1,
        totalWords: data.totalWords || 10
      });
      
      setGameStarted(true);
      
      // Reset any previous messages
      setSuccessMessage(null);
      setErrorMessage(null);
      setFeedback(null);
    } catch (err) {
      console.error('Error fetching new word:', err);
      setError(err.response?.data?.message || 'Gagal memuat kata baru. Silakan coba lagi.');
      
      // Show user-friendly error message for common issues
      if (err.response?.status === 401) {
        setError('Sesi login Anda telah berakhir. Silakan login kembali.');
      } else if (!navigator.onLine) {
        setError('Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get next word - modified to use the API endpoint for next words
  const getNextWord = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.get('/game/kids/new');
      
      if (response.data.gameComplete) {
        // Display a completion message with animation before the alert
        setFeedback('🎮 Permainan Selesai! 🎮');
        
        // Small delay to show the message
        setTimeout(() => {
          // Game is complete, show final score - use the final score from response if available
          const finalScore = response.data.finalScore || score;
          alert(`Permainan selesai! Skor akhir kamu: ${finalScore}`);
          
          setGameStarted(false);
          setWordData(null); // Clear word data to properly reset the game
          setFeedback(''); // Clear feedback message after game completes
        }, 1000);
        
        return;
      }
      
      // Set new word data
      setWordData({
        wordId: response.data.wordId,
        imageUrl: response.data.imageUrl,
        letters: response.data.letters || response.data.availableLetters || []
      });
      
      setGameStats(prev => ({
        currentWordNumber: prev.currentWordNumber + 1,
        totalWords: response.data.totalWords || prev.totalWords
      }));
      
      // Reset any previous feedback messages
      setSuccessMessage(null);
      setErrorMessage(null);
      
    } catch (err) {
      console.error('Error getting next word:', err);
      
      // Set appropriate error messages based on the error
      if (err.response?.status === 401) {
        setError('Sesi login Anda telah berakhir. Silakan login kembali.');
      } else {
        setError('Gagal mendapatkan kata berikutnya. Silakan coba lagi.');
      }
      
      // Show error message in feedback with retry option
      setFeedback('⚠️ Terjadi kesalahan ⚠️');
      
    } finally {
      setIsLoading(false);
    }
  };

  // New reusable function to process answer check results consistently
  const processAnswerResult = async (finalAnswer) => {
    // Add guard clause to ensure we have valid wordData
    if (!wordData || !wordData.wordId) {
      console.error("Cannot check answer: wordData or wordId is missing");
      setErrorMessage('Terjadi kesalahan: data kata tidak ditemukan');
      setTimeout(() => setErrorMessage(null), 1500);
      return;
    }
    
    try {
      // Fixed: Send submittedAnswer instead of answer as the parameter name
      const response = await apiClient.post('/game/kids/check', {
        wordId: wordData.wordId,
        submittedAnswer: finalAnswer // Corrected parameter name to match backend expectation
      });
      
      if (response.data.isCorrect) {
        // Display feedback using both mechanisms
        setSuccessMessage('Benar! Kamu hebat!');
        setFeedback('🎉 Benar! Kamu hebat! 🎉');
        setScore(prev => prev + (response.data.points || 1));
        
        // Show success message briefly then transition to loading state
        setTimeout(() => {
          setSuccessMessage(null);
          setFeedback('Memuat kata berikutnya...');
          
          // Get next word after showing loading message
          setTimeout(() => {
            getNextWord();
            setFeedback('');
          }, 800);
        }, 1500);
      } else {
        setErrorMessage('Jawaban tidak tepat, coba lagi!');
        
        // Reset answer slots after delay
        setTimeout(() => {
          // Return letters to available pile
          setAvailableLetters([...availableLetters, ...answerSlots.filter(slot => slot !== null)]);
          setAnswerSlots(Array(answerSlots.length).fill(null));
          setErrorMessage(null);
        }, 1500);
      }
    } catch (err) {
      console.error('Error checking answer:', err);
      setErrorMessage('Terjadi kesalahan saat memeriksa jawaban');
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 1500);
    }
  };

  // Initialize letter cards and answer slots when wordData changes
  useEffect(() => {
    if (!wordData) return;
    
    // Create answer slots (empty placeholders) based on word length
    setAnswerSlots(Array(wordData.letters.length).fill(null));
    
    // Create available letters as objects with unique IDs
    const shuffledLetters = [...wordData.letters];
    // Optional: shuffle the letters for added challenge
    for (let i = shuffledLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
    }
    
    setAvailableLetters(
      shuffledLetters.map((letter, index) => ({
        id: `letter-${index}`,
        letter: letter
      }))
    );
  }, [wordData]);
  
  // Initialize game when component mounts (if gameStarted is true but no wordData)
  useEffect(() => {
    if (gameStarted && !wordData && !isLoading) {
      fetchNewWord();
    }
  }, [gameStarted, wordData, isLoading]);
  
  // Handle letter card click - move from available to answer slots
  const handleLetterClick = (clickedLetter) => {
    // Find first empty slot
    const emptySlotIndex = answerSlots.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) return; // No empty slots
    
    // Update answer slots
    const newAnswerSlots = [...answerSlots];
    newAnswerSlots[emptySlotIndex] = clickedLetter;
    setAnswerSlots(newAnswerSlots);
    
    // Remove from available letters
    setAvailableLetters(availableLetters.filter(letter => letter.id !== clickedLetter.id));
  };
  
  // Handle answer slot click - move from answer slots back to available
  const handleSlotClick = (slotIndex) => {
    const clickedLetter = answerSlots[slotIndex];
    if (!clickedLetter) return; // Empty slot clicked
    
    // Add back to available letters
    setAvailableLetters([...availableLetters, clickedLetter]);
    
    // Remove from answer slots
    const newAnswerSlots = [...answerSlots];
    newAnswerSlots[slotIndex] = null;
    setAnswerSlots(newAnswerSlots);
  };
  
  // Check if answer is complete and submit if it is
  useEffect(() => {
    if (!answerSlots.length || answerSlots.includes(null)) return;
    
    const checkAnswer = async () => {
      // Create final answer string from all slots
      const finalAnswer = answerSlots.map(slot => slot.letter).join('');
      await processAnswerResult(finalAnswer);
    };
    
    // Small delay before checking to show the completed word
    const timerId = setTimeout(() => {
      checkAnswer();
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [answerSlots, wordData, availableLetters]);
  
  // Clear all selected letters
  const handleClearSelection = () => {
    // Return all letters from answer slots to available letters
    const lettersToReturn = answerSlots.filter(slot => slot !== null);
    setAvailableLetters([...availableLetters, ...lettersToReturn]);
    
    // Reset answer slots
    setAnswerSlots(Array(answerSlots.length).fill(null));
  };
  
  // Submit answer manually (for the button)
  const handleManualSubmit = async () => {
    if (answerSlots.includes(null)) {
      setErrorMessage('Lengkapi semua huruf terlebih dahulu');
      setTimeout(() => setErrorMessage(null), 1500);
      return;
    }

    // Create final answer string from all slots
    const finalAnswer = answerSlots.map(slot => slot.letter).join('');
    
    // Use our unified process function
    await processAnswerResult(finalAnswer);
  };

  // Add retry button component for error states
  const renderRetryButton = () => (
    <div className="mt-4 text-center">
      <button 
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        onClick={wordData ? getNextWord : fetchNewWord}
        disabled={isLoading}
      >
        {isLoading ? 'Mencoba ulang...' : 'Coba Lagi'}
      </button>
    </div>
  );

  // Render game setup UI
  const renderGameSetupForm = () => (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-6">Mode Anak</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          {renderRetryButton()}
        </div>
      )}
      
      <div className="p-4 mb-6 bg-yellow-50 rounded-lg border border-yellow-100">
        <h3 className="font-medium text-gray-800 mb-2">Cara Bermain:</h3>
        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
          <li>Lihat gambar yang ditampilkan</li>
          <li>Pilih kartu huruf untuk menyusun kata yang sesuai dengan gambar</li>
          <li>Tekan "Periksa Jawaban" jika sudah yakin</li>
          <li>Dapatkan poin untuk setiap jawaban benar!</li>
        </ul>
      </div>
      
      <div className="mt-8">
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          onClick={handleStartGame}
          disabled={isLoading}
        >
          {isLoading ? 'Memulai Permainan...' : 'Mulai Permainan'}
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <button 
          className="text-gray-500 hover:text-green-600 transition duration-200"
          onClick={onBackToModeSelection}
        >
          Kembali ke Pilihan Mode
        </button>
      </div>
    </div>
  );
  
  // Render active game UI
  const renderGameUI = () => (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
      {/* Game Header with Points */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-sm text-gray-600">Poin:</span>
          <h3 className="text-2xl font-bold text-green-700">{score}</h3>
        </div>
        <div>
          <span className="text-sm text-gray-600">Kata:</span>
          <h3 className="text-lg font-bold text-green-700">{gameStats.currentWordNumber}/{gameStats.totalWords}</h3>
        </div>
      </div>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center animate-pulse">
          {successMessage}
        </div>
      )}
      
      {/* Feedback message with animation */}
      {feedback && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4 text-center font-bold text-xl animate-bounce">
          {feedback}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {errorMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
          {renderRetryButton()}
        </div>
      )}
      
      {/* Image Display */}
      <div className="mb-6 flex justify-center">
        {wordData && wordData.imageUrl && (
          <img 
            src={wordData.imageUrl} 
            alt="Tebak kata ini" 
            className="rounded-lg border-4 border-green-100 shadow-md max-h-60 object-contain"
          />
        )}
      </div>
      
      {/* Answer Slots */}
      <div className="bg-green-50 p-6 rounded-lg mb-6">
        <p className="text-gray-600 text-sm mb-4 text-center">
          Susun kata yang sesuai dengan gambar:
        </p>
        <div className="flex justify-center space-x-2 min-h-14 mb-4">
          {answerSlots.map((slot, idx) => (
            <div
              key={`slot-${idx}`}
              className={`inline-block w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                slot 
                  ? 'bg-green-200 cursor-pointer border-2 border-green-500 hover:bg-green-300' 
                  : 'bg-gray-100 border-2 border-dashed border-gray-300'
              }`}
              onClick={() => slot && handleSlotClick(idx)}
            >
              {slot ? slot.letter : ''}
            </div>
          ))}
        </div>
        
        {/* Available Letter Cards */}
        <div className="grid grid-cols-5 gap-3 mt-6">
          {availableLetters.map((letter) => (
            <div
              key={letter.id}
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold cursor-pointer bg-yellow-200 hover:bg-yellow-300 text-yellow-800 shadow-sm hover:shadow transition-all duration-200"
              onClick={() => handleLetterClick(letter)}
            >
              {letter.letter}
            </div>
          ))}
        </div>
      </div>
      
      {/* Buttons */}
      <div className="mt-4 flex space-x-3">
        <button
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
          onClick={handleClearSelection}
          disabled={answerSlots.every(slot => slot === null)}
        >
          Hapus Pilihan
        </button>
        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          onClick={handleManualSubmit}
          disabled={answerSlots.includes(null)}
        >
          Periksa Jawaban
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <button 
          className="text-gray-500 hover:text-green-600 transition duration-200"
          onClick={onBackToModeSelection}
        >
          Kembali ke Pilihan Mode
        </button>
      </div>
    </div>
  );
  
  return (
    <div>
      {isLoading && !wordData ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : gameStarted && wordData ? (
        renderGameUI()
      ) : (
        renderGameSetupForm()
      )}
    </div>
  );
};

KidsGame.propTypes = {
  onBackToModeSelection: PropTypes.func.isRequired
};

export default KidsGame;
