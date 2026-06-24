import React, { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../services/api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('billflow_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('billflow_token', data.token);
      setToken(data.token);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('billflow_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const register = async (name, email, password, companyName, role) => {
    return await authApi.register(name, email, password, companyName, role);
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    register,
    refreshProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
