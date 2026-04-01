import Footer from 'components/organisms/footer';
import Header from 'components/organisms/header';
import { ROUTES } from '../utils/paths';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Hub = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            navigate(ROUTES.LOGIN);
            return;
        }

        fetch('/api/quizzes/my-quizzes', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => setQuizzes(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token, navigate]);

    const handleEdit = (quizId: number) => {
        navigate(`${ROUTES.QUIZEDIT}/${quizId}`);
    };

    const handleTakeQuiz = (quizId: number) => {
        navigate(`${ROUTES.QUIZTAKE}/${quizId}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex justify-center items-center flex-grow p-8">
                    <div>Loading your quizzes...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="quiz-create w-full flex justify-center px-4 py-8 flex-grow">
                <div className="flex flex-col w-full md:w-[70%] mb-10">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
                        <Link
                            to={ROUTES.QUIZCREATE}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                        >
                            + Create New
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}. <button onClick={() => window.location.reload()} className="underline">Retry</button>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:gap-6">
                        {quizzes.length === 0 ? (
                            <div className="bg-gray-100 w-full md:w-72 h-48 rounded-lg p-6 shadow-sm text-gray-600 flex items-center justify-center">
                                No quizzes yet. <Link to={ROUTES.QUIZCREATE} className="text-indigo-600 underline ml-1 font-semibold">Create one!</Link>
                            </div>
                        ) : (
                            quizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="bg-white w-full md:w-72 h-48 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col justify-between"
                                >
                                    <div>
                                        <h2 className="font-semibold text-lg text-gray-900">
                                            {quiz.course_name} - {quiz.name}
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
                                    </div>
                                    
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => handleEdit(quiz.id)}
                                            className="flex-1 px-4 py-2 text-sm font-medium bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors duration-200 border border-gray-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleTakeQuiz(quiz.id)}
                                            className="flex-1 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                                        >
                                            Take Quiz
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Hub;
