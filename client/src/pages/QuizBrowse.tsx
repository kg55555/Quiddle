import QuizCard from 'components/molecules/quiz-card';
import Footer from 'components/organisms/footer';
import Header from 'components/organisms/header';
import React, { useState, useEffect } from 'react';
import { QuizInfo } from '../types';

const QuizBrowse: React.FC = () => {

    const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
    const [quizCategory, setQuizCategory] = useState<string[]>([]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/browse', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data: { quizzes: QuizInfo[] } = await response.json();
                setQuizzes(data.quizzes.sort((a, b) => b.attempt_count - a.attempt_count));
                setQuizCategory([...new Set(data.quizzes.map(quiz => quiz.subject_name))].sort());
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };

        fetchQuizzes();
    }, []);

    return (
    <>
            <Header />
            <main className="flex flex-col flex-1">
                <section className="flex flex-col w-full relative flex-1">
                    {/* Container matching header width */}
                    <div className="flex w-full justify-center">
                        <div className="w-full md:w-[80%] px-4 md:px-0 py-8">
                            <h1 className="text-3xl font-bold mb-6">Browse Quizzes</h1>
                            {quizzes.length === 0 ? (
                                <p className="text-gray-600">No quizzes available.</p>
                            ) : (<>
                                {quizCategory.map((category) => (
                                    <>
                                    <div className="text-xl font-semibold text-purple-800 mb-4">{category}</div>
                                    <div className="overflow-x-auto w-full">
                                        <div className="flex bg-purple-900 gap-5 p-5 w-max min-w-full">
                                            {quizzes
                                                .filter((quiz) => quiz.subject_name === category)
                                                .map((quiz) => (
                                                    <div key={quiz.quiz_id} className="flex-shrink-0">
                                                        <QuizCard quiz={quiz} />
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                    </>
                                ))}
                            </>)}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
    </>
    );
}

export default QuizBrowse;