import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">Skribbl Word</h1>
          <div className="flex items-center">
            <span className="mr-4">
              Selamat datang, <span className="font-semibold">{user?.username || 'Pemain'}</span>
            </span>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded transition duration-200 mr-2"
            >
              Profil
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="flex mb-6 bg-indigo-100 rounded-lg p-2">
          <nav className="flex space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="px-3 py-2 rounded hover:bg-indigo-200 transition-colors font-medium"
            >
              Beranda
            </button>
            <button 
              onClick={() => navigate('/leaderboard')}
              className="px-3 py-2 rounded hover:bg-indigo-200 transition-colors font-medium"
            >
              Leaderboard
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="px-3 py-2 rounded hover:bg-indigo-200 transition-colors font-medium"
            >
              Profil Saya
            </button>
          </nav>
        </div>
        
        <div className="bg-indigo-50 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-4 text-indigo-800">Pilih Mode Permainan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition duration-200">
              <h3 className="text-xl font-bold mb-2">Mode Klasik</h3>
              <p className="text-gray-600 mb-4">Tebak kata dari gambar yang dibuat pemain lain.</p>
              <button 
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
                onClick={() => navigate('/game')}
              >
                Mulai
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition duration-200">
              <h3 className="text-xl font-bold mb-2">Mode Anak-anak</h3>
              <p className="text-gray-600 mb-4">Mode yang lebih mudah dengan kata-kata sederhana.</p>
              <button 
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
                onClick={() => navigate('/game')}
              >
                Mulai
              </button>
            </div>
          </div>
        </div>
        
        
      </div>
    </div>
  );
};

export default HomePage;
