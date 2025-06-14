// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import UserDashboard from './dashboards/UserDashboard';
import AdminDashboard from "./dashboards/AdminDashboard";
import EditorDashboard from "./dashboards/EditorDashboard";
import ClientList from './Admin/ClientList';
import EditorList from './Admin/EditorList';
import RequestPage from './Client/RequestPage';
import AdminRequestPage from './Admin/AdminRequestPage';
import EditorProjectPage from './Editor/EditorProjectPage';
import AdminProjectPage from './Admin/AdminProjectPage';
import ClientProjectPage from './Client/ClientProjectPage';
import ClientChatList from './Client/ClientChatList';
import ClientMessagePage from './Client/ClientMessagePage';
import EditorChatList from './Editor/EditorChatList';
import AdminChatList from './Admin/AdminChatList';
import EditorMessagePage from './Editor/EditorMessagePage';
import AdminMessagePage from './Admin/AdminMessagePage';
import ProfilePage from './Client/ProfilePage';
import EditorTaskBoard from './Editor/EditorTaskBoard';
import TaskProgressBoard from "./TaskProgressBoard";
import AdminPaymentList from './Admin/AdminPaymentList';
import ClientPaymentList from './Client/ClientPaymentList';
import ClientNotificationList from './Client/ClientNotificationList';
import AdminNotificationList from './Admin/AdminNotificationList';
import EditorNotificationList from './Editor/EditorNotificationList';
import ConnectionStatusBanner from './components/ConnectionStatusProvider';

function App() {
  return (
    <Router>
      {/* This appears globally on all pages */}
      <ConnectionStatusBanner />
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
        <Route path="/editor-projects" element={<EditorProjectPage />} />
        <Route path="/admin-projects" element={<AdminProjectPage />} />
        <Route path="/user-projects" element={<ClientProjectPage />} />
        <Route path="/user-chat-list" element={<ClientChatList />} />
        <Route path="/user-chat/:chatId" element={<ClientMessagePage />} />
        <Route path="/editor-chat-list" element={<EditorChatList />} />
        <Route path="/admin-chat-list" element={<AdminChatList />} />
        <Route path="/editor-chat/:chatId" element={<EditorMessagePage />} />
        <Route path="/admin-chat/:chatId" element={<AdminMessagePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/editor-project-board/:projectId" element={<EditorTaskBoard />} />
        <Route path="/client-projects/:projectId/progress" element={<TaskProgressBoard />} />
        <Route path="/admin-projects/:projectId/progress" element={<TaskProgressBoard />} />
        <Route path="/admin-payments" element={<AdminPaymentList />} />
        <Route path="/user-payments" element={<ClientPaymentList />} />
        <Route path="/client-notifications" element={<ClientNotificationList />} />
        <Route path="/admin-notifications" element={<AdminNotificationList />} />
        <Route path="/editor-notifications" element={<EditorNotificationList />} />
      </Routes>
    </Router>
  );
}

export default App;
