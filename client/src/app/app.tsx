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


function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
            <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizTake /></ProtectedRoute>} />
            <Route path="/quizcreate" element={<ProtectedRoute><QuizCreate /></ProtectedRoute>} />
            <Route path="/quizedit/:quizId" element={<ProtectedRoute><QuizCreate /></ProtectedRoute>} />

            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}

export default App;
