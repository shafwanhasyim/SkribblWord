import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-200 text-indigo-800' : '';
  };

  return (
    <div className="bg-white shadow-md mb-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h1 
              onClick={() => navigate('/')} 
              className="text-2xl font-bold text-indigo-600 cursor-pointer"
            >
              Skribbl Word
            </h1>            <nav className="hidden md:flex ml-6 space-x-1">
              <button 
                onClick={() => navigate('/')}
                className={`px-3 py-2 rounded hover:bg-indigo-100 transition-colors ${isActive('/')}`}
              >
                Beranda
              </button>
              <button 
                onClick={() => navigate('/game')}
                className={`px-3 py-2 rounded hover:bg-indigo-100 transition-colors ${isActive('/game')}`}
              >
                Main
              </button>
              <button 
                onClick={() => navigate('/leaderboard')}
                className={`px-3 py-2 rounded hover:bg-indigo-100 transition-colors ${isActive('/leaderboard')}`}
              >
                Leaderboard
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className={`px-3 py-2 rounded hover:bg-indigo-100 transition-colors ${isActive('/profile')}`}
              >
                Profil
              </button>
            </nav>
          </div>
          
          <div className="flex items-center">
            <span className="mr-4 hidden md:inline">
              Hai, <span className="font-semibold">{user?.username || 'Pemain'}</span>
            </span>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2 px-4 rounded transition duration-200 mr-2"
            >
              <span className="md:hidden">Profil</span>
              <span className="hidden md:inline">Profil Saya</span>
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}        <div className="md:hidden border-t border-gray-200">
          <nav className="flex justify-between p-2">
            <button 
              onClick={() => navigate('/')}
              className={`flex-1 px-3 py-2 rounded text-center hover:bg-indigo-100 transition-colors ${isActive('/')}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => navigate('/game')}
              className={`flex-1 px-3 py-2 rounded text-center hover:bg-indigo-100 transition-colors ${isActive('/game')}`}
            >
              Main
            </button>
            <button 
              onClick={() => navigate('/leaderboard')}
              className={`flex-1 px-3 py-2 rounded text-center hover:bg-indigo-100 transition-colors ${isActive('/leaderboard')}`}
            >
              Skor
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className={`flex-1 px-3 py-2 rounded text-center hover:bg-indigo-100 transition-colors ${isActive('/profile')}`}
            >
              Profil
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
