import Footer from 'components/organisms/footer';
import Header from 'components/organisms/header';
import React, { useState } from 'react';

interface QuizCreateProps {
    // Add your props here
}

type Question = {
    id: number;
    question: string;
    type: 'MC' | 'T/F';
    options: string[];
    correctAnswers: number[]; // Array of indices that are correct
};

const QuizCreate: React.FC<QuizCreateProps> = () => {
    const [loading, setLoading] = useState(false);
    const [quizName, setQuizName] = useState("New Quiz");
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentType, setCurrentType] = useState<'MC' | 'T/F'>('MC');
    const [currentOptions, setCurrentOptions] = useState<string[]>(["", "", "", ""]);
    const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);

    const handleQuestionChange = (value: string) => {
        setCurrentQuestion(value);
    };

    const handleTypeChange = (type: 'MC' | 'T/F') => {
        setCurrentType(type);
        // Reset options and correct answers when switching types
        if (type === 'T/F') {
            setCurrentOptions(["True", "False"]);
            setCorrectAnswers([]);
        } else {
            setCurrentOptions(["", "", "", ""]);
            setCorrectAnswers([]);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...currentOptions];
        newOptions[index] = value;
        setCurrentOptions(newOptions);
    };

    const handleToggleCorrectAnswer = (index: number) => {
        setCorrectAnswers((prev) => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    const handleAddQuestion = () => {
        // Validate that question is filled
        if (!currentQuestion.trim()) {
            alert("Please enter a question");
            return;
        }

        // Validate options
        if (currentType === 'MC') {
            if (currentOptions.some(option => !option.trim())) {
                alert("Please fill in all options");
                return;
            }
        }

        // Validate that at least one correct answer is selected
        if (correctAnswers.length === 0) {
            alert("Please select at least one correct answer");
            return;
        }

        // Create new question
        const newQuestion: Question = {
            id: questions.length + 1,
            question: currentQuestion,
            type: currentType,
            options: currentType === 'MC' ? currentOptions.filter(opt => opt.trim()) : currentOptions,
            correctAnswers: correctAnswers,
        };

        setQuestions((prev) => [...prev, newQuestion]);

        // Reset form
        setCurrentQuestion("");
        setCurrentType('MC');
        setCurrentOptions(["", "", "", ""]);
        setCorrectAnswers([]);
    };

    const handleDeleteQuestion = (id: number) => {
        setQuestions((prev) => prev.filter(q => q.id !== id).map((q, idx) => ({ ...q, id: idx + 1 })));
    };

    return (
        <>
            <Header />
            <div className="quiz-create w-full flex justify-center">
                <div className='flex flex-col md:w-[80%] mb-10'>
                    <h1 className='text-3xl font-bold mb-4'>Quiz Creation</h1>
                    
                    {/* Quiz Name Input */}
                    <div className='mb-6'>
                        <label className='block text-sm font-semibold mb-2'>Quiz Name</label>
                        <input
                            type="text"
                            value={quizName}
                            onChange={(e) => setQuizName(e.target.value)}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                            placeholder="Enter quiz name"
                        />
                    </div>
                    {/* Course Name Input */}
                    <div className='mb-6'>
                        <label className='block text-sm font-semibold mb-2'>Course Name</label>
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                            placeholder="Enter course name"
                        />
                    </div>

                    {/* Description Input */}
                    <div className='mb-6'>
                        <label className='block text-sm font-semibold mb-2'>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='h-48 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                            placeholder="Type your description here"
                        />
                    </div>

                    {/* Question Creation Form */}
                    <div className='quiz-creation-form py-4 border-t-2 border-b-2 border-gray-200'>
                        <h2 className='text-2xl font-bold mb-4'>Add Questions</h2>
                        


                        {/* Question Type Selector */}
                        <div className='mb-6'>
                            <label className='block text-sm font-semibold mb-2'>Question Type</label>
                            <div className='flex gap-4'>
                                <button
                                    onClick={() => handleTypeChange('MC')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                                        currentType === 'MC'
                                            ? 'bg-purple-700 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    MC (Multiple Choice)
                                </button>
                                <button
                                    onClick={() => handleTypeChange('T/F')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                                        currentType === 'T/F'
                                            ? 'bg-purple-700 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    T/F (True/False)
                                </button>
                            </div>
                        </div>

                        {/* Question Input */}
                        <div className='mb-6'>
                            <label className='block text-sm font-semibold mb-2'>Question</label>
                            <textarea
                                value={currentQuestion}
                                onChange={(e) => handleQuestionChange(e.target.value)}
                                className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                                placeholder="Enter your question here"
                                rows={2}
                            />
                        </div>

                        {/* Options Input */}
                        <div className='mb-6'>
                            <label className='block text-sm font-semibold mb-2'>Answer Options</label>
                            <p className='text-xs text-gray-500 mb-3'>Click the circle to mark the correct answer(s)</p>
                            {currentOptions.map((option, index) => (
                                <div key={index} className='mb-3 flex items-center'>
                                    {/* Correct Answer Toggle Button */}
                                    <button
                                        onClick={() => handleToggleCorrectAnswer(index)}
                                        className={`mr-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                                            correctAnswers.includes(index)
                                                ? 'bg-purple-700 border-purple-700'
                                                : 'border-gray-400 hover:border-purple-500'
                                        }`}
                                    >
                                        {correctAnswers.includes(index) && (
                                            <span className='text-white font-bold'>✓</span>
                                        )}
                                    </button>

                                    <span className='pr-3 font-semibold text-gray-600 w-6'>{index + 1}.</span>
                                    
                                    {currentType === 'T/F' ? (
                                        
                                        
                                        <div className='flex-1 p-2 bg-gray-100 rounded-lg text-gray-700 font-semibold'>
                                            {option}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            className='flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                                            placeholder={`Option ${index + 1}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Question Button */}
                        <div className='flex justify-end'>
                            <button
                                onClick={handleAddQuestion}
                                className="bg-purple-700 text-white rounded-2xl px-5 py-3 font-semibold hover:bg-purple-800 transition"
                            >
                                Add Question
                            </button>
                        </div>
                    </div>

                    {/* Display Created Questions */}
                    {questions.length > 0 && (
                        <div className='quiz-questions-list py-4'>
                            <h2 className='text-2xl font-bold mb-4'>Your Questions</h2>
                            {questions.map((quiz) => (
                                <div key={quiz.id} className='quiz-question flex flex-col mb-10 pb-4 border-b border-gray-200'>
                                    {/* Question Header */}
                                    <div className='flex mb-4 justify-between items-start'>
                                        <div className='flex flex-1'>
                                            <div className='py-2 pr-2'>
                                                <p>{quiz.id}.</p>
                                            </div>
                                            <div className='p-2 rounded-lg bg-purple-300 w-full'>
                                                <h4>{quiz.question}</h4>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteQuestion(quiz.id)}
                                            className='ml-4 text-red-600 hover:text-red-800 font-semibold text-3xl'
                                        >
                                            X
                                        </button>
                                    </div>

                                    {/* Question Type Badge */}
                                    <div className='ml-8 mb-3'>
                                        <span className='inline-block bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold'>
                                            {quiz.type}
                                        </span>
                                    </div>

                                    {/* Options Display */}
                                    {quiz.options.map((option, idx) => (
                                        <div key={idx} className='ml-10 mb-2 flex items-center'>
                                        
                                            <p className='text-gray-700'>○ {option}</p>
                                            {quiz.correctAnswers.includes(idx) && (
                                                <span className='mr-2 text-green-600 font-bold'>✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit Quiz Button */}
                    {questions.length > 0 && (
                        <div className='flex justify-end mt-6'>
                            <button className="submit-button w-fit bg-purple-700 text-white rounded-2xl md:px-5 md:py-3 hover:bg-purple-800 transition">
                                <p>Save Quiz</p>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default QuizCreate;