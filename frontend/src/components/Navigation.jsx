import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Home, Award, User, LogOut, Play, Menu } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-100 text-primary-700 font-medium' : '';
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -5 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05, y: -2 }
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-lg mb-6 sticky top-0 z-50"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <motion.h1 
              onClick={() => navigate('/')} 
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent cursor-pointer flex items-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.span 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -5, 0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mr-2"
              >
                🎮
              </motion.span>
              Skribbl Word
            </motion.h1>
            <nav className="hidden md:flex ml-6 space-x-2">
              <motion.button 
                onClick={() => navigate('/')}
                className={`px-4 py-2 rounded-full flex items-center space-x-1 hover:bg-primary-50 transition-colors ${isActive('/')}`}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Home size={18} />
                <span>Beranda</span>
              </motion.button>
              <motion.button 
                onClick={() => navigate('/game')}
                className={`px-4 py-2 rounded-full flex items-center space-x-1 hover:bg-primary-50 transition-colors ${isActive('/game')}`}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ delay: 0.1 }}
              >
                <Play size={18} />
                <span>Main</span>
              </motion.button>
              <motion.button 
                onClick={() => navigate('/leaderboard')}
                className={`px-4 py-2 rounded-full flex items-center space-x-1 hover:bg-primary-50 transition-colors ${isActive('/leaderboard')}`}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ delay: 0.2 }}
              >
                <Award size={18} />
                <span>Leaderboard</span>
              </motion.button>
              <motion.button 
                onClick={() => navigate('/profile')}
                className={`px-4 py-2 rounded-full flex items-center space-x-1 hover:bg-primary-50 transition-colors ${isActive('/profile')}`}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ delay: 0.3 }}
              >
                <User size={18} />
                <span>Profil</span>
              </motion.button>
            </nav>
          </div>
            <div className="flex items-center">
            {user && (
              <>
                <motion.span 
                  className="mr-4 hidden md:inline bg-slate-100 py-1 px-3 rounded-full text-slate-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  Hai, <span className="font-semibold">{user.username || 'Pemain'}</span>
                </motion.span>
                <motion.button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full shadow transition duration-200 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={16} />
                  <span className="hidden md:inline">Logout</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <motion.nav 
            className="flex justify-between p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button 
              onClick={() => navigate('/')}
              className={`flex-1 px-2 py-2 rounded-full text-center hover:bg-primary-50 transition-colors flex flex-col items-center ${isActive('/')}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Home size={18} />
              <span className="text-xs mt-1">Beranda</span>
            </motion.button>
            <motion.button 
              onClick={() => navigate('/game')}
              className={`flex-1 px-2 py-2 rounded-full text-center hover:bg-primary-50 transition-colors flex flex-col items-center ${isActive('/game')}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play size={18} />
              <span className="text-xs mt-1">Main</span>
            </motion.button>
            <motion.button 
              onClick={() => navigate('/leaderboard')}
              className={`flex-1 px-2 py-2 rounded-full text-center hover:bg-primary-50 transition-colors flex flex-col items-center ${isActive('/leaderboard')}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Award size={18} />
              <span className="text-xs mt-1">Skor</span>
            </motion.button>
            <motion.button 
              onClick={() => navigate('/profile')}
              className={`flex-1 px-2 py-2 rounded-full text-center hover:bg-primary-50 transition-colors flex flex-col items-center ${isActive('/profile')}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <User size={18} />
              <span className="text-xs mt-1">Profil</span>
            </motion.button>
          </motion.nav>
        </div>
      </div>
    </motion.div>
  );
};

export default Navigation;
