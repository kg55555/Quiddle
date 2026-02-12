import React, { useState } from 'react';
import { ROUTES } from '../../../utils/paths';
import { Link } from 'react-router-dom';
import hamburgerIcon from '/icons/hamburger.svg';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

const Header: React.FC<HeaderProps> = () => {
    const [open, setOpen] = useState(false)

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
                                <li>Features</li>
                                <li>About</li>
                            </ul>
                        </div>

                        <Link to ={ROUTES.SIGNUP} 
                            className="sign-in-button bg-purple-700 text-white rounded-2xl md:px-5 md:py-3 md:ml-4">
                            Sign Up
                        </Link>
                    </div>
                    <div className="mobile-menu md:hidden">
                        <img src={hamburgerIcon} alt="Menu" className="w-12 h-12 invert" onClick={() => setOpen(!open)} />
                    </div>
                </div>
            </div>

            <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out
            ${open ? "max-h-96" : "max-h-0"}`}>
                <nav className="bg-purple-700 border-t border-gray-700">
                    <Link to={ROUTES.HOME} className="block px-4 py-3 text-white">
                        Home
                    </Link>
                    <Link to={ROUTES.QUIZ} className="block px-4 py-3 text-white">
                        Quiz
                    </Link>
                </nav>
            </div>
        </header>

        </>
    );
};

export default Header;