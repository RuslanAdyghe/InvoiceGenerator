import { Link } from "react-router-dom";

import AuthForm from "../components/AuthForm";

import logoIcon from "../assets/logo.svg"

function Signup() {
  return (
    <>
      <div className="h-screen">
        <div className="top-panel bg-gradient-to-tr from-blue-400 to-purple-400 h-[35%] flex items-center justify-center">
          <img src={logoIcon} alt="logo" className="w-48 h-48"/>
        </div>
        <div className="flex flex-col p-10">
          <AuthForm
            heading="Create an account"
            subheading="Sign up for a new account"
            showConfirmPassword={true}
            buttonName="Sign Up"
          />
          <h3>Already have an account? <Link to="/login" className="text-purple-600 font-bold hover:underline">Login</Link></h3>
        </div>
      </div>
    </>
  );
}

export default Signup