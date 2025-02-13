// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import UserDashboard from './UserDashboard';
import AdminDashboard from "./AdminDashboard";
import ClientList from './ClientList';
import EditorList from './EditorList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-clients-list" element={<ClientList />} />
        <Route path="/admin-editors-list" element={<EditorList />} />

      </Routes>
    </Router>
  );
}
//testing izzati
export default App;
