import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Faq from "../pages/faq";


function App() {
  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
  );
}

export default App;
