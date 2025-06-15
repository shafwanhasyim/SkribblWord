import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, AlertCircle, RefreshCw, PlayCircle, Image } from 'lucide-react';

const KidsGame = ({ onBackToModeSelection }) => {
  // State management
  const [wordData, setWordData] = useState(null);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [answerSlots, setAnswerSlots] = useState([]);
  
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
    <motion.div 
      className="mt-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button 
        className="btn bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium py-2 px-6 rounded-xl shadow-md hover:shadow-lg"
        onClick={wordData ? getNextWord : fetchNewWord}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RefreshCw className="inline-block mr-2 h-4 w-4" />
        {isLoading ? 'Mencoba ulang...' : 'Coba Lagi'}
      </motion.button>
    </motion.div>
  );

  // Render game setup UI
  const renderGameSetupForm = () => (
    <motion.div 
      className="card bg-white shadow-xl rounded-2xl p-8 max-w-md mx-auto overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div className="relative mb-8">
        <motion.div 
          className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 4, 
            ease: "easeInOut" 
          }}
        />
        <motion.h2 
          className="text-3xl font-bold text-primary mb-2 relative z-10"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Mode Anak
        </motion.h2>
        <motion.p 
          className="text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Permainan kata untuk anak-anak dengan gambar
        </motion.p>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
            {renderRetryButton()}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="p-6 mb-8 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 shadow-inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className="flex items-center gap-3 mb-3"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Star className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-lg text-amber-800">Cara Bermain:</h3>
        </motion.div>
        <motion.ul 
          className="space-y-2 text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, staggerChildren: 0.1 }}
        >
          <motion.li 
            className="flex items-start"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="inline-block bg-amber-300 text-amber-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2">1</span>
            Lihat gambar yang ditampilkan
          </motion.li>
          <motion.li 
            className="flex items-start"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="inline-block bg-amber-300 text-amber-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2">2</span>
            Pilih kartu huruf untuk menyusun kata yang sesuai dengan gambar
          </motion.li>
          <motion.li 
            className="flex items-start"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="inline-block bg-amber-300 text-amber-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2">3</span>
            Tekan "Periksa Jawaban" jika sudah yakin
          </motion.li>
          <motion.li 
            className="flex items-start"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="inline-block bg-amber-300 text-amber-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2">4</span>
            Dapatkan poin untuk setiap jawaban benar!
          </motion.li>
        </motion.ul>
      </motion.div>
      
      <motion.div 
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          className="w-full btn bg-primary hover:bg-primary/90 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg"
          onClick={handleStartGame}
          disabled={isLoading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          {isLoading ? 'Memulai Permainan...' : 'Mulai Permainan'}
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button 
          className="text-gray-500 hover:text-primary flex items-center justify-center mx-auto"
          onClick={onBackToModeSelection}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Pilihan Mode
        </motion.button>
      </motion.div>
    </motion.div>
  );
  
  // Render active game UI
  const renderGameUI = () => (
    <motion.div 
      className="card bg-white shadow-xl rounded-2xl p-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Game Header with Points */}
      <motion.div 
        className="flex justify-between items-center mb-6"
        layout
      >
        <motion.div 
          className="flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/20 rounded-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Star className="h-5 w-5 text-amber-500 mr-2" />
          <span className="text-sm font-medium text-gray-600 mr-2">Poin:</span>
          <motion.span 
            className="text-2xl font-bold text-primary"
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {score}
          </motion.span>
        </motion.div>

        <motion.div 
          className="px-4 py-2 bg-gradient-to-r from-secondary/10 to-secondary/20 rounded-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm font-medium text-gray-600 mr-2">Kata:</span>
          <span className="text-lg font-bold text-secondary">
            {gameStats.currentWordNumber}/{gameStats.totalWords}
          </span>
        </motion.div>
      </motion.div>
      
      {/* Messages area with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 flex items-center"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xl mr-2">✅</span>
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}
        
        {feedback && (
          <motion.div 
            className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-4 rounded-xl mb-4 text-center font-bold text-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -5, 0],
            }}
            transition={{ 
              duration: 0.3,
              y: { repeat: Infinity, duration: 1.5 }
            }}
          >
            {feedback}
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div 
            className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-center"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
            {renderRetryButton()}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Image Display */}
      <motion.div 
        className="mb-8 flex justify-center"
        layout
        transition={{ type: "spring", stiffness: 100 }}
      >
        {wordData && wordData.imageUrl ? (
          <motion.div
            className="relative rounded-xl overflow-hidden shadow-lg border-4 border-primary/20 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
            <motion.img 
              src={wordData.imageUrl} 
              alt="Tebak kata ini" 
              className="max-h-60 object-contain p-1 z-10 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            />
          </motion.div>
        ) : (
          <motion.div 
            className="w-60 h-60 bg-gray-200 flex items-center justify-center rounded-xl border-4 border-dashed border-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Image className="h-12 w-12 text-gray-400" />
          </motion.div>
        )}
      </motion.div>
      
      {/* Answer Slots */}
      <motion.div 
        className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 shadow-inner mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.p 
          className="text-gray-600 text-sm mb-4 text-center font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Susun kata yang sesuai dengan gambar:
        </motion.p>
        <motion.div 
          className="flex justify-center gap-3 min-h-16 mb-6"
          layout
        >
          <AnimatePresence>
            {answerSlots.map((slot, idx) => (
              <motion.div
                key={`slot-${idx}`}
                className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold shadow transition ${
                  slot 
                    ? 'bg-gradient-to-br from-primary/80 to-primary cursor-pointer text-white border-2 border-primary/80' 
                    : 'bg-white/80 border-2 border-dashed border-gray-300'
                }`}
                onClick={() => slot && handleSlotClick(idx)}
                whileHover={slot ? { scale: 1.05, rotate: 3 } : {}}
                whileTap={slot ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                  delay: idx * 0.05
                }}
                layout
              >
                {slot ? slot.letter : ''}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Available Letter Cards */}
        <motion.div 
          className="grid grid-cols-5 gap-3 mt-6"
          layout
        >
          <AnimatePresence>
            {availableLetters.map((letter, index) => (
              <motion.div
                key={letter.id}
                className="w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold cursor-pointer bg-gradient-to-br from-amber-200 to-amber-300 text-amber-900 shadow-md"
                onClick={() => handleLetterClick(letter)}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15,
                  delay: index * 0.03 
                }}
                whileHover={{ scale: 1.1, rotate: Math.random() * 6 - 3 }}
                whileTap={{ scale: 0.9 }}
                layout
              >
                {letter.letter}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      
      {/* Buttons */}
      <motion.div 
        className="mt-6 flex gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl shadow transition flex items-center justify-center"
          onClick={handleClearSelection}
          disabled={answerSlots.every(slot => slot === null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Hapus Pilihan
        </motion.button>
        <motion.button
          className={`flex-1 btn text-white font-medium py-3 px-4 rounded-xl shadow-md flex items-center justify-center
            ${answerSlots.includes(null) ? 'bg-gray-400' : 'bg-gradient-to-br from-primary to-primary/90 hover:shadow-lg'}`}
          onClick={handleManualSubmit}
          disabled={answerSlots.includes(null)}
          whileHover={!answerSlots.includes(null) ? { scale: 1.02 } : {}}
          whileTap={!answerSlots.includes(null) ? { scale: 0.98 } : {}}
        >
          Periksa Jawaban
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button 
          className="text-gray-500 hover:text-primary flex items-center justify-center mx-auto"
          onClick={onBackToModeSelection}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Pilihan Mode
        </motion.button>
      </motion.div>
    </motion.div>
  );
  
  return (
    <div className="px-4 py-6">
      {isLoading && !wordData ? (
        <motion.div 
          className="flex justify-center items-center min-h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 rounded-full border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </motion.div>
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
