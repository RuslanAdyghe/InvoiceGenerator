import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthForm({ heading, subheading, showConfirmPassword, buttonName }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {

    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    if (showConfirmPassword && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div>
      <h1>{heading}</h1>
      <h3>{subheading}</h3>

      <input 
        type="email" 
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 rounded-md p-2 mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-gray-300 rounded-md p-2 mb-4"
      />
      {showConfirmPassword && ( 
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border border-gray-300 rounded-md p-2 mb-4"
        />
      )}
      <button 
        className="bg-blue-500 text-white rounded-md px-4 py-2"
        onClick={handleSubmit}
      >
        {buttonName}
      </button>
    </div>
  )
}

export default AuthForm