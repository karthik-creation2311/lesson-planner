import {Route, Routes} from "react-router-dom";
import './App.css'
import Login from "./pages/Login.jsx";
import LessonPlanner from "./pages/LessonPlanner.jsx";

function App() {

  return (
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/planner" element={<LessonPlanner/>}/>
      </Routes>
  )
}

export default App
