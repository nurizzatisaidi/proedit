import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaMoneyBillWave } from "react-icons/fa";
import "../styles/UserDashboard.css";
import { Pie } from "react-chartjs-2";
import { calculateRequestStatusData } from "../utils/clientChartUtils";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);


function UserDashboard() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [totalUnpaidAmount, setTotalUnpaidAmount] = useState(0);
    const [chats, setChats] = useState([]);


    useEffect(() => {
        const storedName = localStorage.getItem("username");
        const storedId = localStorage.getItem("userId");
        setUsername(storedName || "");
        setUserId(storedId || "");
    }, []);

    useEffect(() => {
        if (userId) {
            fetch(`${BASE_URL}/api/requests/user/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then(setRequests)
                .catch(() => setRequests([]));

            fetch(`${BASE_URL}/api/projects/user/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then(setProjects)
                .catch(() => setProjects([]));

            fetch(`${BASE_URL}/api/notifications/user/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then((data) => {
                    const unread = data
                        .filter(n => !n.read)
                        .sort((a, b) => {
                            const aTime = a.timestamp?.seconds || a.timestamp?._seconds || 0;
                            const bTime = b.timestamp?.seconds || b.timestamp?._seconds || 0;
                            return bTime - aTime;
                        })
                        .slice(0, 5);
                    setNotifications(unread);
                })
                .catch(() => setNotifications([]));

            fetch(`${BASE_URL}/api/chats/user/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then(setChats)
                .catch(() => setChats([]));

            fetch(`${BASE_URL}/api/payments/unpaid-total/${userId}`)
                .then(res => res.json())
                .then(data => setTotalUnpaidAmount(data))
                .catch(() => setTotalUnpaidAmount(0));
        }
    }, [userId, BASE_URL]);

    const ongoing = projects.filter(p => p.status !== "Completed Payment");
    const pending = requests.filter(r => r.status === "Pending");

    const requestStatusPieData = calculateRequestStatusData(requests);


    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/user-payments" },
        { name: "Notifications", icon: <FaBell />, path: "/client-notifications" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />

                <div className="content-scroll">
                    {/* Top Collaboration Banner */}
                    <div className="create-banner enhanced-banner">
                        <img src="/StartRequest.png" alt="Start Collaboration" className="banner-icon" />
                        <div className="banner-content">
                            <h3>Collaborate with Eflix now !</h3>
                            <button onClick={() => window.location.href = "/user-requests"}>
                                Create Request
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card light-blue">
                            <h4>Total Projects</h4>
                            <p>{projects.length}</p>
                        </div>
                        <div className="stat-card light-orange">
                            <h4>Pending Requests</h4>
                            <p>{pending.length}</p>
                        </div>
                        <div className="stat-card light-pink">
                            <h4>Outstanding Payments</h4>
                            <p>RM {totalUnpaidAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Ongoing Projects Section */}
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

                    {/* Notifications Section */}
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
                                        window.location.href = `/client-projects/${n.relatedId}/progress`;
                                    } else if (n.type === "payment" && n.relatedId) {
                                        window.location.href = `/user-projects`;
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

                    {/* Active Chats Section */}
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

                    {/* Request Status Pie Chart */}
                    <div className="dashboard-section">
                        <h4>Analytics Graphs</h4>
                        <div className="chart-card chart-full">
                            <h5 className="chart-title">Request Status Overview</h5>
                            <div className="chart-center-wrapper">
                                <Pie data={requestStatusPieData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>


                </div>
                <Footer />
            </main>
        </div>
    );
}

export default UserDashboard;
