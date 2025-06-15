import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import AuthContext from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, KeyRound, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Backend Anda saat ini tidak mengembalikan token saat registrasi.
      // Jadi kita hanya akan mendaftar, lalu mengarahkan ke login.
      await apiClient.post('/auth/register', {
        username,
        email,
        password
      });
      // Redirect to login page with a success message
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full mb-4">
              <UserPlus className="text-white" size={28}/>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Buat Akun Baru</h1>
            <p className="text-gray-500">Bergabung untuk mulai bermain Skribbl Word!</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
            <label className="text-sm font-medium text-gray-700">Konfirmasi Password</label>
            <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="mr-2" size={18} />
                  <span>Daftar Sekarang</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
        <motion.p className="text-center text-sm text-gray-500" variants={itemVariants}>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
            Masuk di sini
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

