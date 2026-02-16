import Footer from "components/organisms/footer";
import Header from "components/organisms/header";
import MainBG from "/img/pexels-cottonbro-6333728-lowres.jpg"
import React, { useState } from "react";
const Home = () => {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  return (
    <>

    <main className="flex flex-col">
      <section className="intro-section flex flex-col items-center h-screen w-full">
        <Header/>
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: "url(" + MainBG + ")" }}
          />

          <div className="absolute inset-0 -z-9 bg-white/80" />

        <div className="flex-1 flex flex-col justify-center items-center md:w-[80%]">
          
          <div className="flex flex-col md:w-[60%]">          
                {/* Left: Welcome */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Welcome to
              </h1>
              <h2 className="text-6xl lg:text-7xl font-black text-gray-900 mb-6">
                Quiddle
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-lg">
                Join thousands of students mastering their courses!
              </p>
            </div>

          </div>

          <div className="flex w-full justify-center mt-20">
            <div className="submit-button w-fit bg-purple-700 text-white text-2xl rounded-2xl md:px-5 md:py-3 md:ml-4">
              <p>Get Started</p>
            </div>
          </div>


        </div>

        {/*FAQ*/}
        <div className="w-full lg:w-1/2 max-w-md ">
          <h1 className="flex w-full justify-center font-bold text-2xl">Frequently Asked Questions</h1>

          <div className="bg-white p-6 border rounded-lg ">
            
            <h3 className="text-xl font-bold text-center mb-6 text-gray-800">FAQ</h3>
            
            {/*FAQ 1 */}
            <div className="mb-3">
              <button
                onClick={() => setOpen1(!open1)}
                className="w-full text-left p-3 border-b text-gray-800 flex justify-between "
              >
                <span>What is Quiddle?</span>
                <span>{open1 ? "-" : "+"}</span>
              </button >
              
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  open1 ? "max-h-40 opacity-100 p-3" : "max-h-0 opacity-0"}`}>
                  <p className="text-gray-600">Quiddle is a free quizzing website built for students.
                    It is a site where students can create and share quizzes on the same subjects and courses,
                    helping not only yourself, but other students in the same program!
                  </p>
                </div>

            </div>

            {/* FAQ 2 */}
            <div>
              <button
                onClick={() => setOpen2(!open2)}
                className="w-full text-left p-3 border-b text-gray-800 flex justify-between"
              >
                <span>How does it work?</span>
                <span>{open2 ? "-" : "+"}</span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  open2 ? "max-h-40 opacity-100 p-3" : "max-h-0 opacity-0"}`}>
                  <p className="text-gray-600">Once you have created an account, simply sign in and browse or create quzzies. 
                  Each account can access quizzes 15 times for free daily, or unlimited access with our premium accounts!
                  </p>
              </div>

            </div>
          </div>
        </div>
        <div className = "mt-10">

        </div>
      </section >
      <section>

      </section>
      <section>

      </section>
    </main>
    <Footer/>
    </>
  );
}

export default Home;
