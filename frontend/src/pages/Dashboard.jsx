import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
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