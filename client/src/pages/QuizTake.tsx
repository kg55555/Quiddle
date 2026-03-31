import Footer from 'components/organisms/footer';
import Header from 'components/organisms/header';
import QuizResults from 'components/organisms/QuizResults';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


interface QuizTakeProps {}

type Answers = {
  [questionId: string]: string[]; // Array of answer IDs (for multiple choice support)
};

type AnswerOption = {
    answer_id: number;
    answer_description: string;
    is_correct: boolean;
};

type Question = {
    question_id: number;
    type: 'MC' | 'T/F' | 'SA';
    description: string;
    answers: AnswerOption[];
};

type QuizData = {
    quiz_id: number;
    name: string;
    description: string;
    course_name: string;
    number_of_questions: number;
    visibility: string;
    questions: Question[];
};

type QuestionResult = {
    questionId: number;
    userAnswerText: string;
    correctAnswerText: string;
    questionText: string;
    isCorrect: boolean;
};

type QuizResults = {
    submissionId: number;
    score: number;
    totalPoints: number;
    totalQuestions: number;
    correctCount: number;
    percentage: number;
    detailedResults: QuestionResult[];
};

const QuizTake: React.FC<QuizTakeProps> = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [quizName, setQuizName] = useState("Quiz Name");
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answers>({});
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<QuizResults | null>(null);

    // Fetch quiz data
    useEffect(() => {
        if (!quizId) {
            setError('Quiz ID is missing. Please select a quiz to take.');
            setLoading(false);
            return;
        }
        if (!token) {
            setError('You must be logged in to take a quiz.');
            setLoading(false);
            return;
        }
        fetchQuiz();
    }, [quizId, token]);

    const fetchQuiz = async () => {
        if (!quizId) return;

        try {
            setLoading(true);
            const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + `/api/take-quiz/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load quiz');
            }

            const data = await response.json();
            setQuizName(data.quiz.name);
            setQuizQuestions(data.quiz.questions);
            // Initialize answers object
            const initialAnswers: Answers = {};
            data.quiz.questions.forEach((q: Question) => {
                initialAnswers[q.question_id] = [];
            });
            setAnswers(initialAnswers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (questionId: number, answer: string, textValue: string, isMultiple: boolean) => {
        setAnswers((prev) => {
            const updated = { ...prev };
            
            if (isMultiple) {
                // For multiple choice, toggle answer in/out
                if (updated[questionId].includes(answer)) {
                    updated[questionId] = updated[questionId].filter(existing_answer => existing_answer !== answer);
                } else {
                    updated[questionId] = [...updated[questionId], answer];
                }
            } else {
                // For single choice, replace answer
                if (textValue) {
                    updated[questionId] = [textValue.trim()];
                } else {
                    updated[questionId] = [answer];
                }
            }
            
            return updated;
        });
        console.log(`Current answers state:`, answers);
    };

    const handleSubmit = async () => {
        if (!window.confirm('Ready to submit? You cannot change your answers after submission.')) {
            return;
        }

        try {
            setLoading(true);

            const payload = {
                quiz_id: quizId,
                answers: Object.entries(answers).map(([questionId, answerTexts]) => ({
                    questionId: parseInt(questionId),
                    answerTexts
                }))
            };

            const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/quiz-submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit quiz');
            }

            const data = await response.json();
            setResults(data.results);
            setSubmitted(true);
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('Error submitting quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="quiz-take w-full flex justify-center">
                    <div className='flex flex-col md:w-[80%] mb-10'>
                        <p>Loading quiz...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="quiz-take w-full flex justify-center">
                    <div className='flex flex-col md:w-[80%] mb-10'>
                        <p className='text-red-600'>{error}</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

   if (submitted && results) {
        return (
            <QuizResults 
                results={results} 
                quizQuestions={quizQuestions}
            />
        );
    }


    // Quiz taking page
    return (
        <>
            <Header />
            <div className="quiz-take w-full flex justify-center">
                <div className='flex flex-col md:w-[80%] mb-10'>
                    <h1 className='text-3xl font-bold mb-4'>{quizName}</h1>
                    <div className='quiz-question-section py-4'>
                        {quizQuestions.map((quiz) => {
                            // Check if question has multiple correct answers
                            const correctAnswerCount = quiz.answers.filter(a => a.is_correct).length;
                            const isMultiple = correctAnswerCount > 1;
                            const quizType = quiz.type;
                            let questionInput: string;
                            if (quizType === 'T/F') {
                                questionInput = 'radio';
                            } else if (quizType === 'SA') {
                                questionInput = 'text';
                            } else if (quizType === 'MC') {
                                if (isMultiple) {
                                    questionInput = 'checkbox';
                                } else {
                                    questionInput = 'radio';
                                }
                            }
                            return (
                                <div key={quiz.question_id} className='quiz-question flex flex-col mb-10'>
                                    <div className='flex mb-4'>
                                        <div className='py-2 pr-2'>
                                            <p>{quiz.question_id}.</p>
                                        </div>
                                        <div className='p-2 rounded-lg bg-purple-300 w-full'>
                                            <h4>{quiz.description}</h4>
                                        </div>
                                    </div>

                                    {isMultiple && (
                                        <p className='text-xs text-gray-500 ml-10 mb-2 italic'>Select all that apply</p>
                                    )}
                                    {quiz.answers.map((answer) => (
                                        <label key={answer.answer_id} className='flex ml-10 mb-2 items-center'>
                                            <input
                                                type={questionInput}
                                                name={`question-${quiz.question_id}`}
                                                checked={answers[quiz.question_id].includes(answer.answer_description)}
                                                value={answers[quiz.question_id] || ''}
                                                onChange={(e) => {
                                                    handleChange(quiz.question_id, answer.answer_description, questionInput === 'text' ? e.target.value : '', isMultiple);
                                                }}
                                            />
                                            {questionInput != 'text' && (
                                                <div className='pl-2'>
                                                    <p>{answer.answer_description}</p>
                                                </div>
                                            )}

                                        </label>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    <div className='flex justify-end'>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="submit-button w-fit bg-purple-700 text-white rounded-2xl md:px-5 md:py-3 md:ml-4 hover:bg-purple-800 transition disabled:opacity-50"
                        >
                            <p>{loading ? 'Submitting...' : 'Submit'}</p>
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default QuizTake;