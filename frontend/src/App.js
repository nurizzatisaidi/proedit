// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import UserDashboard from './dashboards/UserDashboard';
import AdminDashboard from "./dashboards/AdminDashboard";
import EditorDashboard from "./dashboards/EditorDashboard";
import ClientList from './ClientList';
import EditorList from './EditorList';
import RequestPage from './RequestPage';
import AdminRequestPage from './AdminRequestPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/editor-dashboard" element={<EditorDashboard />} />
        <Route path="/admin-clients-list" element={<ClientList />} />
        <Route path="/admin-editors-list" element={<EditorList />} />
        <Route path="/user-requests" element={<RequestPage />} />
        <Route path="/admin-requests" element={<AdminRequestPage />} />

      </Routes>
    </Router>
  );
}

export default App;
