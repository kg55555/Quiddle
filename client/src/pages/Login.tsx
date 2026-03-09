import type {LoginInfo} from "../components/molecules/login-info/login-info";
import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    id: 0,
    email: "",
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

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginInfo.email,
          password: loginInfo.password,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        alert('Invalid email or password.');
      } else if (data.success) {
        localStorage.setItem('userId', String(data.userId));
        localStorage.setItem('fullName', data.fullName);
        window.location.href = '/';
      } else {
        alert(data.error || 'Login failed');
      }

    } catch (err) {
      alert('Could not connect to server. Make sure backend is running.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-3xl p-8 shadow-xl">

        {/*Card Title*/}
        <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Login
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={loginInfo.email}
              onChange={handleChange}
              className="w-96 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 w-full">Password</label>
            <input
              type="password"
              name="password"
              value={loginInfo.password}
              onChange={handleChange}
              className="w-96 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          <p className="mt-1 text-sm text-gray-600 mb-3 text-right">Forgot Password?</p>

          <button
            type="submit"
            className="text-center mt-12 block w-full py-3 px-6 border-2 border-indigo-600 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all mx-auto max-w-sm"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;
