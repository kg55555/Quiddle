// pages/signup.tsx - Basic Quizzle signup
import React, { useState } from "react";
import { Link } from "react-router-dom";

interface FormData {
  fullName: string;
  institution: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    institution: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    // Background
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 lg:p-16 flex items-center justify-center">
      <div className="max-w-4xl w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center"> {/* #1, #2 */}
        
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

        {/* Right: Form card */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            
            {/*Card Title*/}
            <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sign up page
            </h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="eg. John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                <input
                  name="institution"
                  type="text"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="eg. BCIT, UBC, SFU"
                  value={form.institution}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="yourname@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Create Account Button*/}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                disabled
              >
                Create Account
              </button>
            </div>

            {/* Login button */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
              <Link 
                to="/login" 
                className="block w-full py-3 px-6 border-2 border-indigo-600 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all mx-auto max-w-sm"
              >
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
