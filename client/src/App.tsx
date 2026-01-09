import { Routes, Route } from "react-router-dom"


import Login from "./pages/admin/Login";
import Home from "./pages/public/Home";
import Dashboard from "./pages/admin/Dashboard";
import UploadArchiveItem from "./pages/admin/UploadArchiveItem";
import CreateCollection from "./pages/admin/CreateCollection";
import ArchiveItemDetails from "./pages/public/ArchiveItemDetails";
import Archives from "./pages/public/Archives";
import Collections from "./pages/public/Collections";

const App = () => {
  return (
  <>
   <Routes>
    <Route path="/auth/login" element={ <Login /> }  />
    <Route path="/" element={ <Home /> } />
    <Route path="/admin/dashboard" element={ <Dashboard /> }/>
    <Route path="/archive-items/upload" element={ <UploadArchiveItem /> }/>
    <Route path="/collections/create" element={ < CreateCollection/> }/>
   <Route path="/archive-items/:id" element={ <ArchiveItemDetails /> }/>
   <Route path="/archive-items" element={ <Archives /> }/>
   <Route path="/collections" element={ <Collections /> }/>
   </Routes>
  </>
  )
}

export default App