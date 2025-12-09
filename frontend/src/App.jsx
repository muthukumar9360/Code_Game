import {BrowserRouter , Route, Routes} from 'react-router-dom'
import Home from './Home.jsx'
import Login from './Login.jsx'
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
