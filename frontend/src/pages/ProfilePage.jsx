import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch user profile data
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Gagal memuat data profil. Silahkan coba lagi nanti.');
        
        // If we get 401 Unauthorized, token might be invalid/expired
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [logout, navigate]); // Dependencies for useEffect

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Profile display
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6">Profil Anda</h1>
        
        {profile && (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="bg-indigo-100 p-4 rounded-full">
                <span className="text-4xl text-indigo-600">{profile.username?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.username || 'Pengguna'}</h2>
                <p className="text-gray-600">{profile.email || 'Email tidak tersedia'}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-xl font-semibold mb-3">Informasi Akun</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Username</p>
                  <p className="font-medium">{profile.username}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Peran</p>
                  <p className="font-medium">{profile.role || 'Pemain'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Aktif</span>
                </div>
              </div>
            </div>
            
            {profile.stats && (
              <div className="border-t pt-4">
                <h3 className="text-xl font-semibold mb-3">Statistik</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <p className="text-gray-600">Total Permainan</p>
                    <p className="text-2xl font-bold text-indigo-700">{profile.stats.totalGames || 0}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <p className="text-gray-600">Skor Tertinggi</p>
                    <p className="text-2xl font-bold text-indigo-700">{profile.stats.highScore || 0}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <p className="text-gray-600">Total Poin</p>
                    <p className="text-2xl font-bold text-indigo-700">{profile.stats.totalPoints || 0}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => navigate('/')} 
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-lg mr-4"
              >
                Kembali
              </button>
              <button className="border border-indigo-500 text-indigo-500 hover:bg-indigo-50 py-2 px-6 rounded-lg">
                Edit Profil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
