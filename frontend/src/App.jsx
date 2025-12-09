import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Pages/Login.jsx'
import Home from './Pages/Home.jsx'
import Signup from './Pages/Signup.jsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Home/>
      <Login/> */}
      <Signup/>
    </>
  )
}

export default App
