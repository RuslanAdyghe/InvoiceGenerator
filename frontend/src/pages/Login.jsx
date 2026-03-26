import { Link } from "react-router-dom";

import logoIcon from "../assets/logo.svg"

import AuthForm from "../components/AuthForm";

function Login() {
  return (
    <div className="h-screen">
      <div className="top-panel bg-gradient-to-tr from-blue-400 to-purple-400 h-[35%] flex items-center justify-center">
        <img src={logoIcon} alt="logo" className="w-48 h-48"/>
      </div>
      <div className="flex flex-col p-10">
        <AuthForm 
          heading ="Welcome Back"
          subheading="Enter your email and password to access your account."
          showConfirmPassword={false}
          buttonName="Login"
        />
        <h3>Don't have an account? <Link to="/signup" className="text-purple-600 font-bold hover:underline">Sign Up</Link></h3>
      </div>
    </div>
  );
}

export default Login