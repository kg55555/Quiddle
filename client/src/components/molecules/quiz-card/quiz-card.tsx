import React from 'react';
import { QuizInfo } from '../../../types'; // Adjust path as needed
import { useParams, useNavigate } from 'react-router-dom';

interface QuizCardProps {
    quiz: QuizInfo;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
    const navigate = useNavigate();

    return (
        <div className="quiz-card border w-90 bg-purple-300 text-gray-500 p-5 cursor-pointer" onClick={() => {navigate(`/quiztake/${quiz.quiz_id}`)}}>
            <div className="quiz-card-header">
                <h3 className="quiz-card-title text-2xl font-bold text-purple-800">{quiz.quiz_name}</h3>
            </div>
            <div className="quiz-card-body">
                <p className="quiz-card-description text-s">{quiz.description}</p>
                <div className="quiz-card-meta flex">
                    <div className="flex flex-col gap-1 mt-4">
                    <span className="quiz-card-meta-item">Questions: {quiz.number_of_questions}</span>
                    <span className="quiz-card-meta-item">Total Attempts: {quiz.attempt_count}</span>
                    <span className="quiz-card-meta-item">Created: {new Date(quiz.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-4 ml-auto">
                    <span className="quiz-card-meta-item">Course: {quiz.course_name}</span>
                    <span className="quiz-card-meta-item">Subject: {quiz.subject_name}</span>
                    <span className="quiz-card-meta-item">Author: {quiz.first_name} {quiz.last_name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;