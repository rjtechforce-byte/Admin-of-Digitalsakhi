import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminBlockUsers from "./Pages/AdminBlockUsers";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/block/:block" element={<AdminBlockUsers />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
