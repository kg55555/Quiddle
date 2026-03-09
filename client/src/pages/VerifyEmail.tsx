import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyEmail: React.FC = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const verifyEmail = async () => {
            const email = searchParams.get('email');
            const validationString = searchParams.get('validationString');

            if (!email || !validationString) {
                navigate('/');
                return;
            }

            try {

                const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + `/api/mail/verify-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        validationString
                    }),
                });

                console.log('Verification response:', response);

                // if (response.ok) {
                //     // Redirect to home after successful verification
                //     navigate('/');
                // } else {
                //     navigate('/');
                // }
            } catch (error) {
                console.error('Email verification failed:', error);
                // navigate('/');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
                <p className="text-gray-600">Please wait while we verify your email address.</p>
            </div>
        </div>
    );
}

export default VerifyEmail;