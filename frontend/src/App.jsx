import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import SplashScreen from "./Pages/SplashScreen.jsx";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import RoomLobby from "./Pages/RoomLobby.jsx";
import ContestPage from "./Pages/ContestPage.jsx";
import ResultPage from "./Pages/ResultPage.jsx";
import CreateRoom from "./Pages/CreateRoom.jsx";
import JoinRoom from "./Pages/JoinRoom.jsx";

import AdminLogin from "./Admin/AdminLogin.jsx";
import CreateProgram from "./Admin/createprogram.jsx";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      {loading ? (
        <SplashScreen onFinish={() => setLoading(false)} />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<RoomLobby />} />
          <Route path="/contest/:contestId" element={<ContestPage />} />
          <Route path="/results/:contestId" element={<ResultPage />} />

          <Route path="/Admin/login" element={<AdminLogin/>} />
          <Route path="/Admin/createprogram" element={<CreateProgram/>} />

        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
