import React, { useState } from "react";
import "./styles/AdminDashboard.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaUser, FaUsers } from "react-icons/fa";

function AdminDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/admin-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/admin-projects" },
        { name: "Chat", icon: <FaComments />, path: "/admin-chat" },
        { name: "Notifications", icon: <FaBell />, path: "/admin-notifications" },
        { name: "Editors", icon: <FaUser />, path: "/admin-editors-list" },
        { name: "Clients", icon: <FaUsers />, path: "/admin-clients-list" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username="Izzati" />
                <section className="overview-section">
                    <div className="card">Total Users: 10</div>
                    <div className="card">Pending Reports: 3</div>
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;
