import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StandardGame from '../components/StandardGame';
import KidsGame from '../components/KidsGame';
import { Gamepad2, Timer, Heart, Smile, ChevronLeft } from 'lucide-react';

const GamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // PERBAIKAN: Ambil mode awal dari HomePage, jika ada.
  // Jika pengguna langsung ke /game, selectedMode akan null.
  const [selectedMode, setSelectedMode] = useState(location.state?.initialMode || null);
  
  // Fungsi untuk kembali ke layar pemilihan mode.
  const handleBackToModeSelection = () => {
    setSelectedMode(null);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
      }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!selectedMode ? (
          // ===================================
          // TAMPILAN PEMILIHAN MODE PERMAINAN
          // ===================================
          <motion.div 
            key="mode-selection"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="w-full max-w-6xl"
          >
            <motion.div 
              className="text-center mb-10"
              variants={itemVariants}
            >
              <Gamepad2 size={48} className="text-indigo-500 mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">Pilih Mode Permainan</h1>
              <p className="text-lg text-gray-500 mt-2">Setiap mode menawarkan tantangan yang unik!</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card Time Attack */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setSelectedMode('TIME_ATTACK')}
                className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="bg-indigo-100 p-5 rounded-full mb-5">
                  <Timer size={40} className="text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Time Attack</h3>
                <p className="text-gray-600 flex-grow">Adu kecepatan! Raih skor tertinggi sebelum waktu habis.</p>
              </motion.div>

              {/* Card Survival */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setSelectedMode('SURVIVAL')}
                className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="bg-red-100 p-5 rounded-full mb-5">
                  <Heart size={40} className="text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Survival</h3>
                <p className="text-gray-600 flex-grow">Uji ketelitianmu! Permainan berakhir jika 3 nyawamu habis.</p>
              </motion.div>

              {/* Card Kids */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setSelectedMode('KIDS')}
                className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="bg-amber-100 p-5 rounded-full mb-5">
                  <Smile size={40} className="text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Kids Mode</h3>
                <p className="text-gray-600 flex-grow">Belajar kata baru dengan gambar dan kartu huruf yang seru.</p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // ===================================
          // TAMPILAN PERMAINAN YANG DIPILIH
          // ===================================
          <motion.div 
            key={selectedMode}
            className="w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            {selectedMode === 'TIME_ATTACK' || selectedMode === 'SURVIVAL' ? (
              <StandardGame 
                gameMode={selectedMode} 
                onBackToModeSelection={handleBackToModeSelection} 
              />
            ) : (
              <KidsGame 
                onBackToModeSelection={handleBackToModeSelection}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePage;
