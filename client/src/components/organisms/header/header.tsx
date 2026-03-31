import React, { useState,useEffect } from 'react';
import { ROUTES } from '../../../utils/paths';
import { Link, useNavigate } from 'react-router-dom';
import hamburgerIcon from '/icons/hamburger.svg';
import { useAuth } from '../../../context/AuthContext';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

// for search suggestion
interface SearchSuggestion {
	quiz_id: number;
	name: string;
	course_name: string;
}


const Header: React.FC<HeaderProps> = () => {
    
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState(''); // for search bar
	
	// suggestions for search bar
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [loadingSuggestions, setLoadingSuggestions] = useState(false);
	
    const { token, logout, userFirstName } = useAuth();
    const navigate = useNavigate();
	
	
	const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`${ROUTES.QUIZSEARCH}?q=${encodeURIComponent(query.trim())}`);
        setQuery('');
		setSuggestions([]);
		setShowSuggestions(false);
		setOpen(false); // close mobile menu on search
    };
	
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) setOpen(false);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	
	
	// search suggestions useEffect
	useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 4) { // minimum 4 characters
        setSuggestions([]);
        setShowSuggestions(false);
		setLoadingSuggestions(false);
        return;
    }
	
	const controller = new AbortController();
	
    const timeout = setTimeout(async () => {
        try {
            setLoadingSuggestions(true);

            const response = await fetch(
                `${import.meta.env.VITE_APP_BACKEND_URL}/api/quizsearch/suggestions?q=${encodeURIComponent(trimmed)}`,
				{ signal: controller.signal }
            );
			
			if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
			
            const data = await response.json();
            setSuggestions((data.results || []).slice(0, 5));
            setShowSuggestions(true);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } finally {
            setLoadingSuggestions(false);
        }
    }, 1000); // 1 second

    return () => {
		clearTimeout(timeout);
		controller.abort();
	}
}, [query]);

let suggestionsDropdown = null;

if (showSuggestions) {
	if (loadingSuggestions) {
		suggestionsDropdown = (
			<div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg overflow-hidden z-50">
				<div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
			</div>
		);
	} else if (suggestions.length > 0) {
		suggestionsDropdown = (
			<div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg overflow-hidden z-50">
				{suggestions.map((item) => (
					<div
						key={item.quiz_id}
						className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
						onClick={() => {
							navigate(`${ROUTES.QUIZSEARCH}?q=${encodeURIComponent(item.name)}`);
							setQuery('');
							setSuggestions([]);
							setShowSuggestions(false);
						}}
					>
						<div className="text-sm font-medium text-gray-800">{item.name}</div>
						<div className="text-xs text-gray-500">{item.course_name}</div>
					</div>
				))}
			</div>
		);
	} else {
		suggestionsDropdown = (
			<div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg overflow-hidden z-50">
				<div className="px-4 py-3 text-sm text-gray-500">No quizzes found.</div>
			</div>
		);
	}
}
	
	
    return (
        <>
        <header className="header sticky flex top-0 flex-col w-full bg-purple-500 z-1000">
            <div className='flex w-full h-24 justify-center'>
                <div className="header-content flex w-full md:w-[80%] items-center justify-between px-4 md:px-0">
                    <Link to={ROUTES.HOME} className='flex items-center h-full'>
                        <h1 className="text-4xl font-bold text-white">Quiddle</h1>
                    </Link>
					
                    <div className='desktop-menu hidden md:flex justify-center items-center gap-6'>
						
						{/* Desktop Search Bar */}
						<form onSubmit={handleSearch} className="relative flex items-center mr-2 ml-4">
							<input
								type="text"
								placeholder="Search for quizzes..."
								value={query}
								onChange={e => setQuery(e.target.value)}
								onFocus={() => {
									if (suggestions.length > 0) setShowSuggestions(true);
								}}
								onBlur={() => {
									setTimeout(() => setShowSuggestions(false), 500);
								}}
								className="px-3 py-2 rounded-l-2xl text-sm text-gray-800 outline-none w-48 lg:w-64 xl:w-80"
							/>
							<button
								type="submit"
								className="bg-purple-700 text-white px-3 py-2 rounded-r-2xl text-sm hover:bg-purple-800">
								Search
							</button>
							
							{/*suggestions dropdown*/}
							{suggestionsDropdown}

						</form>
						
						<div>
                            <ul className="flex space-x-4 text-white">
                                <li>
                                    <Link to={ROUTES.HOME}>Home</Link>
                                </li>
                                <li>
                                    <Link to={ROUTES.QUIZBROWSE}>Browse</Link>
                                </li>
                                <li>
                                    <Link to={ROUTES.PROFILE}>Profile</Link>
                                </li>
								{/*Hub should only show when logged in*/}
								{token && (
									<li>
										<Link to={ROUTES.HUB}>Hub</Link>
									</li>
								)}
                            </ul>
                        </div>

                        {/*login token doesnt exist*/}
                        {(token === null || token === undefined) && (
                            <div className="flex items-center gap-3 md:ml-4">
                                <Link to={ROUTES.LOGIN}
                                    className="text-white font-medium">
                                    Login
                                </Link>
                                <Link to={ROUTES.SIGNUP}
                                    className="sign-in-button bg-purple-700 text-white rounded-2xl md:px-5 md:py-3">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/*login token exists*/}
                        {token !== null && token !== undefined && (
                            <div className="flex items-center gap-3 md:ml-4">
                               
                                <span className="text-white font-medium">
                                    Hi, {userFirstName}! 👋
                                </span>
                                <div
                                    className="sign-out-button bg-purple-700 text-white rounded-2xl md:px-5 md:py-3 cursor-pointer"
                                    onClick={() => { logout(); navigate(ROUTES.HOME); }}>
                                    Log Out
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mobile-menu md:hidden">
                        <img src={hamburgerIcon} alt="Menu" className="w-12 h-12 invert" onClick={() => setOpen(!open)} />
                    </div>
                </div>
            </div>

            {/* Mobile dropdown */}
            <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out
            ${open ? "max-h-96" : "max-h-0"}`}>
                <nav className="bg-purple-700 border-t border-gray-700">
                    
					{/* Mobile Search Bar */}
                    <form onSubmit={handleSearch} className="flex px-4 py-3">
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-l-2xl text-sm text-gray-800 outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-purple-900 text-white px-3 py-2 rounded-r-2xl text-sm">
                            Search
                        </button>
                    </form>
					
					
					<Link to={ROUTES.HOME} onClick={() => setOpen(false)} className="block px-4 py-3 text-white">
                        Home
                    </Link>
                    
					
					<Link to={ROUTES.QUIZBROWSE} onClick={() => setOpen(false)} className="block px-4 py-3 text-white">
                        Browse
                    </Link>
					
					{/*Matches the layout in desktop*/}
					{token && (
						<Link to={ROUTES.HUB} onClick={() => setOpen(false)} className="block px-4 py-3 text-white">
							Hub
						</Link>
					)}

                    
					
					{/*login token doesnt exist*/}
                    {(token === null || token === undefined) && (
                        <>
                            <Link to={ROUTES.LOGIN} onClick={() => setOpen(false)} className="block px-4 py-3 text-white">
                                Login
                            </Link>
                            <Link to={ROUTES.SIGNUP} onClick={() => setOpen(false)} className="block px-4 py-3 text-white">
                                Sign Up
                            </Link>
                        </>
                    )}
					
                    {/*login token exists*/}
                    {token !== null && token !== undefined && (
                        <>
                            <span className="block px-4 py-3 text-white font-medium">
                                Hi, {userFirstName}! 👋
                            </span>
                            <div
                                className="block px-4 py-3 text-white cursor-pointer"
                                onClick={() => { logout(); navigate(ROUTES.HOME); setOpen(false)} }>
                                Log Out
                            </div>
                        </>
                    )}
                </nav>
            </div>
        </header>
        </>
    );
};

export default Header;