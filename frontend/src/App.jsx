import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import RoomLobby from "./Pages/RoomLobby.jsx";
import ContestPage from "./Pages/ContestPage.jsx";
import ResultPage from "./Pages/ResultPage.jsx";
import CreateRoom from "./Pages/CreateRoom.jsx";
import JoinRoom from "./Pages/JoinRoom.jsx";


function App() {
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
