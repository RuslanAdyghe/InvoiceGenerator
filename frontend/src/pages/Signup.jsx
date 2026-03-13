import { Link } from "react-router-dom";

import AuthForm from "../components/AuthForm";

function Signup() {
  return (
    <>
      <div>
        <div>
          <AuthForm
            heading="Create an account"
            subheading="Sign up for a new account"
            showConfirmPassword={true}
            buttonName="Sign Up"
          />
        </div>
      </div>
    </>
  );
}

export default Signup