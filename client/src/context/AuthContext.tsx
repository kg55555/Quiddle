import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  login: (token: string, userId: string, userFullName: string, userEmail: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(sessionStorage.getItem('userId'));
  const [userFullName, setUserFullName] = useState<string | null>(sessionStorage.getItem('userFullName'));
  const [userEmail, setUserEmail] = useState<string | null>(sessionStorage.getItem('userEmail'));

  const login = (token: string, userId: string, userFullName: string, userEmail: string) => {
    setToken(token);
    setUserId(userId);
    setUserFullName(userFullName);
    setUserEmail(userEmail);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('userFullName', userFullName);
    sessionStorage.setItem('userEmail', userEmail);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserFullName(null);
    setUserEmail(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);