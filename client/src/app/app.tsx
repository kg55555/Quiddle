/**
 * App Component
 * 
 * Main routing configuration for the quiz application.
 * Defines all application routes including public routes (home, authentication, browse)
 * and protected routes (profile, quiz creation/taking, hub).
 * 
 * Protected routes are wrapped with ProtectedRoute component to ensure
 * only authenticated users can access them.
 * 
 * @returns {JSX.Element} Routes component containing all application routes
 */
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import QuizTake from "../pages/QuizTake";
import QuizCreate from "../pages/QuizCreate";
import Signup from "../pages/signup";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import Hub from "../pages/Hub";
import VerifyEmail from "../pages/VerifyEmail";
import ProtectedRoute from "../components/organisms/protectedroute/ProtectedRoute";
import QuizSearch from '../pages/QuizSearch';
import QuizBrowse from '../pages/QuizBrowse';

/**
 * App - Main application router component
 * 
 * Configures routing for the entire application with the following route structure:
 * - Public Routes: Home, Signup, Login, Email Verification, Quiz Search, Browse
 * - Protected Routes: User Profile, Hub, Quiz Taking, Quiz Creation, Quiz Editing
 * - Fallback: 404 Not Found page for undefined routes
 * 
 * @returns {JSX.Element} Routes containing all application paths and their corresponding components
 */
function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
			<Route path="/quizsearch" element={<QuizSearch />} />
            <Route path="/browse" element={<QuizBrowse />} />

            {/* Protected Routes - Require authentication */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
            <Route path="/quizTake/:quizId" element={<ProtectedRoute><QuizTake /></ProtectedRoute>} />
            <Route path="/quizcreate" element={<ProtectedRoute><QuizCreate /></ProtectedRoute>} />
            <Route path="/quizedit/:quizId" element={<ProtectedRoute><QuizCreate /></ProtectedRoute>} />
            
            {/* Fallback route for undefined paths */}
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}

export default App;