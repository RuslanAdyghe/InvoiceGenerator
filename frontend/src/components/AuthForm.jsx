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
    <div className="flex flex-col w-full max-w-sm">
      <h1 className="text-center text-4xl font-bold mb-4">{heading}</h1>
      <h3 className="text-center text-sm text-gray-400 mb-6">{subheading}</h3>
      <label className="font-medium text-gray-700 mb-1">Email</label>
      <input 
        type="email" 
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 rounded-md p-2 mb-4 w-full"
      />
      {showConfirmPassword && ( 
      <div className="flex flex-col mb-5">
        <label className="font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      )}
      <label className="font-medium text-gray-700 mb-1">Password</label>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`border border-gray-300 rounded-md p-2 w-full ${showConfirmPassword ? "mb-5" : "mb-10"}`}
      />
      {showConfirmPassword && ( 
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border border-gray-300 rounded-md p-2 mb-4 w-full"
        />
      )}
      <button 
        className={`bg-purple-600 text-white text-lg rounded-md px-4 py-2 w-full ${showConfirmPassword ? "mb-5" : "mb-20"}`}
        onClick={handleSubmit}
      >
        {buttonName}
      </button>
    </div>
  )
}

export default AuthForm