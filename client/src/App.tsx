import { Routes, Route } from "react-router-dom"


import Login from "./pages/Login";
import Home from "./pages/Home";

const App = () => {
  return (
  <>
   <Routes>
    <Route path="/auth/login" element={ <Login /> }  />
    <Route path="/" element={ <Home /> } />
   </Routes>
  </>
  )
}

export default App