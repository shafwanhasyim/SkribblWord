import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Home, RotateCcw } from 'lucide-react';

const GameOverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { score = 0, gameMode = 'UNKNOWN' } = location.state || {};
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold text-gray-800">Permainan Selesai!</h1>
          </motion.div>
          
          <motion.div 
            className="my-6"
            variants={itemVariants}
          >
            <p className="text-gray-600 text-lg">Skor Akhir Anda</p>
            <motion.p 
              className="text-7xl font-bold text-indigo-600"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
            >
              {score}
            </motion.p>
          </motion.div>

          <motion.div 
            className="flex flex-col gap-4"
            variants={itemVariants}
          >
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg"
              onClick={() => navigate('/game')}
            >
              <RotateCcw className="inline-block h-5 w-5 mr-2" />
              Main Lagi
            </button>
            <button
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg"
              onClick={() => navigate('/')}
            >
              <Home className="inline-block h-5 w-5 mr-2" />
              Ke Beranda
            </button>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameOverPage;
