import React, { useState, useEffect } from "react";
import "../styles/UserDashboard.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell } from "react-icons/fa";

function UserDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("user");

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }
    })

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/user-notifications" },
    ];

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />

            {/* Main Content */}
            <main className="main-content">
                <Header username={username} />

                <section className="overview-section">
                    <div className="card collaborate">
                        <h4>Collaborate with Eflix now!</h4>
                        <button className="btn-create-request">Create Request</button>
                    </div>
                    <div className="card pending-request">
                        <h4>Pending Request</h4>
                        <p>2</p>
                    </div>
                    <div className="card total-projects">
                        <h4>Total Projects</h4>
                        <p>8</p>
                    </div>
                </section>

                <section className="projects-section">
                    <h4>My Projects</h4>
                    <ul className="projects-list">
                        <li className="project-item">PaleoScan Tutorial Videos</li>
                        <li className="project-item">What is Machine Learning</li>
                        <li className="project-item">Why Agile is a great Method</li>
                    </ul>
                </section>

                <section className="notifications-section">
                    <h4>Notifications</h4>
                    <ul className="notifications-list">
                        <li>Message from Harris Saidi - 5 min ago</li>
                        <li>Message from Admin - Yesterday, 22 May 2024</li>
                        <li>Request Accepted - 17 May 2024</li>
                    </ul>
                </section>

                <section className="chat-section">
                    <h4>Chat</h4>
                    <ul className="chat-list">
                        <li className="chat-item">PaleoScan Tutorial Videos</li>
                        <li className="chat-item">What is Machine Learning</li>
                        <li className="chat-item">Why Agile is a great Method</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}

export default UserDashboard;
