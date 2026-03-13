import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthForm({ heading, subheading, showConfirmPassword, buttonName }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleSubmit = async () => {

    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    if (showConfirmPassword && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const endpoint = showConfirmPassword ? "/auth/signup" : "/auth/login";
      const body = showConfirmPassword
        ? { email, password, companyName }
        : { email, password };

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), 
      });

      const data = await response.json(); 

      if (!response.ok) {
        alert(data.error || "Something went wrong");  
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert(error.message || "Failed to connect to server");
      return;
    }
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
      {showConfirmPassword && ( 
        <input
          type="text"
          placeholder="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="border border-gray-300 rounded-md p-2 mb-4"
        />
      )}
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