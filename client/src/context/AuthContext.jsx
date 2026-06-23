import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the context
const AuthContext = createContext(null);

// AuthProvider wraps the whole app and provides auth state to all components
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // the logged-in user object
  const [loading, setLoading] = useState(true); // true while checking if user is logged in

  // On app load, check if there's a saved token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('splitly_token');
    if (token) {
      // Fetch the user info using the saved token
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token is invalid or expired — clear it
          localStorage.removeItem('splitly_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Save token and user after login/register
  const login = (token, userData) => {
    localStorage.setItem('splitly_token', token);
    setUser(userData);
  };

  // Clear everything on logout
  const logout = () => {
    localStorage.removeItem('splitly_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component to access auth state
export function useAuth() {
  return useContext(AuthContext);
}
