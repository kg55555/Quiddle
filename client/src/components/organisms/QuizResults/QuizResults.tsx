import React from 'react';
import Header from 'components/organisms/header';
import Footer from 'components/organisms/footer';

type QuestionResult = {
    questionId: number;
    questionText: string;
    userAnswerText: string;
    correctAnswerText: string;
    isCorrect: boolean;
};

type QuizResultsData = {
    score: number;
    totalPoints: number;
    percentage: number;
    correctCount: number;
    totalQuestions: number;
    detailedResults: QuestionResult[];
};

type Question = {
    question_id: number;
    description: string;
};

interface QuizResultsProps {
    results: QuizResultsData;
    quizQuestions: Question[];
    onBackClick?: () => void; // Optional callback instead of hardcoded navigation
}

const QuizResults: React.FC<QuizResultsProps> = ({ 
    results, 
    quizQuestions,
    onBackClick = () => window.location.href = '/hub'
}) => {
    return (
        <>
            <Header />
            <div className="quiz-take w-full flex justify-center">
                <div className='flex flex-col md:w-[80%] mb-10'>
                    <h1 className='text-3xl font-bold mb-6'>Quiz Results</h1>

                    {/* Results Summary */}
                    <div className='grid grid-cols-3 gap-4 mb-8'>
                        <div className='bg-green-50 p-4 rounded-lg border-2 border-green-200'>
                            <p className='text-gray-600 text-sm font-semibold mb-1'>Your Score</p>
                            <p className='text-2xl font-bold text-green-700'>
                                {results.score}/{results.totalPoints}
                            </p>
                        </div>
                        <div className='bg-blue-50 p-4 rounded-lg border-2 border-blue-200'>
                            <p className='text-gray-600 text-sm font-semibold mb-1'>Percentage</p>
                            <p className='text-2xl font-bold text-blue-700'>{results.percentage}%</p>
                        </div>
                        <div className='bg-purple-50 p-4 rounded-lg border-2 border-purple-200'>
                            <p className='text-gray-600 text-sm font-semibold mb-1'>Correct Answers</p>
                            <p className='text-2xl font-bold text-purple-700'>
                                {results.correctCount}/{results.totalQuestions}
                            </p>
                        </div>
                    </div>

                    {/* Detailed Results */}
                    <h2 className='text-2xl font-bold mb-4'>Review Your Answers</h2>
                    <div className='quiz-question-section py-4'>
                        {results.detailedResults.map((result, idx) => (
                            <div
                                key={idx}
                                className={`quiz-question flex flex-col mb-10 p-4 rounded-lg ${
                                    result.isCorrect ? 'bg-green-50 border-l-4 border-green-600' : 'bg-red-50 border-l-4 border-red-600'
                                }`}
                            >
                                <div className='flex mb-4 justify-between items-start'>
                                    <div className='flex flex-1'>
                                        <div className='py-2 pr-2'>
                                            <p className='font-bold'>{idx + 1}. {quizQuestions[idx]?.description || 'Question not found'}</p>
                                        </div>
                                        <div className='flex-1'>
                                            <h4 className='font-semibold text-gray-800'>{result.questionText}</h4>
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                                                result.isCorrect
                                                    ? 'bg-green-200 text-green-800'
                                                    : 'bg-red-200 text-red-800'
                                            }`}>
                                                {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='ml-10'>
                                    <p className='text-sm text-gray-600 mb-1'><span className='font-semibold'>Your Answer:</span> {result.userAnswerText}</p>
                                    <p className='text-sm text-gray-600'><span className='font-semibold'>Correct Answer:</span> {result.correctAnswerText}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-end mt-6'>
                        <button
                            onClick={onBackClick}
                            className='bg-purple-700 text-white rounded-2xl md:px-5 md:py-3 hover:bg-purple-800 transition'
                        >
                            <p>Back to Hub</p>
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default QuizResults;