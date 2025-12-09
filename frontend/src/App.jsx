import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import RoomLobby from "./Pages/RoomLobby.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Home />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
