import type {LoginInfo} from "../components/molecules/login-info/login-info";
import { useState } from "react";

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
      <h1 className="font-bold text-3xl text-center"> Login </h1>
      <div>
        <div >
            <label >Username</label>
            <input
            type="text"
            name="username"
            value={loginInfo.username}
            onChange={handleChange}
            />
        </div>

        <div>
            <label>Password</label>
            <input
            type="password"
            name="password"
            value={loginInfo.password}
            onChange={handleChange}
            />
        </div>

        <button type="submit">Login</button>
      </div>
    </form>
  );
}

export default Login;