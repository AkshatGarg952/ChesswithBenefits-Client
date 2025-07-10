import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Rehydrate user if token exists in sessionStorage
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = sessionStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          }
        });

        setUser(res.data.user);
        setToken(storedToken);
      } catch (err) {
        console.error("Auth rehydrate failed:", err.message);
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Login stores token in sessionStorage and state
  const login = (newToken, userData) => {
    sessionStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  // ✅ Logout clears both sessionStorage and state
  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
