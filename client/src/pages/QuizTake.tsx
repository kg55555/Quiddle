import Footer from 'components/organisms/footer';
import Header from 'components/organisms/header';
import React, { useState } from 'react';

interface QuizTakeProps {
    // Add your props here
}

type Answers = {
  [questionId: number]: string;
};

const QuizTake: React.FC<QuizTakeProps> = () => {
    const [loading, setLoading] = useState(false);
    const [quizName, setQuizName] = useState("Quiz Name");
    const [answers, setAnswers] = useState<Answers>({});

    const quizQuestions = [{id: 1, question: "What is the captial of BC", options: ["Vancouver", "Victoria", "Kelowna", "Prince George"]},
        {id: 2, question: "What is the captial of BC", options: ["Vancouver", "Victoria", "Kelowna", "Prince George"]},
        {id: 3,question: "Is Canada a part of the USA", options: ["True", "False"]},
        {id: 4, question: "What is the captial of BC", options: ["Vancouver", "Victoria", "Kelowna", "Prince George"]},
        {id: 5,question: "What is the captial of BC", options: ["Vancouver", "Victoria", "Kelowna", "Prince George"]},
                        ]

    const handleChange = (questionId: number, value: string) => {
        setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
        }));
    }

    return (
        <>
        <Header />
        <div className="quiz-take w-full flex justify-center">
            <div className='flex flex-col md:w-[80%] mb-10'>
            <h1 className='text-3xl font-bold mb-4'>{quizName}</h1>
            <div className='quiz-question-section py-4'>
                {quizQuestions.map((quiz) => (
                    <div className='quiz-question flex flex-col mb-10'>
                        <div className='flex mb-4'>
                            <div className='py-2 pr-2'>
                                <p>{quiz.id}.</p>
                            </div>
                            <div className='p-2 rounded-lg bg-purple-300 w-full'>
                                <h4>{quiz.question}</h4>
                            </div>
                        </div>

                        {quiz.options.map((options) => (
                            <label key={options} className='flex ml-10 mb-2 items-center'>
                            <input
                                type="radio"
                                name={`question-${quiz.id}`}
                                value={options}
                                checked={answers[quiz.id] === options}
                                onChange={() => handleChange(quiz.id, options)}
                                
                            />
                            <div className='pl-2'>
                               <p>{options}</p> 
                            </div>
                            </label>
                        ))}
                    </div>
                ))}
            </div>
            <div className='flex justify-end'>
                <div className="submit-button w-fit bg-purple-700 text-white rounded-2xl md:px-5 md:py-3 md:ml-4">
                    <p>Submit</p>
                </div>

            </div>



         </div>
        </div>
        <Footer />
        </>
    );
};

export default QuizTake;