import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios.config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data.data))
        .catch(() => { setUser(null); localStorage.removeItem('accessToken'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    localStorage.setItem('accessToken', accessToken);
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (e) {}
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
