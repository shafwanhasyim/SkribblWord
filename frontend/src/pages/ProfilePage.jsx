import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import AuthContext from '../context/AuthContext';
import { User, Mail, Shield, CheckCircle, AlertCircle, Home, ChevronLeft } from 'lucide-react';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Gagal memuat data profil. Silakan coba lagi nanti.');
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [logout, navigate]);

  const getUserInitials = () => {
    if (!profile || !profile.username) return '?';
    const nameParts = profile.username.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return profile.username.substring(0, 2).toUpperCase();
  };

  const getUserGradient = () => {
    if (!profile || !profile.username) return 'from-gray-500 to-gray-600';
    const hash = profile.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-blue-500 to-teal-500',
      'from-emerald-500 to-green-600',
      'from-amber-500 to-orange-600',
      'from-red-500 to-rose-600',
    ];
    return gradients[hash % gradients.length];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
           <p className="text-red-700 font-medium">{error}</p>
           <button onClick={() => navigate('/')} className="mt-6 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg">
             Kembali ke Beranda
           </button>
        </div>
      </div>
    );
  }

  // =======================================================
  // PERBAIKAN KUNCI ADA DI SINI
  // =======================================================
  // Kita hanya merender bagian utama jika 'profile' sudah pasti ada (bukan null)
  return (
    <div className="min-h-screen bg-slate-100 py-8 sm:py-12 px-4">
      {profile && ( // <-- Penjaga (Guard Clause) yang sangat penting
        <motion.div
          className="container mx-auto max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Tombol Kembali */}
          <motion.div variants={itemVariants} className="mb-6">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-semibold transition-colors">
                  <ChevronLeft size={20} />
                  Beranda
              </button>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            variants={itemVariants}
          >
            {/* Hero Section */}
            <div className={`relative p-8 bg-gradient-to-br ${getUserGradient()}`}>
              {/* ... (sisa kode hero section) ... */}
              <div className="relative flex flex-col sm:flex-row items-center gap-6">
                <motion.div 
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex-shrink-0 bg-white/30 p-2 shadow-lg"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
                >
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <span className={`text-4xl font-bold bg-gradient-to-br ${getUserGradient()} bg-clip-text text-transparent`}>
                      {getUserInitials()}
                    </span>
                  </div>
                </motion.div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-white/80">Selamat Datang Kembali,</p>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{profile.username}</h1>
                </div>
              </div>
            </div>

            {/* Detail Section */}
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Akun</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Info Card: Username */}
                <motion.div className="bg-slate-50 p-5 rounded-xl border" variants={itemVariants}>
                  <p className="text-lg font-medium text-gray-800">{profile.username}</p>
                </motion.div>

                {/* Info Card: Email */}
                <motion.div className="bg-slate-50 p-5 rounded-xl border" variants={itemVariants}>
                  <p className="text-lg font-medium text-gray-800">{profile.email}</p>
                </motion.div>

                {/* Info Card: Peran */}
                <motion.div className="bg-slate-50 p-5 rounded-xl border" variants={itemVariants}>
                  {/* PERBAIKAN: Pengecekan tambahan sebelum .replace() */}
                  <p className="text-lg font-medium text-gray-800">{profile.role ? profile.role.replace('ROLE_', '') : 'Pemain'}</p>
                </motion.div>

                {/* Info Card: Status */}
                <motion.div className="bg-slate-50 p-5 rounded-xl border" variants={itemVariants}>
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    Aktif
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
