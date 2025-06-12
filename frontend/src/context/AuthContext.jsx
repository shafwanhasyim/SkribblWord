import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create the AuthContext
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // State to track auth status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // Effect to check for stored token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt-token');
    const storedUser = localStorage.getItem('user-data');

    // Only proceed if we have both token and user data, and user data isn't "undefined"
    if (storedToken && storedUser && storedUser !== "undefined") {
      try {
        // Safely parse the user data
        const parsedUser = JSON.parse(storedUser);
        
        // Make sure parsed data is an object
        if (parsedUser && typeof parsedUser === 'object') {
          setToken(storedToken);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } else {
          // If parsed data isn't valid, clean up
          console.error("Invalid user data format in localStorage");
          localStorage.removeItem('jwt-token');
          localStorage.removeItem('user-data');
        }
      } catch (error) {
        // Handle JSON parse errors
        console.error("Error parsing user data from localStorage:", error);
        
        // Clean up corrupted data
        localStorage.removeItem('jwt-token');
        localStorage.removeItem('user-data');
      }
    }
  }, []);

  // Login function: store token and user info
  const login = (newToken, userData) => {
    localStorage.setItem('jwt-token', newToken);
    localStorage.setItem('user-data', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Logout function: remove token and reset state
  const logout = () => {
    localStorage.removeItem('jwt-token');
    localStorage.removeItem('user-data');
    
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  // Value to be provided by the context
  const contextValue = {
    isLoggedIn,
    user,
    token,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
