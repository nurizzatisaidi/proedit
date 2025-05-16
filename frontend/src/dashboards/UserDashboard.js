import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaMoneyBillWave } from "react-icons/fa";
import "../styles/UserDashboard.css";

function UserDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        const storedId = localStorage.getItem("userId");
        setUsername(storedName || "");
        setUserId(storedId || "");
    }, []);

    useEffect(() => {
        if (userId) {
            // ✅ Safely fetch and parse
            fetch(`http://localhost:8080/api/requests/user/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then(setRequests)
                .catch(() => setRequests([]));

            fetch(`http://localhost:8080/api/projects/user/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then(setProjects)
                .catch(() => setProjects([]));

            fetch(`http://localhost:8080/api/notifications/user/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then(setNotifications)
                .catch(() => setNotifications([]));

            fetch(`http://localhost:8080/api/chats/user/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then(setChats)
                .catch(() => setChats([]));
        }
    }, [userId]);

    const ongoing = projects.filter(p => p.status !== "Completed Payment");
    const pending = requests.filter(r => r.status === "Pending");

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/user-payments" },
        { name: "Notifications", icon: <FaBell />, path: "/user-notifications" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />

                {/* ✅ Top Collaboration Banner */}
                <div className="create-banner">
                    <h3>🚀 Collaborate with Eflix</h3>
                    <button onClick={() => window.location.href = "/user-requests"}>
                        Create Request
                    </button>
                </div>

                {/* ✅ Stats Row */}
                <div className="stats-row">
                    <div className="stat-card light-blue">
                        <h4>Total Projects</h4>
                        <p>{projects.length}</p>
                    </div>
                    <div className="stat-card light-orange">
                        <h4>Pending Requests</h4>
                        <p>{pending.length}</p>
                    </div>
                </div>

                {/* ✅ Ongoing Projects Section */}
                <div className="dashboard-section">
                    <h4>Ongoing Projects</h4>
                    {ongoing.length === 0 ? (
                        <p className="muted">No ongoing projects</p>
                    ) : (
                        ongoing.slice(0, 6).map((proj, i) => (
                            <div
                                className="card clickable"
                                key={i}
                                onClick={() => window.location.href = "/user-projects"}
                            >
                                <strong>{proj.title}</strong>
                            </div>
                        ))
                    )}
                </div>


                {/* ✅ Notifications Section */}
                {/* ✅ Notifications Section */}
                <div className="dashboard-section">
                    <h4>Notifications</h4>
                    {notifications.length === 0 ? (
                        <p className="muted">No new notifications</p>
                    ) : (
                        notifications.slice(0, 6).map((n, i) => {
                            const handleNotificationClick = () => {
                                if (n.type === "chat" && n.relatedId) {
                                    window.location.href = `/user-chat/${n.relatedId}`;
                                } else if (n.type === "request") {
                                    window.location.href = "/user-requests";
                                } else if (n.type === "task" && n.relatedId) {
                                    window.location.href = `/user-projects/${n.relatedId}/progress`;
                                }
                            };

                            return (
                                <div
                                    className="card clickable"
                                    key={i}
                                    onClick={handleNotificationClick}
                                >
                                    <p>{n.message}</p>
                                    <small className="tag">{n.type}</small>
                                </div>
                            );
                        })
                    )}
                </div>



                {/* ✅ Active Chats Section */}
                <div className="dashboard-section">
                    <h4>Active Chats</h4>
                    {chats.length === 0 ? (
                        <p className="muted">No chats</p>
                    ) : (
                        chats.slice(0, 6).map((c, i) => (
                            <div
                                className="card clickable"
                                key={i}
                                onClick={() => window.location.href = `/user-chat/${c.chatId}`}
                            >
                                <strong>{c.projectTitle}</strong>
                            </div>
                        ))
                    )}
                </div>

            </main>
        </div>
    );
}

export default UserDashboard;
