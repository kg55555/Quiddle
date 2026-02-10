import Footer from 'components/organisms/footer';
import Header from 'components/organisms/header';
import React, { useState } from 'react';

interface QuizTakeProps {
    // Add your props here
}

const QuizTake: React.FC<QuizTakeProps> = () => {
    const [loading, setLoading] = useState(false);

    return (
        <>
        <Header />
        <div className="quiz-take">
            <h1>Quiz Take</h1>
            {Array.from({ length: 100 }, (_, i) => (
                <div>Loading... {i}</div>
            ))}
        </div>
        <Footer />
        </>
    );
};

export default QuizTake;