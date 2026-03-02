import type {LoginInfo} from "../components/molecules/login-info/login-info";
import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [loginInfo, setLoginInfo] = useState<LoginInfo>({
    id: 0,
    username: "",
    password: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setLoginInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    console.log("Logging in with:", loginInfo);
  }

  return (
    <form onSubmit={handleSubmit}>
       {/* Right: Form card */}
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            
            {/*Card Title*/}
            <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Login page
            </h3>
            <div>
              <div className = "mt-20">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                  type="text"
                  name="username"
                  value={loginInfo.username}
                  onChange={handleChange}
                  className="w-96"
                  placeholder= "Enter your username"
                  />
              </div>

              <div>
                  <label className="mt-4 block text-sm font-medium text-gray-700 mb-2 w-full">Password</label>
                  <input
                  type="password"
                  name="password"
                  value={loginInfo.password}
                  onChange={handleChange}
                  className="w-96"
                  placeholder = "Enter your password"
                  />
              </div>
              <p className="mt-1 text-sm text-gray-600 mb-3 text-right">Forgot Password?</p>
              <Link 
                //for now, assume valid username and password
                to="/profile" 
                className="text-center mt-12 block w-full py-3 px-6 border-2 border-indigo-600 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all mx-auto max-w-sm"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
    </form>
  );
}

export default Login;