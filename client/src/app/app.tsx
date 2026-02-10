import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import QuizTake from "../pages/QuizTake";
import Signup from "../pages/signup";

function App() {
  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<QuizTake />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
  );
}

export default App;
