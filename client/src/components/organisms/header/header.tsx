import React, { useState } from 'react';
import { ROUTES } from '../../../utils/paths';
import { Link, useNavigate } from 'react-router-dom';
import hamburgerIcon from '/icons/hamburger.svg';
import { useAuth } from '../../../context/AuthContext';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

const Header: React.FC<HeaderProps> = () => {
    const [open, setOpen] = useState(false)
    const { token, logout, userFirstName } = useAuth();
    const navigate = useNavigate();

    return (
        <>
        <header className="header sticky flex top-0 flex-col w-full bg-purple-500">
            <div className='flex w-full h-24 justify-center'>
                <div className="header-content flex w-full md:w-[80%] items-center justify-between px-4 md:px-0">
                    <Link to={ROUTES.HOME} className='flex items-center h-full'>
                        <h1 className="text-4xl font-bold text-white">Quiddle</h1>
                    </Link>
                    <div className='desktop-menu hidden md:flex justify-center items-center'>
                        <div>
                            <ul className="flex space-x-4 text-white">
                                <li>
                                    <Link to={ROUTES.HOME}>Home</Link>
                                </li>
                                <li>
                                    <Link to={ROUTES.QUIZCREATE}>Create Quiz</Link>
                                </li>
                                <li>
                                    <Link to={ROUTES.PROFILE}>Profile</Link>
                                </li>
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
                    <Link to={ROUTES.HOME} className="block px-4 py-3 text-white">
                        Home
                    </Link>
                    <Link to={ROUTES.QUIZCREATE} className="block px-4 py-3 text-white">
                        Create Quiz
                    </Link>
                    {/*login token doesnt exist*/}
                    {(token === null || token === undefined) && (
                        <>
                            <Link to={ROUTES.LOGIN} className="block px-4 py-3 text-white">
                                Login
                            </Link>
                            <Link to={ROUTES.SIGNUP} className="block px-4 py-3 text-white">
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
                                onClick={() => { logout(); navigate(ROUTES.HOME); }}>
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
