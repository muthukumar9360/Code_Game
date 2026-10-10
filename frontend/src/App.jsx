import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import SplashScreen from "./Pages/SplashScreen.jsx";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import RoomLobby from "./Pages/RoomLobby.jsx";
import ContestPage from "./Pages/ContestPage.jsx";
import ResultPage from "./Pages/ResultPage.jsx";
import CreateRoom from "./Pages/CreateRoom.jsx";
import JoinRoom from "./Pages/JoinRoom.jsx";
import Profile from "./Pages/Profile.jsx";
import Problems from "./Pages/Problems.jsx";
import ProblemSolve from "./Pages/ProblemSolve.jsx";
import Leaderboard from "./Pages/Leaderboard.jsx";
import DailyBlitz from "./Pages/DailyBlitz.jsx";
import ContestManager from "./Pages/ContestManager.jsx";

import AdminLogin from "./Admin/AdminLogin.jsx";
import CreateProgram from "./Admin/createprogram.jsx";
import AdminHome from "./Admin/AdminHome.jsx";
import AdminProblems from "./Admin/AdminProblems.jsx";
import AdminUsers from "./Admin/AdminUsers.jsx";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("battlix_theme") || "dark";
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<RoomLobby />} />
        <Route path="/contest/:contestId" element={<ContestPage />} />
        <Route path="/results/:contestId" element={<ResultPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:slug" element={<ProblemSolve />} />
        <Route path="/problem/:slug" element={<ProblemSolve />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/daily-blitz" element={<DailyBlitz />} />
        <Route path="/contest-management" element={<ContestManager />} />
        <Route path="/created-contests" element={<ContestManager />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/createprogram" element={<CreateProgram />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/problems" element={<AdminProblems />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
