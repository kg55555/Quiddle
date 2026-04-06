/**
 * QuizCard Component
 * 
 * A reusable card component that displays quiz information in a visually appealing format.
 * The card shows quiz metadata including title, description, question count, attempts,
 * and course/subject details. Clicking the card navigates to the quiz taking page.
 * 
 * @component
 * @example
 * // Basic usage
 * const quiz: QuizInfo = {
 *   quiz_id: "123",
 *   quiz_name: "Midterm Practice",
 *   description: "Quiz study for COMP 7082 at BCIT",
 *   number_of_questions: 10,
 *   attempt_count: 5,
 *   created_at: "2026-01-15T10:30:00Z",
 *   course_name: "COMP7082",
 *   subject_name: "Software Engineering",
 *   first_name: "John",
 *   last_name: "Doe"
 * };
 * <QuizCard quiz={quiz} />
 * 
 * @typedef {Object} QuizCardProps
 * @property {QuizInfo} quiz - The quiz data object containing all quiz details
 * 
 * @returns {JSX.Element} A styled card component displaying quiz information with click navigation
 */
import React from 'react';
import { QuizInfo } from '../../../types'; // Adjust path as needed
import { ROUTES } from '../../../utils/paths';
import { useNavigate } from 'react-router-dom';

/**
 * Props interface for QuizCard component
 * 
 * @interface QuizCardProps
 * @property {QuizInfo} quiz - The quiz information object to display in the card.
 *                             Must contain all required fields from QuizInfo type:
 *                             quiz_id, quiz_name, description, number_of_questions,
 *                             attempt_count, created_at, course_name, subject_name,
 *                             first_name, last_name
 */
interface QuizCardProps {
    quiz: QuizInfo;
}

/**
 * QuizCard - Displays a single quiz as an interactive card
 * 
 * This component presents quiz information in a structured, visually organized format with:
 * - Quiz title and description at the top
 * - Left column: question count, attempt count, and creation date
 * - Right column: course name, subject name, and author information
 * - Click handler that navigates to the quiz taking page
 * 
 * Styling uses Tailwind CSS with purple theme (bg-purple-300, text-purple-800).
 * The card is fully clickable and provides cursor pointer feedback.
 * 
 * @param {QuizCardProps} props - Component props containing the quiz data
 * @param {QuizInfo} props.quiz - The quiz information to display
 * @returns {JSX.Element} A styled card div with quiz information and click navigation
 */
export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
    /**
     * Hook to enable navigation between routes
     * Used to navigate to the quiz taking page when card is clicked
     */
    const navigate = useNavigate();

    return (
        <div 
            className="quiz-card border w-90 bg-purple-300 text-gray-500 p-5 cursor-pointer" 
            onClick={() => navigate(`${ROUTES.QUIZTAKE}/${quiz.quiz_id}`)}
        >
            {/* Card header section with quiz title */}
            <div className="quiz-card-header">
                <h3 className="quiz-card-title text-2xl font-bold text-purple-800">
                    {quiz.quiz_name}
                </h3>
            </div>

            {/* Card body section with description and metadata */}
            <div className="quiz-card-body">
                {/* Quiz description */}
                <p className="quiz-card-description text-s">
                    {quiz.description}
                </p>

                {/* Metadata section split into two columns */}
                <div className="quiz-card-meta flex">
                    {/* Left column: Quiz statistics */}
                    <div className="flex flex-col gap-1 mt-4">
                        <span className="quiz-card-meta-item">
                            Questions: {quiz.number_of_questions}
                        </span>
                        <span className="quiz-card-meta-item">
                            Total Attempts: {quiz.attempt_count}
                        </span>
                        <span className="quiz-card-meta-item">
                            Created: {new Date(quiz.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Right column: Course, subject, and author information */}
                    <div className="flex flex-col gap-1 mt-4 ml-auto">
                        <span className="quiz-card-meta-item">
                            Course: {quiz.course_name}
                        </span>
                        <span className="quiz-card-meta-item">
                            Subject: {quiz.subject_name}
                        </span>
                        <span className="quiz-card-meta-item">
                            Author: {quiz.first_name} {quiz.last_name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;