import Footer from 'components/organisms/footer';
import Header from 'components/organisms/header';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';


interface QuizCreateProps {}

// Represents a single quiz question with its type, options, and correct answers
type Question = {
    id: number;
    question: string;
    type: 'MC' | 'T/F' | 'SA';
    options: string[];
    correctAnswers: number[]; // Stores indices of correct options
};

const QuizCreate: React.FC<QuizCreateProps> = () => {
	
	const { token } = useAuth(); //token for logging in
	
    const [loading, setLoading] = useState(false);
    const [quizName, setQuizName] = useState("New Quiz");
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentType, setCurrentType] = useState<'MC' | 'T/F' | 'SA'>('MC');
    const [currentOptions, setCurrentOptions] = useState<string[]>(["", "", "", ""]);
    const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);

    // when the question type changes, reset the options
    const handleTypeChange = (type: 'MC' | 'T/F' | 'SA') => {
        setCurrentType(type);
        if (type === 'T/F') {
            setCurrentOptions(["True", "False"]);
            setCorrectAnswers([]);
        } else if (type === 'SA') {
            setCurrentOptions([""]);
            setCorrectAnswers([0]);
        } else {
            setCurrentOptions(["", "", "", ""]);
            setCorrectAnswers([]);
        }
    };

	// Copy the array first so we don't modify state directly,
	// then update the value at the given index
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...currentOptions];
        newOptions[index] = value;
        setCurrentOptions(newOptions);
    };

    // Toggles an option's index in/out of the correctAnswers array (used for MC)
    const handleToggleCorrectAnswer = (index: number) => {
        setCorrectAnswers((prev) => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    // Strips non-alphanumeric characters and enforces LETTERS followed by NUMBERS format (e.g. MATH101)
    const handleCourseNameChange = (value: string) => {
        const raw = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (/^[A-Z]*[0-9]*$/.test(raw)) {
            setCourseName(raw);
        }
    };

    // Validates the current question form and appends it to the questions list
    const handleAddQuestion = () => {
        if (!currentQuestion.trim()) {
            alert("Please enter a question");
            return;
        }

        // MC requires all option fields to be filled
        if (currentType === 'MC') {
            if (currentOptions.some(option => !option.trim())) {
                alert("Please fill in all options");
                return;
            }
        }

        // SA requires the answer field to be filled
        if (currentType === 'SA') {
            if (!currentOptions[0].trim()) {
                alert("Please enter the correct answer");
                return;
            }
        }

        // MC and T/F require at least one correct answer to be selected
		if ((currentType === 'MC' || currentType === 'T/F') && correctAnswers.length === 0) {
			alert("Please select at least one correct answer");
			return;
		}


        const newQuestion: Question = {
            id: questions.length + 1,
            question: currentQuestion,
            type: currentType,
            // MC filters out any empty options; other types keep options as-is
            options: currentType === 'MC' ? currentOptions.filter(opt => opt.trim()) : currentOptions,
            correctAnswers: correctAnswers,
        };

        setQuestions((prev) => [...prev, newQuestion]);

        // Reset the question builder back to defaults
        setCurrentQuestion("");
        setCurrentType('MC');
        setCurrentOptions(["", "", "", ""]);
        setCorrectAnswers([]);
    };

    // Removes a question by ID and re-indexes remaining questions sequentially
    const handleDeleteQuestion = (id: number) => {
        setQuestions((prev) => prev.filter(q => q.id !== id).map((q, idx) => ({ ...q, id: idx + 1 })));
    };

    // Validates and submits the quiz to the API
    const handleSaveQuiz = async () => {
        if (!quizName.trim()) {
            alert("Please enter a quiz name");
            return;
        }
        if (questions.length === 0) {
            alert("Please add at least one question");
            return;
        }

        // Shape the data to match the API's expected payload format
        const payload = {
            name: quizName,
            course_name: courseName,
            description: description,
            questions: questions.map((q) => ({
                question_text: q.question,
                type: q.type,
                answers: q.options.map((option, index) => ({
                    answer_text: option,
                    is_correct: q.correctAnswers.includes(index),
                })),
            })),
        };

        try {
            setLoading(true);
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to save quiz');

            alert("Quiz saved successfully!");

            // Reset the entire form after a successful save
            setQuizName("New Quiz");
            setCourseName("");
            setDescription("");
            setQuestions([]);
        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Reusable button for selecting question type — highlights when active
    const TypeButton = ({ type, label }: { type: 'MC' | 'T/F' | 'SA', label: string }) => (
        <button
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
                currentType === type ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
            {label}
        </button>
    );

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

                    {/* Course Name Input — enforces alphanumeric format like MATH101 */}
                    <div className='mb-6'>
                        <label className='block text-sm font-semibold mb-2'>Course Name</label>
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => handleCourseNameChange(e.target.value)}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                            placeholder="e.g. MATH101"
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

                        {/* Question Type Selector — switching type resets options and correct answers */}
                        <div className='mb-6'>
                            <label className='block text-sm font-semibold mb-2'>Question Type</label>
                            <div className='flex gap-4'>
                                <TypeButton type='MC' label='MC (Multiple Choice)' />
                                <TypeButton type='T/F' label='T/F (True/False)' />
                                <TypeButton type='SA' label='Short Answer' />
                            </div>
                        </div>

                        {/* Question Text Input */}
                        <div className='mb-6'>
                            <label className='block text-sm font-semibold mb-2'>Question</label>
                            <textarea
                                value={currentQuestion}
                                onChange={(e) => setCurrentQuestion(e.target.value)}
                                className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                                placeholder="Enter your question here"
                                rows={2}
                            />
                        </div>

                        {/* Options Input — renders differently based on question type */}
                        <div className='mb-6'>
                            <label className='block text-sm font-semibold mb-2'>
                                {currentType === 'SA' ? 'Correct Answer' : 'Answer Options'}
                            </label>

                            {/* SA — single text input for the correct answer */}
                            {currentType === 'SA' && (
                                <input
                                    type="text"
                                    value={currentOptions[0]}
                                    onChange={(e) => handleOptionChange(0, e.target.value)}
                                    className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                                    placeholder="Enter the correct answer"
                                />
                            )}

                            {/* T/F — radio buttons to select True or False as correct */}
                            {currentType === 'T/F' && (
                                <>
                                    <p className='text-xs text-gray-500 mb-3'>Select the correct answer</p>
                                    {currentOptions.map((option, index) => (
                                        <div key={index} className='mb-3 flex items-center'>
                                            <input
                                                type="radio"
                                                name="tfCorrectAnswer"
                                                checked={correctAnswers.includes(index)}
                                                onChange={() => setCorrectAnswers([index])}
                                                className='mr-3 w-4 h-4 accent-purple-700'
                                            />
                                            <div className='flex-1 p-2 bg-gray-100 rounded-lg text-gray-700 font-semibold'>
                                                {option}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* MC — text inputs for each option with toggleable correct answer markers */}
                            {currentType === 'MC' && (
                                <>
                                    <p className='text-xs text-gray-500 mb-3'>Click the circle to mark the correct answer(s)</p>
                                    {currentOptions.map((option, index) => (
                                        <div key={index} className='mb-3 flex items-center'>
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
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                                className='flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
                                                placeholder={`Option ${index + 1}`}
                                            />
                                        </div>
                                    ))}
                                </>
                            )}
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

                    {/* Display Created Questions — only shown once at least one question exists */}
                    {questions.length > 0 && (
                        <div className='quiz-questions-list py-4'>
                            <h2 className='text-2xl font-bold mb-4'>Your Questions</h2>
                            {questions.map((quiz) => (
                                <div key={quiz.id} className='quiz-question flex flex-col mb-10 pb-4 border-b border-gray-200'>

                                    {/* Question header with index number, text, and delete button */}
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

                                    {/* Question type badge */}
                                    <div className='ml-8 mb-3'>
                                        <span className='inline-block bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold'>
                                            {quiz.type}
                                        </span>
                                    </div>

                                    {/* SA — displays the single correct answer */}
                                    {quiz.type === 'SA' && (
                                        <div className='ml-10 mb-2'>
                                            <p className='text-gray-700'>Answer: <span className='font-semibold text-green-600'>{quiz.options[0]}</span></p>
                                        </div>
                                    )}

                                    {/* T/F — lists True/False with a checkmark on the correct one */}
                                    {quiz.type === 'T/F' && (
                                        quiz.options.map((option, idx) => (
                                            <div key={idx} className='ml-10 mb-2 flex items-center'>
                                                <p className='text-gray-700'>{option}</p>
                                                {quiz.correctAnswers.includes(idx) && (
                                                    <span className='ml-2 text-green-600 font-bold'>✓</span>
                                                )}
                                            </div>
                                        ))
                                    )}

                                    {/* MC — lists all options with a checkmark on correct ones */}
                                    {quiz.type === 'MC' && (
                                        quiz.options.map((option, idx) => (
                                            <div key={idx} className='ml-10 mb-2 flex items-center'>
                                                <p className='text-gray-700'>○ {option}</p>
                                                {quiz.correctAnswers.includes(idx) && (
                                                    <span className='ml-2 text-green-600 font-bold'>✓</span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit Quiz Button — only shown once at least one question exists */}
                    {questions.length > 0 && (
                        <div className='flex justify-end mt-6'>
                            <button
                                onClick={handleSaveQuiz}
                                disabled={loading}
                                className="submit-button w-fit bg-purple-700 text-white rounded-2xl md:px-5 md:py-3 hover:bg-purple-800 transition disabled:opacity-50"
                            >
                                <p>{loading ? 'Saving...' : 'Save Quiz'}</p>
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
