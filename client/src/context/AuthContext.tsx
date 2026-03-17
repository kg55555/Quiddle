import { createContext, useContext, useState } from 'react';

interface AuthContextType {
    token: string | null;
    userId: string | null;
    userFirstName: string | null;
    userLastName: string | null;
    userEmail: string | null;
    login: (token: string, userId: string, userFirstName: string, userLastName: string, userEmail: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [userId, setUserId] = useState(sessionStorage.getItem('userId'));
    const [userFirstName, setUserFirstName] = useState(sessionStorage.getItem('userFirstName'));
    const [userLastName, setUserLastName] = useState(sessionStorage.getItem('userLastName'));
    const [userEmail, setUserEmail] = useState(sessionStorage.getItem('userEmail'));

    const login = (token: string, userId: string, userFirstName: string, userLastName: string, userEmail: string) => {
        setToken(token);
        setUserId(userId);
        setUserFirstName(userFirstName);
        setUserLastName(userLastName);
        setUserEmail(userEmail);
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('userFirstName', userFirstName);
        sessionStorage.setItem('userLastName', userLastName);
        sessionStorage.setItem('userEmail', userEmail);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        setUserFirstName(null);
        setUserLastName(null);
        setUserEmail(null);
        sessionStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ token, userId, userFirstName, userLastName, userEmail, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
