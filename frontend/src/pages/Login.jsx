import { Link } from "react-router-dom";

import AuthForm from "../components/AuthForm";

function Login() {
  return (
    <div>
      <div>
        <AuthForm 
          heading ="Welcome back"
          subheading="Login to your account"
          showConfirmPassword={false}
          buttonName="Login"
        />
        <h3>Don't have an account <Link to="/signup" className="text-blue-500 hover:underline">sign up now!</Link></h3>

      </div>
    </div>
  );
}

export default Login