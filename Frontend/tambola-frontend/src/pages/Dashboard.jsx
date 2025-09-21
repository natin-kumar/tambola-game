import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");

//   const handleCreate = async () => {
//     try {
//       const res = await API.post("/game/create");
//       navigate(`/game/${res.data.game._id}`); // go to TambolaRoom page
//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to create game");
//     }
//   };

    const handleCreate = async () => {
  try {
    // Mock a new game ID
    const mockGameId = Math.floor(Math.random() * 1000000).toString();
    
    // Navigate to the TambolaRoom page
    navigate(`/game/${mockGameId}`);
  } catch (err) {
    alert("Failed to create game");
  }
};
        

  const handleJoin = async () => {
    if (!gameId) return alert("Enter a valid Game ID");
    try {
      await API.post(`/game/${gameId}/join`);
      navigate(`/game/${gameId}`); // go to TambolaRoom page
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join game");
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Header / Navbar */}
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Tambola Game</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user.username}</span>
          <button
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 bg-gray-50">
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 justify-center mb-8">
          <button
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow hover:bg-green-600"
            onClick={handleCreate}
          >
            Create Room
          </button>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Enter Game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded w-40"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleJoin}
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Rules Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Game Rules</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Each player gets a Tambola ticket of 3x9 grid.</li>
            <li>Numbers are called randomly by the host.</li>
            <li>Mark the numbers on your ticket as they are called.</li>
            <li>
              <strong>Claiming Prizes:</strong> Click the corresponding prize
              button when you have completed the pattern:
              <ul className="list-decimal list-inside ml-5 space-y-1 mt-1">
                <li>
                  <strong>Early Five:</strong> First 5 numbers marked.
                </li>
                <li>
                  <strong>Top Row:</strong> Complete the top row.
                </li>
                <li>
                  <strong>Middle Row:</strong> Complete the middle row.
                </li>
                <li>
                  <strong>Bottom Row:</strong> Complete the bottom row.
                </li>
                <li>
                  <strong>All Corners:</strong> All four corner numbers marked.
                </li>
                <li>
                  <strong>Full House:</strong> Complete all numbers on your
                  ticket.
                </li>
              </ul>
            </li>
            <li>You need to click the prize button manually to claim it.</li>
            <li>
              If you don’t click when the pattern is complete,{" "}
              <strong>no points</strong> are granted.
            </li>
            <li>
              Each claimed pattern gives <strong>100 points</strong>.
            </li>
            <li>The host will verify the claim before confirming the win.</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 mt-auto">
        <p className="text-gray-700">
          &copy; 2025 Tambola Game. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
