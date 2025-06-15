import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create the AuthContext
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // State untuk melacak status otentikasi
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // PERBAIKAN: Tambahkan state isLoading, awalnya true
  const [isLoading, setIsLoading] = useState(true);

  // Effect untuk memeriksa token saat aplikasi dimuat
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('jwt-token');
      const storedUser = localStorage.getItem('user-data');

      if (storedToken && storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setToken(storedToken);
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error("Gagal memuat data sesi, membersihkan...", error);
      // Jika ada error (misal: data rusak), bersihkan localStorage
      localStorage.removeItem('jwt-token');
      localStorage.removeItem('user-data');
    } finally {
      // PERBAIKAN: Set isLoading menjadi false SETELAH semua pengecekan selesai
      setIsLoading(false);
    }
  }, []);

  // Fungsi login: simpan token dan data user
  const login = (newToken, userData) => {
    localStorage.setItem('jwt-token', newToken);
    localStorage.setItem('user-data', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Fungsi logout: hapus token dan reset state
  const logout = () => {
    localStorage.removeItem('jwt-token');
    localStorage.removeItem('user-data');
    
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  // Nilai yang akan disediakan oleh context
  const contextValue = {
    isLoggedIn,
    user,
    token,
    isLoading, // PERBAIKAN: Ekspor isLoading agar bisa digunakan komponen lain
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Validasi PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
