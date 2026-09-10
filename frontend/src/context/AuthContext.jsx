import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('library_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('library_token');
      if (token) {
        try {
          const res = await api.getProfile();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('library_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Failed to verify session token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const user = res.data?.user || res.user;
    const token = res.data?.token || res.token;

    if (token && user) {
      localStorage.setItem('library_token', token);
      localStorage.setItem('library_user', JSON.stringify(user));
      setUser(user);
      return user;
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    const user = res.data?.user || res.user;
    const token = res.data?.token || res.token;

    if (token && user) {
      localStorage.setItem('library_token', token);
      localStorage.setItem('library_user', JSON.stringify(user));
      setUser(user);
      return user;
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');
    setUser(null);
  };

  const isMember = user?.role === 'member';
  const isLibrarian = user?.role === 'librarian' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isMember,
        isLibrarian,
        isAdmin,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
