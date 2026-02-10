import React, { useState } from "react";

const Faq = () => {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8 py-20 flex items-center justify-center">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center mx-auto">
        
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

        {/* Right: FAQ*/}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white p-6 border rounded-lg">
            
            <h3 className="text-xl font-bold text-center mb-6 text-gray-800">FAQ</h3>
            
            {/*FAQ 1 */}
            <div className="mb-3">
              <button
                onClick={() => setOpen1(!open1)}
                className="w-full text-left p-3 border-b text-gray-800 flex justify-between"
              >
                <span>Lorem ipsum?</span>
                <span>{open1 ? "-" : "+"}</span>
              </button>
              {open1 && (
                <div className="p-3">
                  <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div>
              <button
                onClick={() => setOpen2(!open2)}
                className="w-full text-left p-3 border-b text-gray-800 flex justify-between"
              >
                <span>Lorem ipsum?</span>
                <span>{open2 ? "-" : "+"}</span>
              </button>
              {open2 && (
                <div className="p-3">
                  <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
