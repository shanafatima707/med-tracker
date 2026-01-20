import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome'; // or Home, Landing, etc.
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddMedicine from './pages/AddMedicine';
// import AddMedicine from './pages/AddMedicine'; // if you added it

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Routes>
        <Route path="/" element={<Welcome />} /> {/* Home */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/add-medicine" element={<AddMedicine />} /> 
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </div>
  );
}

export default App;