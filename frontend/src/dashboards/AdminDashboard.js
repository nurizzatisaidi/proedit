import React, { useState, useEffect, useCallback } from "react";
import "../styles/AdminDashboard.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
    FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaUser, FaUsers, FaMoneyBillWave
} from "react-icons/fa";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { calculateStatusBarData, calculateRequestPieData, calculateEarningsLineData } from "../utils/adminChartUtils";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement,
    LineElement);

function AdminDashboard() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [adminId, setAdminId] = useState("");
    const [projects, setProjects] = useState([]);
    const [editors, setEditors] = useState([]);
    const [clients, setClients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [productivityFilter, setProductivityFilter] = useState("week");
    const [earningFilter, setEarningFilter] = useState("week");
    const [earnings, setEarnings] = useState(0);
    const [payments, setPayments] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        const storedId = localStorage.getItem("userId");
        if (storedName) setUsername(storedName);
        if (storedId) setAdminId(storedId);
    }, []);

    const fetchAllData = useCallback(async () => {
        const urls = {
            projects: `${BASE_URL}/api/projects/with-payment-status`,
            editors: `${BASE_URL}/users/editors`,
            clients: `${BASE_URL}/users/clients`,
            requests: `${BASE_URL}/api/requests/all`,
            notifications: `${BASE_URL}/api/notifications/user/${adminId}`
        };

        try {
            const safeFetch = async (url) => {
                const res = await fetch(url);
                return res.ok ? res.json() : [];
            };

            const [proj, edit, cli, req, notif] = await Promise.all([
                safeFetch(urls.projects),
                safeFetch(urls.editors),
                safeFetch(urls.clients),
                safeFetch(urls.requests),
                safeFetch(urls.notifications)
            ]);

            setProjects(proj);
            setEditors(edit);
            setClients(cli);
            setRequests(req);

            const unreadNotif = notif
                .filter(n => !n.read)
                .sort((a, b) => {
                    const aTime = a.timestamp?.seconds || a.timestamp?._seconds || 0;
                    const bTime = b.timestamp?.seconds || b.timestamp?._seconds || 0;
                    return bTime - aTime;
                });

            setNotifications(unreadNotif.slice(0, 5));

        } catch (err) {
            console.error("Error loading dashboard data", err);
        }
    }, [adminId, BASE_URL]);

    useEffect(() => {
        if (adminId) {
            fetchAllData();

            fetch(`${BASE_URL}/api/payments/total-earnings`)
                .then(res => res.json())
                .then(data => setEarnings(data.toFixed(2)))
                .catch(err => console.error("Error fetching earnings:", err));

            fetch(`${BASE_URL}/api/payments/all-projects-payments`)
                .then(res => res.json())
                .then(data => setPayments(data))
                .catch(err => console.error("Error fetching payments:", err));
        }
    }, [adminId, fetchAllData, BASE_URL]);

    const earningsLineData = calculateEarningsLineData(payments, earningFilter);

    const pendingRequests = requests.filter(r => r.status === "Pending");
    const completed = projects.filter(p => p.status === "Completed Payment").length;
    const inProgress = projects.length - completed;

    const { pieChartData } = calculateRequestPieData(requests, productivityFilter);
    const statusBarData = calculateStatusBarData(projects);

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/admin-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/admin-projects" },
        { name: "Chat", icon: <FaComments />, path: "/admin-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/admin-notifications" },
        { name: "Editors", icon: <FaUser />, path: "/admin-editors-list" },
        { name: "Clients", icon: <FaUsers />, path: "/admin-clients-list" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/admin-payments" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <div className="content-scroll">
                    <div className="stats-row">
                        <div className="stat-card light-blue"><h4>Ongoing Projects</h4><p>{inProgress}</p></div>
                        <div className="stat-card light-green editor-card"><h4>Editors</h4><p>{editors.length}</p></div>
                        <div className="stat-card light-purple client-card"><h4>Clients</h4><p>{clients.length}</p></div>
                        <div className="stat-card light-orange"><h4>Pending Requests</h4><p>{pendingRequests.length}</p></div>
                        <div className="stat-card light-yellow payment-card">
                            <h4>Total Earnings</h4>
                            <p>RM {earnings}</p>
                        </div>

                    </div>

                    <div className="dashboard-section">
                        <div className="notifications-header">
                            <h4>Recent Notifications</h4>
                            <button className="view-all-btn" onClick={() => window.location.href = "/admin-notifications"}>
                                View All
                            </button>
                        </div>
                        {notifications.length === 0 ? (
                            <p className="muted">No recent activity</p>
                        ) : (
                            <div className="notification-list">
                                {notifications.map((n, i) => {
                                    const handleNotificationClick = () => {
                                        if (n.type === "chat" && n.relatedId) {
                                            window.location.href = `/admin-chat/${n.relatedId}`;
                                        } else if (n.type === "request") {
                                            window.location.href = "/admin-requests";
                                        } else if (n.type === "task" && n.relatedId) {
                                            window.location.href = `/admin-projects`;
                                        } else if (n.type === "payment" && n.relatedId) {
                                            window.location.href = `/admin-payments`;
                                        }
                                    };

                                    return (
                                        <div key={i} className="card clickable" onClick={handleNotificationClick}>
                                            <p>{n.message}</p>
                                            <small className="tag">{n.type}</small><br />
                                            <small style={{ color: "#777" }}>
                                                {new Date((n.timestamp?.seconds || n.timestamp?._seconds || 0) * 1000).toLocaleString()}
                                            </small>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="dashboard-section">
                        <h4>Analytics Overview</h4>
                        <div className="chart-grid">

                            {/* Pie Chart */}
                            <div className="chart-card chart-half">
                                <div className="card-header pie-card-header">
                                    <h5 className="chart-title">Request Processing Summary</h5>
                                    <div className="filter-row">
                                        <label>Filter by:</label>
                                        <select
                                            className="pie-filter-dropdown"
                                            value={productivityFilter}
                                            onChange={(e) => setProductivityFilter(e.target.value)}
                                        >
                                            <option value="week">Past Week</option>
                                            <option value="month">Past Month</option>
                                            <option value="year">Past Year</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pie-chart-wrapper">
                                    <div style={{ maxWidth: "100%", height: "260px" }}>
                                        <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                                    </div>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="chart-card chart-half bar-chart-container">
                                <div className="bar-chart-wrapper">
                                    <h5 className="chart-title">Project Status</h5>
                                    <div className="chart-legend-spacer"></div>
                                    <div className="bar-chart-area">
                                        <Bar
                                            data={statusBarData}
                                            options={{ maintainAspectRatio: false }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Line Chart */}
                            <div className="chart-card chart-full">
                                <div className="card-header">
                                    <h5>Income Over Time</h5>
                                    <div className="filter-row">
                                        <label>Filter by:</label>
                                        <select
                                            className="line-filter-dropdown"
                                            value={earningFilter}
                                            onChange={(e) => setEarningFilter(e.target.value)}
                                        >
                                            <option value="week">Past Week</option>
                                            <option value="month">Past Month</option>
                                            <option value="year">Past Year</option>
                                        </select>
                                    </div>
                                </div>
                                <Line data={earningsLineData} />
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}

export default AdminDashboard;