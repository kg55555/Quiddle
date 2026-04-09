/**
 * Header Component
 * 
 * A responsive navigation header with integrated search functionality, authentication controls,
 * and mobile-friendly menu. Features a sticky header with real-time search suggestions that
 * fetch quiz data from the backend.
 * 
 * Key features:
 * - Responsive design: desktop navigation bar and mobile hamburger menu
 * - Real-time search with debounced API calls and live suggestions dropdown
 * - Authentication-aware navigation (shows different options for logged-in vs. guest users)
 * - Search suggestions with minimum 4 character requirement to reduce API calls
 * - Automatic mobile menu close on navigation and window resize
 * 
 * @component
 * @example
 * // Basic usage - no props required
 * <Header />
 * 
 * @example
 * // Used in a layout with AuthContext provider
 * <AuthProvider>
 *   <Header />
 *   <main>Page content</main>
 *   <Footer />
 * </AuthProvider>
 * 
 * @typedef {Object} HeaderProps
 * @property {string} [title] - Optional title (currently unused)
 * @property {string} [subtitle] - Optional subtitle (currently unused)
 * 
 * @returns {JSX.Element} A sticky header with navigation, search, and mobile menu
 */
import React, { useState, useEffect } from 'react';
import { ROUTES } from '../../../utils/paths';
import { Link, useNavigate } from 'react-router-dom';
import hamburgerIcon from '/icons/hamburger.svg';
import { useAuth } from '../../../context/AuthContext';

/**
 * Props interface for Header component
 * 
 * @interface HeaderProps
 * @property {string} [title] - Optional custom header title (currently not utilized)
 * @property {string} [subtitle] - Optional subtitle text (currently not utilized)
 */
interface HeaderProps {
    title?: string;
    subtitle?: string;
}

/**
 * Search suggestion data structure returned from the backend API
 * 
 * @interface SearchSuggestion
 * @property {number} quiz_id - Unique identifier for the quiz
 * @property {string} name - The name/title of the quiz
 * @property {string} course_name - The course this quiz belongs to
 */
interface SearchSuggestion {
	quiz_id: number;
	name: string;
	course_name: string;
}

/**
 * Header - Main navigation header component with search and authentication
 * 
 * Provides a sticky navigation bar that adapts to screen size:
 * - Desktop (md and up): Full navigation menu, search bar with suggestions, authentication links
 * - Mobile (below md): Hamburger menu toggle that expands into full mobile navigation
 * 
 * Search functionality:
 * - Minimum 4 characters required to trigger API calls (debounced with 1000ms delay)
 * - Shows loading state while fetching suggestions
 * - Displays up to 5 suggestions in a dropdown
 * - Handles network errors gracefully
 * - Aborts previous requests if new query is submitted before response arrives
 * 
 * Authentication:
 * - Displays login/signup links for unauthenticated users
 * - Shows user greeting and logout button for authenticated users
 * - Only shows "Hub" link when user is logged in
 * 
 * Mobile behavior:
 * - Menu closes automatically when window resizes to desktop size
 * - Menu closes after navigation or search
 * 
 * @param {HeaderProps} props - Component props (title and subtitle currently unused)
 * @returns {JSX.Element} A sticky header containing logo, search, navigation, and authentication controls
 */
const Header: React.FC<HeaderProps> = () => {
    
	/**
	 * State for mobile menu open/close toggle
	 */
	const [open, setOpen] = useState(false);
	
	/**
	 * State for search input value
	 */
	const [query, setQuery] = useState('');
	
	/**
	 * State for search suggestions dropdown data
	 * Stores up to 5 quiz suggestions from backend
	 */
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	
	/**
	 * State to control visibility of suggestions dropdown
	 */
	const [showSuggestions, setShowSuggestions] = useState(false);
	
	/**
	 * State to track if suggestions are currently being loaded
	 */
	const [loadingSuggestions, setLoadingSuggestions] = useState(false);
	
	/**
	 * Authentication context data and functions
	 */
	const { token, logout, userFirstName } = useAuth();
	
	/**
	 * Navigation hook for programmatic route changes
	 */
	const navigate = useNavigate();
	
	/**
	 * Handles search form submission
	 * Navigates to search results page with query parameter
	 * Clears search state and closes mobile menu
	 * 
	 * @param {React.FormEvent} e - Form submission event
	 */
	const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`${ROUTES.QUIZSEARCH}?q=${encodeURIComponent(query.trim())}`);
        setQuery('');
		setSuggestions([]);
		setShowSuggestions(false);
		setOpen(false);
    };
	
	/**
	 * Effect: Close mobile menu on window resize to desktop size
	 * Prevents menu from staying open when window is resized to desktop breakpoint
	 */
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) setOpen(false);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	
	/**
	 * Effect: Fetch search suggestions with debouncing
	 * 
	 * Behavior:
	 * - Requires minimum 4 characters in search query
	 * - Debounces API calls with 1000ms delay to reduce server load
	 * - Aborts previous requests if new query arrives before response
	 * - Handles network errors gracefully without showing error messages
	 * - Displays loading state while fetching
	 * - Limits results to 5 suggestions
	 * 
	 * Dependencies: query value
	 */
	useEffect(() => {
    const trimmed = query.trim();

    // Clear suggestions if query is too short
    if (trimmed.length < 4) {
        setSuggestions([]);
        setShowSuggestions(false);
		setLoadingSuggestions(false);
        return;
    }
	
	// Create abort controller for request cancellation
	const controller = new AbortController();
	
	// Set debounce timeout
    const timeout = setTimeout(async () => {
        try {
            setLoadingSuggestions(true);

            // Fetch suggestions from backend API
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
            // Ignore abort errors from cancelled requests
            if (error.name !== 'AbortError') {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } finally {
            setLoadingSuggestions(false);
        }
    }, 1000); // 1 second debounce delay

    // Cleanup: clear timeout and abort request on unmount or query change
    return () => {
		clearTimeout(timeout);
		controller.abort();
	}
}, [query]);

/**
 * Render suggestions dropdown based on current state
 * Three possible states:
 * 1. Loading: Shows "Loading..." message
 * 2. Has suggestions: Shows list of suggestions with quiz name and course
 * 3. No results: Shows "No quizzes found" message
 */
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
            {/* Desktop and mobile header wrapper */}
            <div className='flex w-full h-24 justify-center'>
                <div className="header-content flex w-full md:w-[80%] items-center justify-between px-4 md:px-0">
                    {/* Logo / Home link */}
                    <Link to={ROUTES.HOME} className='flex items-center h-full'>
                        <h1 className="text-4xl font-bold text-white">Quiddle</h1>
                    </Link>
					
                    {/* Desktop navigation menu (hidden on mobile) */}
                    <div className='desktop-menu hidden md:flex justify-center items-center gap-6'>
						
						{/* Desktop Search Bar with suggestions dropdown */}
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
									// Delay hiding suggestions to allow click on suggestion
									setTimeout(() => setShowSuggestions(false), 500);
								}}
								className="px-3 py-2 rounded-l-2xl text-sm text-gray-800 outline-none w-48 lg:w-64 xl:w-80"
							/>
							<button
								type="submit"
								className="bg-purple-700 text-white px-3 py-2 rounded-r-2xl text-sm hover:bg-purple-800">
								Search
							</button>
							
							{/* Suggestions dropdown */}
							{suggestionsDropdown}

						</form>
						
						{/* Desktop navigation links */}
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
								{/* Hub only visible when logged in */}
								{token && (
									<li>
										<Link to={ROUTES.HUB}>Hub</Link>
									</li>
								)}
                            </ul>
                        </div>

                        {/* Desktop: Login/Signup for unauthenticated users */}
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

                        {/* Desktop: User greeting and logout for authenticated users */}
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

                    {/* Mobile hamburger menu toggle (visible only on mobile) */}
                    <div className="mobile-menu md:hidden">
                        <img src={hamburgerIcon} alt="Menu" className="w-12 h-12 invert" onClick={() => setOpen(!open)} />
                    </div>
                </div>
            </div>

            {/* Mobile dropdown menu (animated expand/collapse) */}
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
					
					{/* Mobile navigation links */}
					<Link to={ROUTES.HOME} onClick={() => setOpen(false)} className="block px-4 py-3 text-white">
                        Home
                    </Link>
                    
					<Link to={ROUTES.QUIZBROWSE} onClick={() => setOpen(false)} className="block px-4 py-3 text-white">
                        Browse
                    </Link>
					
					{/* Hub link only visible when logged in */}
					{token && (
						<Link to={ROUTES.HUB} onClick={() => setOpen(false)} className="block px-4 py-3 text-white">
							Hub
						</Link>
					)}

                    {/* Mobile: Login/Signup for unauthenticated users */}
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
					
                    {/* Mobile: User greeting and logout for authenticated users */}
                    {token !== null && token !== undefined && (
                        <>
                            <span className="block px-4 py-3 text-white font-medium">
                                Hi, {userFirstName}! 👋
                            </span>
                            <div
                                className="block px-4 py-3 text-white cursor-pointer"
                                onClick={() => { logout(); navigate(ROUTES.HOME); setOpen(false); }}>
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