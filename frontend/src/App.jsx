import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useSelector } from "react-redux";

import Curing from "./components/Curing/Curing";
import Casting from "./components/Casting/Casting";
import Waterproofing from "./components/WaterProofing/waterproofing";  // ← renamed to PascalCase
import BrickWork from "./components/Brickswork/BrickWork";
import ElectricalWork from "./components/Electrical/ElectricalWork";


///// labour attendance

import Attendance from "./components/LabourForm/Attendance";

import LabourAttendance from "./components/LabourAttendance/LabourAttendance";

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="curing" element={<Curing />} />
          <Route path="casting" element={<Casting />} />
          <Route path="waterproofing" element={<Waterproofing />} /> 
          <Route path="waterproofing" element={< BrickWork/>} /> 
          <Route path="Electrical" element={< ElectricalWork/>} /> 
          <Route path="Attendance" element={< Attendance/>} /> 
          <Route path="labour-Attendance" element={< LabourAttendance/>} /> 
    

        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;