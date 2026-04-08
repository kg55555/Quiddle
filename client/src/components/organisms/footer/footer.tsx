/**
 * Footer Component
 * 
 * A reusable footer component that displays company branding, navigation links, and copyright information.
 * The footer features a responsive layout that adapts from mobile to desktop, with the logo and tagline
 * on one side and navigation sections (About, Support) on the other.
 * 
 * The component automatically includes the current year in the copyright notice.
 * 
 * @component
 * @example
 * // Basic usage - no props required
 * <Footer />
 * 
 * @example
 * // Used in a layout wrapper
 * <div className="flex flex-col min-h-screen">
 *   <main>Page content here</main>
 *   <Footer />
 * </div>
 * 
 * @typedef {Object} FooterProps
 * @property {number} [year] - Optional custom year for copyright notice (currently unused,
 *                             defaults to current year via new Date().getFullYear())
 * 
 * @returns {JSX.Element} A footer element with logo, navigation links, and copyright text
 */
import React from 'react';

/**
 * Props interface for Footer component
 * 
 * @interface FooterProps
 * @property {number} [year] - Optional year parameter for potential future use in copyright notice.
 *                             Currently not utilized; the component uses new Date().getFullYear()
 *                             to dynamically display the current year.
 */
interface FooterProps {
    year?: number;
}

/**
 * Footer - Application footer with branding, navigation, and copyright
 * 
 * Displays a multi-section footer layout with:
 * - Company logo and tagline (Quiddle branding)
 * - Two navigation sections: About and Support with relevant links
 * - Responsive design that stacks vertically on mobile and horizontally on desktop
 * - Current year automatically included in copyright notice
 * 
 * Styling features:
 * - Dark gray background (bg-gray-800) with white text
 * - Responsive layout: full width on mobile, 80% width on desktop (md:w-[80%])
 * - Mobile: vertical stack with gap-48, Desktop: horizontal layout with gap-0
 * - Centered alignment on mobile, spaced between on desktop
 * - Generous padding for visual spacing
 * 
 * @param {FooterProps} props - Component props (currently no props are utilized)
 * @returns {JSX.Element} A footer element containing branding, navigation links, and copyright info
 */
const Footer: React.FC<FooterProps> = () => {
    return (
        <footer className="footer flex w-full h-auto flex-col items-center justify-center bg-gray-800 text-white p-8">
            {/* Main content container with responsive layout */}
            <div className="footer-content flex flex-col md:flex-row w-full md:w-[80%] justify-between items-center">
                
                {/* Logo and tagline section */}
                <div className='footer-logo h-full flex-col'>
                    <h1 className='text-4xl font-bold text-center mb-2 md:mb-4 md:text-left'>
                        Quiddle
                    </h1>
                    <p className='text-lg'>
                        The best platform for creating and taking quizzes.
                    </p>
                </div>

                {/* Navigation sections container */}
                <div className='flex gap-48 pt-8 md:pt-0 md:gap-0'>
                    
                    {/* About section with links */}
                    <div className="footer-section mr-16">
                        <h3 className='text-xl font-semibold mb-4'>
                            About
                        </h3>
                        <ul className='text-lg'>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#careers">Careers</a></li>
                            <li><a href="#press">Press</a></li>
                        </ul>
                    </div>

                    {/* Support section with links */}
                    <div className="footer-section">
                        <h3 className='text-xl font-semibold mb-4'>
                            Support
                        </h3>
                        <ul className='text-lg'>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer bottom with copyright notice */}
            <div className="footer-bottom mt-8">
                <p>&copy; {new Date().getFullYear()} Quiddle. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;