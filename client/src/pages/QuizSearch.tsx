import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from 'components/organisms/header';
import Footer from 'components/organisms/footer';


interface QuizResult {
    quiz_id: number;
    name: string;
    description: string;
    number_of_questions: number;
    course_name: string;
    created_by_name: string;
}


const QuizSearch: React.FC = () => {

    const [searchParams] = useSearchParams();
    const q = searchParams.get('q') || '';

    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resultLabel = results.length === 1 ? 'result' : 'results';

    // Fetch results whenever the search query changes
    useEffect(() => {
        if (!q.trim()) return; // don't fetch if query is empty

        const fetchResults = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await fetch(`/api/quizsearch?q=${encodeURIComponent(q)}`);
                const data = await res.json();
                setResults(data.results);
            } catch (err) {
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [q]);


    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex flex-col flex-1">
                <section className="flex flex-col w-full relative flex-1">
                    {/* Container matching header width */}
                    <div className="flex w-full justify-center">
                        <div className="w-full md:w-[80%] px-4 md:px-0 py-8">

                            {/* Page heading */}
                            <h2 className="text-2xl font-bold mb-2">Search Results</h2>

                            {/* No query state */}
                            {!q.trim() && (
                                <p className="text-gray-500">Enter a search term to find quizzes.</p>
                            )}

                            {/* Results section — only shown when there is a query */}
                            {q.trim() && (
                                <div>
                                    {/* Result count + query label */}
                                    {!loading && !error && (
                                        <p className="text-gray-500 mb-6">
                                            Found <span className="font-medium text-black">{results.length} {resultLabel}</span> for: <span className="font-medium text-black">"{q}"</span>
                                        </p>
                                    )}

                                    {/* Loading / error states */}
                                    {loading && <p className="text-gray-500 mb-6">Searching...</p>}
                                    {error && <p className="text-red-500 mb-6">{error}</p>}

                                    {/* Empty state */}
                                    {!loading && !error && results.length === 0 && (
                                        <p className="text-gray-500">No quizzes found for "{q}".</p>
                                    )}

                                    {/* Results list */}
                                    <div className="flex flex-col gap-4">
                                        {results.map(quiz => (
                                            <div key={quiz.quiz_id} className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                                                <h3 className="text-lg font-semibold">{quiz.name}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>

                                                {/* Meta info */}
                                                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                                                    {quiz.course_name         && <span>Course: {quiz.course_name}</span>}
                                                    {quiz.created_by_name     && <span>By: {quiz.created_by_name}</span>}
                                                    {quiz.number_of_questions && <span>{quiz.number_of_questions} questions</span>}
                                                </div>

                                                <Link
                                                    to={`/quiz/${quiz.quiz_id}`}
                                                    className="inline-block mt-4 bg-purple-500 text-white px-4 py-2 rounded-2xl text-sm hover:bg-purple-600"
                                                >
                                                    Take Quiz
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default QuizSearch;
