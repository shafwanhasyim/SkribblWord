import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, XCircle, Play, Smile } from 'lucide-react';

// Komponen untuk menampilkan pesan feedback (Benar/Salah)
const FeedbackMessage = ({ type, message }) => {
  const variants = {
    hidden: { opacity: 0, y: -20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.9 }
  };

  const icon = type === 'success' 
    ? <Sparkles className="h-8 w-8 text-yellow-400" /> 
    : <XCircle className="h-8 w-8 text-red-400" />;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl ${bgColor} bg-opacity-90 backdrop-blur-sm z-20`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
      >
        {icon}
      </motion.div>
      <motion.p 
        className="mt-4 text-2xl font-bold text-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

FeedbackMessage.propTypes = {
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  message: PropTypes.string.isRequired,
};


const KidsGame = ({ onBackToModeSelection }) => {
  // State utama untuk data permainan
  const [wordData, setWordData] = useState(null);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [answerSlots, setAnswerSlots] = useState([]);
  
  // State untuk mengontrol UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'/'error', message: '...' }

  // Fungsi untuk mengambil kata baru dari backend
  const fetchNewWord = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    
    try {
      const response = await apiClient.get('/game/kids/new');
      const data = response.data;
      
      setWordData({
        wordId: data.wordId,
        imageUrl: data.imageUrl,
        letters: data.letters || []
      });
      
      setGameStarted(true);
    } catch (err) {
      console.error('Error fetching new word:', err);
      setError('Gagal memuat kata baru. Coba lagi ya!');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inisialisasi kartu huruf saat data kata baru diterima
  useEffect(() => {
    if (!wordData) return;
    
    setAnswerSlots(Array(wordData.letters.length).fill(null));
    
    // PERBAIKAN: Menggunakan Fisher-Yates shuffle untuk pengacakan yang lebih baik
    const lettersToShuffle = [...wordData.letters];
    for (let i = lettersToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lettersToShuffle[i], lettersToShuffle[j]] = [lettersToShuffle[j], lettersToShuffle[i]];
    }
    
    setAvailableLetters(
      lettersToShuffle.map((letter, index) => ({
        id: `${wordData.wordId}-${index}`, // ID unik per ronde
        letter: letter
      }))
    );
  }, [wordData]);

  // Fungsi untuk memindahkan huruf dari tumpukan ke slot jawaban
  const handleLetterClick = (clickedLetter) => {
    const emptySlotIndex = answerSlots.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) return;
    
    const newAnswerSlots = [...answerSlots];
    newAnswerSlots[emptySlotIndex] = clickedLetter;
    setAnswerSlots(newAnswerSlots);
    
    setAvailableLetters(availableLetters.filter(letter => letter.id !== clickedLetter.id));
  };

  // Fungsi untuk mengembalikan huruf dari slot jawaban ke tumpukan
  const handleSlotClick = (slotIndex) => {
    const letterToReturn = answerSlots[slotIndex];
    if (!letterToReturn) return;
    
    setAvailableLetters([...availableLetters, letterToReturn]);
    
    const newAnswerSlots = [...answerSlots];
    newAnswerSlots[slotIndex] = null;
    setAnswerSlots(newAnswerSlots);
  };

  // Logika Auto-Check saat semua slot terisi
  useEffect(() => {
    if (!wordData || !answerSlots.length || answerSlots.includes(null)) {
      return;
    }

    const checkAnswer = async () => {
      const finalAnswer = answerSlots.map(slot => slot.letter).join('');
      
      try {
        const response = await apiClient.post('/game/kids/check', {
          wordId: wordData.wordId,
          submittedAnswer: finalAnswer
        });

        if (response.data.isCorrect) {
          setFeedback({ type: 'success', message: 'Benar! Hebat!' });
          setTimeout(() => fetchNewWord(), 1500); // Muat kata baru setelah 1.5 detik
        } else {
          setFeedback({ type: 'error', message: 'Coba Lagi Yuk!' });
          // Auto-return huruf ke tumpukan setelah 1.5 detik
          setTimeout(() => {
            setAvailableLetters([...availableLetters, ...answerSlots]);
            setAnswerSlots(Array(answerSlots.length).fill(null));
            setFeedback(null);
          }, 1500);
        }
      } catch (err) {
        console.error('Error checking answer:', err);
        setFeedback({ type: 'error', message: 'Oops! Ada masalah.' });
        setTimeout(() => setFeedback(null), 1500);
      }
    };
    
    const timerId = setTimeout(checkAnswer, 500);
    return () => clearTimeout(timerId);
    
  }, [answerSlots, wordData, availableLetters, fetchNewWord]);

  // UI untuk layar setup sebelum permainan dimulai
  if (!gameStarted) {
    return (
        <motion.div 
          className="bg-white shadow-xl rounded-2xl p-8 max-w-md mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mx-auto bg-gradient-to-br from-amber-400 to-orange-400 w-24 h-24 flex items-center justify-center rounded-full mb-6 shadow-lg">
            <Smile size={50} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Mode Anak</h2>
          <p className="text-gray-600 mb-8">Susun huruf menjadi kata yang benar sesuai gambar!</p>
          <motion.button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md"
            onClick={fetchNewWord}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? "Memuat..." : <><Play size={20} /> Mulai Bermain</>}
          </motion.button>
        </motion.div>
    );
  }

  // UI saat permainan berlangsung
  return (
    <motion.div 
      className="bg-white shadow-xl rounded-2xl p-6 max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        {/* PERBAIKAN: Tombol Kembali ditempatkan di sini */}
        <div className="absolute -top-2 -left-2 sm:top-0 sm:left-0">
          <motion.button 
            onClick={onBackToModeSelection} 
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 font-semibold p-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={16} />
            <span>Mode Lain</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {feedback && <FeedbackMessage type={feedback.type} message={feedback.message} />}
        </AnimatePresence>

        {/* Gambar */}
        <motion.div 
          className="mb-8 flex justify-center pt-8" // pt-8 memberi ruang untuk tombol kembali
          layout
        >
          {wordData?.imageUrl ? (
            <motion.img 
              key={wordData.wordId}
              src={wordData.imageUrl} 
              alt="Tebak kata ini" 
              className="max-h-60 object-contain rounded-lg shadow-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            />
          ) : (
            <div className="w-full h-60 bg-gray-200 flex items-center justify-center rounded-lg">Memuat gambar...</div>
          )}
        </motion.div>
        
        {/* Slot Jawaban */}
        <motion.div 
          className="flex justify-center flex-wrap gap-2 sm:gap-3 min-h-[70px] mb-8 bg-indigo-50 p-4 rounded-lg"
          layout
        >
          {answerSlots.map((slot, idx) => (
            <motion.div
              key={`slot-${idx}`}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-2xl font-bold shadow-inner ${slot ? 'bg-indigo-500 text-white cursor-pointer' : 'bg-indigo-200'}`}
              onClick={() => handleSlotClick(idx)}
              layoutId={slot ? slot.id : `slot-empty-${idx}`}
            >
              {slot?.letter}
            </motion.div>
          ))}
        </motion.div>

        {/* Kartu Huruf yang Tersedia */}
        <motion.div 
          className="flex justify-center flex-wrap gap-2 sm:gap-3 min-h-[70px]"
          layout
        >
          <AnimatePresence>
            {availableLetters.map((letter) => (
              <motion.div
                key={letter.id}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer bg-amber-300 text-amber-800 shadow-md"
                onClick={() => handleLetterClick(letter)}
                layoutId={letter.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                {letter.letter}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

KidsGame.propTypes = {
  onBackToModeSelection: PropTypes.func.isRequired
};

export default KidsGame;
