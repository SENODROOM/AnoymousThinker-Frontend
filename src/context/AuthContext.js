import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('at_token'));

  // Set axios default header using utility
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data.user);
      } catch {
        localStorage.removeItem('at_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('at_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('at_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('at_token');
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
