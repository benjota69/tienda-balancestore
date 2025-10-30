// Autenticación del LOGIN

import { createContext, useState, useContext, useEffect, useCallback } from "react";

const AuthContext = createContext();

const AUTH_KEY = "authUser";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (_e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch (_e) {
    }
  }, [user]);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
