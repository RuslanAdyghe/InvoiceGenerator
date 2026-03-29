import { Link } from "react-router-dom";

import AuthForm from "../components/AuthForm";

import logoIcon from "../assets/logo.svg"
import cloudIcon from "../assets/cloud.svg"

function Signup() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100">
      <div className="lg:flex bg-white lg:shadow-lg lg:rounded-3xl lg:overflow-hidden lg:w-[1200px] lg:justify-between lg:min-h-[800px] lg:p-3">
        <div className="top-panel bg-gradient-to-tr from-blue-400 to-purple-400 h-[371px] flex items-center justify-center lg:h-auto lg:w-[50%] lg:rounded-2xl lg:relative lg:overflow-hidden">
          <img src={logoIcon} alt="logo" className="w-48 h-48 lg:w-[250px] lg:h-[250px]"/>
          <img 
            src={cloudIcon} 
            alt="cloud" 
            className="hidden lg:block absolute top-[10%] right-[-30px] w-40"
          />
          <img 
            src={cloudIcon} 
            alt="cloud" 
            className="hidden lg:block absolute bottom-[10%] left-[-30px] w-40"
          />
          <img 
            src={cloudIcon} 
            alt="cloud" 
            className="hidden lg:block absolute top-[20%] left-[5%] w-40"
          />
        </div>
        <div className="flex flex-col flex-1 p-10 lg:justify-center lg:items-center">
          <AuthForm
            heading="Create an account"
            subheading="Sign up for a new account"
            showConfirmPassword={true}
            buttonName="Sign Up"
          />
          <h3 className="self-start ml-[62px]">Already have an account? <Link to="/login" className="text-purple-600 font-bold hover:underline">Login</Link></h3>
        </div>
      </div>
    </div>
  );
}

export default Signup