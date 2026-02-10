import React from 'react';

interface FooterProps {
    year?: number;
}

const Footer: React.FC<FooterProps> = () => {
    return (
        <footer className="footer flex w-full h-auto flex-col items-center justify-center bg-gray-800 text-white p-8">
            <div className="footer-content flex flex-col md:flex-row w-full md:w-[80%] justify-between items-center">
                <div className='footer-logo h-full flex-col'>
                    <h1 className='text-4xl font-bold text-center mb-2 md:mb-4 md:text-left'>Quiddle</h1>
                    <p className='text-lg'>The best platform for creating and taking quizzes.</p>
                </div>

                <div className='flex gap-48 pt-8 md:pt-0 md:gap-0'>
                <div className="footer-section mr-16">
                    <h3 className='text-xl font-semibold mb-4'>About</h3>
                    <ul className='text-lg'>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#careers">Careers</a></li>
                        <li><a href="#press">Press</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3 className='text-xl font-semibold mb-4'>Support</h3>
                    <ul className='text-lg'>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                </div>

            </div>

            <div className="footer-bottom mt-8">
                <p>&copy; {new Date().getFullYear()} Quiddle. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;