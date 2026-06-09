import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if token exists on load, then verify and load user profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('aquaforge_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('aquaforge_token');
          }
        } catch (err) {
          console.warn('Authentication check failed or token expired:', err.message);
          localStorage.removeItem('aquaforge_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Register Swimmer
  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.auth.register({ name, email, password });
      if (res.success && res.token) {
        localStorage.setItem('aquaforge_token', res.token);
        setUser(res.user);
        setLoading(false);
        return { success: true };
      } else {
        throw new Error(res.message || 'Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Login Swimmer
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('aquaforge_token', res.token);
        setUser(res.user);
        setLoading(false);
        return { success: true };
      } else {
        throw new Error(res.message || 'Login failed.');
      }
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout Swimmer
  const logout = () => {
    localStorage.removeItem('aquaforge_token');
    setUser(null);
    setAuthError(null);
  };

  const value = {
    user,
    loading,
    authError,
    setAuthError,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
