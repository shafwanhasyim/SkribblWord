import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthContext from '../context/AuthContext';

/**
 * Protected Route yang sekarang memeriksa status loading sebelum redirect.
 */
const ProtectedRoute = ({ children }) => {
  // PERBAIKAN: Ambil isLoggedIn DAN isLoading dari context
  const { isLoggedIn, isLoading } = useContext(AuthContext);
  const location = useLocation();

  // PERBAIKAN: Jika masih dalam proses pengecekan awal, tampilkan UI loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Setelah loading selesai, baru periksa status login
  if (!isLoggedIn) {
    // Redirect ke halaman login jika tidak terautentikasi
    // Simpan lokasi saat ini agar bisa kembali setelah login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Jika sudah login, tampilkan halaman yang diminta
  return children;
};

// Validasi PropTypes
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
