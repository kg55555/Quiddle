import Footer from "components/organisms/footer";
import Header from "components/organisms/header";
import MainBG from "/img/pexels-cottonbro-6333728-lowres.jpg"
import React, { useState } from "react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  reverseLayout?: boolean;
}

const TargetIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4"/>
    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="4"/>
    <line x1="50" y1="50" x2="85" y2="15" stroke="currentColor" strokeWidth="4"/>
  </svg>
);

const QuizIcon = ({ size = 96, color = "currentColor" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="1"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
};

const Feature: React.FC<FeatureProps> = ({ icon, title, description, reverseLayout = false }) => (
  <div className={`flex flex-col md:flex-row gap-8 md:items-start items-center ${reverseLayout ? 'md:flex-row-reverse' : ''} md:text-left text-center`}>
    <div className="shrink-0 w-16 md:w-20 h-16 md:h-20 flex items-center justify-center text-black">
      {icon}
    </div>
    <div className="flex flex-col justify-start">
      <h3 className="text-3xl md:text-4xl font-semibold text-black mb-3">{title}</h3>
      <p className="text-xl md:text-2xl text-gray-800 leading-relaxed">{description}</p>
    </div>
  </div>
);
const Home = () => {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-col flex-1">
        <section className="intro-section flex flex-col items-center min-h-screen w-full relative">
          <Header/>
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(" + MainBG + ")", backgroundAttachment: "fixed" }}
          />

          <div className="absolute inset-0 -z-9 bg-white/80" />

          <div className="flex-1 flex flex-col justify-center items-center md:w-[80%]">
            
            <div className="flex flex-col md:w-[60%]">          
                  {/* Left: Welcome */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Welcome to
                </h1>
                <h2 className="text-6xl lg:text-9xl font-black text-gray-900 mb-6">
                  Quiddle
                </h2>
                <p className="text-lg lg:text-xl text-gray-600 max-w-lg">
                  Join thousands of students mastering their courses!
                </p>
              </div>

            </div>

            <div className="mb-30 flex w-full justify-center mt-20">
              <div className="submit-button w-fit bg-white border-4 border-purple-700 text-purple-600 font-bold text-2xl rounded-2xl md:px-7 md:py-3 md:ml-4">
                <p>Get Started</p>
              </div>
            </div>


          </div>

          <div className="flex flex-col gap-10 px-6 py-10 w-3/5 mx-auto mb-10">
          <Feature
            icon={< QuizIcon />}
            title="What is Quiddle?"
            description="Quiddle is a free quizzing website built for students.
                      It is a site where students can create and share quizzes on the same subjects and courses,
                      helping not only yourself, but other students in the same program!"
          />
          </div>

          <div className="flex flex-col gap-10 px-6 py-10 w-3/5 mx-auto mb-40">
          <Feature
            icon={<TargetIcon />}
            title="Our Goal"
            description="We aim to provide unversity or high school level students a convenient platform to study and learn from one another;
            A way to allow students of the same program to study together efficiently and effectively."
            reverseLayout
          />
          </div>


          {/*FAQ*/}
          <div className="w-full lg:w-1/2 max-w-md ">
            <h1 className="flex w-full justify-center font-bold text-2xl">Frequently Asked Questions</h1>

            <div className="bg-white p-6 border rounded-lg mb-10">
              
              <h3 className="text-xl font-bold text-center mb-6 text-gray-800">FAQ</h3>
              
              {/*FAQ 1 */}
              <div className="mb-3">
                <button
                  onClick={() => setOpen1(!open1)}
                  className="w-full text-left p-3 border-b text-gray-800 flex justify-between "
                >
                  <span>How do I access quizzes?</span>
                  <span>{open1 ? "-" : "+"}</span>
                </button >
                
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    open1 ? "max-h-40 opacity-100 p-3" : "max-h-0 opacity-0"}`}>
                    <p className="text-gray-600">Simply, after logging in, locate the "Quiz" button 
                      at the top right of the screen and click it. After it redirects you to our Quiz page, 
                      there will be a variety of quizzes you can browse!
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
                    Each account can access any quizzes 15 times for free daily, or unlimited access with our premium accounts!
                    </p>
                </div>

              </div>
            </div>
          </div>
        </section >
        <section>

        </section>
        <section>

        </section>
      </main>
      <Footer/>
    </div>
  );
}

export default Home;
