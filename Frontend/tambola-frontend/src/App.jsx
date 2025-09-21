import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
// import Home from "./pages/Home";
import TambolaRoom from "./pages/TambolaRoom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game/:id" element={<TambolaRoom />} />
        </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;
