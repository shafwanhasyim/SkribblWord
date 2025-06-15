import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import AuthContext from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      if (response.data && response.data.token) {
        auth.login(response.data.token, response.data);
        navigate('/');
      } else {
        setError('Respons login tidak valid.');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full mb-4">
            <LogIn className="text-white" size={28}/>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Selamat Datang Kembali!</h1>
          <p className="text-gray-500">Masuk ke akun Anda untuk melanjutkan.</p>
        </motion.div>
        
        {error && (
            <motion.div 
                className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center"
                initial={{opacity: 0}} animate={{opacity: 1}}
            >
                <AlertCircle className="text-red-500 mr-3" size={20} />
                <span className="text-red-800 text-sm font-medium">{error}</span>
            </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div variants={itemVariants}>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="mr-2" size={18}/>
                  <span>Login</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
        <motion.p className="text-center text-sm text-gray-500" variants={itemVariants}>
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
            Daftar di sini
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
