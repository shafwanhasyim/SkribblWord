import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Timer, Heart, Smile, LogOut } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const animationContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const animationItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto max-w-5xl">

        {/* --- Hero Section --- */}
        <motion.div 
          className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-8 mb-10 flex justify-between items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Selamat Datang,</h1>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-200">{user?.username || 'Pemain'}</p>
          </div>
          <motion.button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </motion.button>
        </motion.div>

        {/* --- Game Mode Selection --- */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Gamepad2 className="text-indigo-500" />
            Pilih Petualanganmu
          </h2>
          <p className="text-gray-500 mt-2">Mode mana yang ingin kamu taklukkan hari ini?</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={animationContainer}
          initial="hidden"
          animate="show"
        >
          {/* Card: Time Attack */}
          <motion.div 
            variants={animationItem}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group cursor-pointer"
            onClick={() => navigate('/game', { state: { initialMode: 'TIME_ATTACK' } })}
          >
            <div className="p-6 bg-indigo-500 flex items-center justify-center h-32">
              <Timer size={48} className="text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Time Attack</h3>
              <p className="text-gray-600 mb-4 flex-grow">Adu kecepatan! Tebak kata sebanyak mungkin sebelum waktu habis.</p>
              <button className="mt-auto w-full bg-indigo-500 group-hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Mainkan Sekarang
              </button>
            </div>
          </motion.div>

          {/* Card: Survival */}
          <motion.div 
            variants={animationItem}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group cursor-pointer"
            onClick={() => navigate('/game', { state: { initialMode: 'SURVIVAL' } })}
          >
            <div className="p-6 bg-red-500 flex items-center justify-center h-32">
              <Heart size={48} className="text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Survival</h3>
              <p className="text-gray-600 mb-4 flex-grow">Uji ketelitianmu! Permainan berakhir jika nyawamu habis.</p>
              <button className="mt-auto w-full bg-red-500 group-hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Mulai Bertahan
              </button>
            </div>
          </motion.div>

          {/* Card: Kids Mode */}
          <motion.div 
            variants={animationItem}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group cursor-pointer"
            onClick={() => navigate('/game', { state: { initialMode: 'KIDS' } })}
          >
            <div className="p-6 bg-amber-400 flex items-center justify-center h-32">
              <Smile size={48} className="text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Kids Mode</h3>
              <p className="text-gray-600 mb-4 flex-grow">Belajar sambil bermain dengan gambar dan kata-kata sederhana.</p>
              <button className="mt-auto w-full bg-amber-400 group-hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Ayo Bermain!
              </button>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </div>
  );
};

export default HomePage;
