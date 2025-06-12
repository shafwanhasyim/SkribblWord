import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Explicitly import components as default exports
import StandardGame from '../components/StandardGame';
import KidsGame from '../components/KidsGame';

const GamePage = () => {
  // State to track selected game mode
  const [selectedMode, setSelectedMode] = useState(null);
  
  const navigate = useNavigate();
  // Handle back to mode selection
  const handleBackToModeSelection = () => {
    setSelectedMode(null);
  };
  
  // Render mode selection UI
  const renderModeSelectionUI = () => (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-indigo-700">Pilih Mode Permainan</h2>
        <p className="text-gray-600 mt-2">Setiap mode permainan menawarkan pengalaman yang berbeda</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time Attack Mode */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl text-white">⏱️</span>
            </div>
            <h3 className="text-xl font-bold text-indigo-700 mt-3">Time Attack</h3>
          </div>
          <p className="text-gray-600 text-sm mb-6 h-24">
            Tebak sebanyak mungkin kata dalam waktu terbatas. Setiap jawaban benar akan 
            menambah waktu Anda. Cocok untuk menguji kecepatan berpikir!
          </p>
          <button
            onClick={() => setSelectedMode('TIME_ATTACK')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Pilih Mode
          </button>
        </div>
        
        {/* Survival Mode */}
        <div className="bg-gradient-to-br from-red-50 to-orange-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-red-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl text-white">❤️</span>
            </div>
            <h3 className="text-xl font-bold text-red-700 mt-3">Survival</h3>
          </div>
          <p className="text-gray-600 text-sm mb-6 h-24">
            Mulai dengan 3 nyawa dan pertahankan selama mungkin. Setiap jawaban salah akan 
            mengurangi nyawa Anda. Cocok untuk pengalaman yang lebih menantang!
          </p>
          <button
            onClick={() => setSelectedMode('SURVIVAL')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Pilih Mode
          </button>
        </div>
        
        {/* Kids Mode */}
        <div className="bg-gradient-to-br from-yellow-50 to-green-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl text-white">🧸</span>
            </div>
            <h3 className="text-xl font-bold text-green-700 mt-3">Mode Anak</h3>
          </div>
          <p className="text-gray-600 text-sm mb-6 h-24">
            Mode khusus untuk anak-anak dengan gambar dan kata sederhana. Susun huruf-huruf yang 
            tersedia untuk membentuk kata yang sesuai dengan gambar. Cocok untuk belajar sambil bermain!
          </p>
          <button
            onClick={() => setSelectedMode('KIDS')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Pilih Mode
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          className="text-gray-500 hover:text-indigo-600 transition duration-200"
          onClick={() => navigate('/')}
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
  // Render the appropriate content based on mode selection
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-indigo-700 text-center mb-8">Tebak Kata</h1>
      
      {!selectedMode ? (
        renderModeSelectionUI()
      ) : selectedMode === 'TIME_ATTACK' || selectedMode === 'SURVIVAL' ? (
        <StandardGame 
          gameMode={selectedMode} 
          onBackToModeSelection={handleBackToModeSelection} 
        />
      ) : selectedMode === 'KIDS' ? (
        <KidsGame 
          onBackToModeSelection={handleBackToModeSelection}
        />
      ) : null}
    </div>
  );
};

export default GamePage;
