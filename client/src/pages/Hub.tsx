import Footer from 'components/organisms/footer';
import Header from 'components/organisms/header';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Hub = () => {
  const { token } = useAuth();
  const placeHolderQuizzes = [
    { quiz_id: 1, title: "Course Name - Quiz Name", description: "Quiz Description" },
    { quiz_id: 2, title: "Course Name - Quiz Name", description: "Quiz Description" },
    { quiz_id: 3, title: "Course Name - Quiz Name", description: "Quiz Description" },
  ];

  const handleEdit = (quizId: number) => {
    // go to corresponding quiz_id in DB in "create" mode
  };

  const handleTakeQuiz = (quizId: number) => {
    // go to corresponding quiz_id in DB in "take" mode
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="quiz-create w-full flex justify-center px-4 py-8 flex-grow">
        <div className="flex flex-col w-full md:w-[70%] mb-10">
          <h1 className="text-center md:text-left text-3xl font-bold mb-8 text-gray-900">My Quizzes</h1>

          <div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:gap-6">

            {placeHolderQuizzes.length === 0 ? (
              <p className="bg-gray-100 w-full md:w-72 h-48 rounded-lg p-6 shadow-sm text-gray-600 flex items-center justify-center">
                No quizzes made
              </p>
            ) : (
              placeHolderQuizzes.map((quiz) => (
                <div
                  key={quiz.quiz_id}
                  className="bg-white w-full md:w-72 h-48 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">{quiz.title}</h2>
                    <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => handleEdit(quiz.quiz_id)}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors duration-200 border border-gray-300"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleTakeQuiz(quiz.quiz_id)}
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