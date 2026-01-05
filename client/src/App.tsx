import { Routes, Route } from "react-router-dom"


import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/admin/Dashboard";
import UploadArchiveItem from "./pages/admin/UploadArchiveItem";

const App = () => {
  return (
  <>
   <Routes>
    <Route path="/auth/login" element={ <Login /> }  />
    <Route path="/" element={ <Home /> } />
    <Route path="/admin/dashboard" element={ <Dashboard /> }/>
    <Route path="/archive-items/upload" element={ <UploadArchiveItem /> }/>
   </Routes>
  </>
  )
}

export default App