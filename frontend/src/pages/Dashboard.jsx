import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      const response = await fetch(`http://localhost:3000/auth/user/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();
      setUser(data);
    };

    fetchUserInfo();
  }, []);

  return (
    <div>
      <NavBar />
      <main className="dashboard">
        <h1>Welcome back,</h1>
      </main>


      <h1>THIS IS THE DASHBOARD</h1>
      <button
        className="bg-blue-500 text-white rounded-md px-6 py-3"
        onClick={() => navigate("/create-invoice")}
      >
        Create Invoice Page
      </button>
    </div>
  )
}

export default Dashboard;