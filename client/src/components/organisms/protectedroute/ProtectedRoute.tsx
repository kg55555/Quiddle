import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, logout } = useAuth();
  const location = useLocation();
  const [isValid, setIsValid] = useState<boolean | null>(null);



  useEffect(() => {
      if (token === null || token === undefined) {
        setIsValid(false);
        return;
        }

  const validateToken = async () => {
        try {
        const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/auth/verify-token', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

            if (response.ok) {
                setIsValid(true);
            } else {
                setIsValid(false);
                logout();
            }
        } catch (err) {
        console.error('Token validation failed:', err);
        setIsValid(false);
        logout();
        }
    };
    validateToken();
  }, [token]);

  if (isValid === null) return <div>Loading...</div>; // still validating
  if (!isValid) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
};

export default ProtectedRoute;