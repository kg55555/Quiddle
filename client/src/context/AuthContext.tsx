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
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const [userFirstName, setUserFirstName] = useState(localStorage.getItem('userFirstName'));
    const [userLastName, setUserLastName] = useState(localStorage.getItem('userLastName'));
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));

    const login = (token: string, userId: string, userFirstName: string, userLastName: string, userEmail: string) => {
        setToken(token);
        setUserId(userId);
        setUserFirstName(userFirstName);
        setUserLastName(userLastName);
        setUserEmail(userEmail);
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userFirstName', userFirstName);
        localStorage.setItem('userLastName', userLastName);
        localStorage.setItem('userEmail', userEmail);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        setUserFirstName(null);
        setUserLastName(null);
        setUserEmail(null);
        
		localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
        localStorage.removeItem('userEmail');
    };

    return (
        <AuthContext.Provider value={{ token, userId, userFirstName, userLastName, userEmail, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
