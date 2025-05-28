import React, { useState, useEffect, useCallback } from "react";
import "../styles/AdminDashboard.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
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
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


function AdminDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [adminId, setAdminId] = useState("");

    const [projects, setProjects] = useState([]);
    const [editors, setEditors] = useState([]);
    const [clients, setClients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [productivityFilter, setProductivityFilter] = useState("week");
    const [filteredRequestCounts, setFilteredRequestCounts] = useState({});

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        const storedId = localStorage.getItem("userId");
        if (storedName) setUsername(storedName);
        if (storedId) setAdminId(storedId);
    }, []);

    // Stable fetchAllData so it doesn't warn in CI
    const fetchAllData = useCallback(async () => {
        const urls = {
            projects: "http://localhost:8080/api/projects/with-payment-status",
            editors: "http://localhost:8080/users/editors",
            clients: "http://localhost:8080/users/clients",
            requests: "http://localhost:8080/api/requests/all",
            notifications: `http://localhost:8080/api/notifications/user/${adminId}`
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

            const now = new Date();
            const getTimeBoundary = (filter) => {
                const d = new Date(now);
                if (filter === "week") d.setDate(d.getDate() - 7);
                else if (filter === "month") d.setMonth(d.getMonth() - 1);
                else if (filter === "year") d.setFullYear(d.getFullYear() - 1);
                return d;
            };

            const boundaryDate = getTimeBoundary(productivityFilter);

            const filteredRequests = req.filter(r => {
                let requestDate;
                if (r.createdAt?.seconds) {
                    requestDate = new Date(r.createdAt.seconds * 1000);
                } else if (r.createdAt?._seconds) {
                    requestDate = new Date(r.createdAt._seconds * 1000);
                } else {
                    requestDate = new Date(r.createdAt);
                }
                return requestDate >= boundaryDate;
            });

            let assignedCount = 0;
            let unassignedCount = 0;
            let rejectedCount = 0;

            filteredRequests.forEach(r => {
                if (r.status === "Rejected") {
                    rejectedCount++;
                } else if (r.assignedEditorUsername) {
                    assignedCount++;
                } else {
                    unassignedCount++;
                }
            });

            setFilteredRequestCounts({
                assigned: assignedCount,
                unassigned: unassignedCount,
                rejected: rejectedCount
            });

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
    }, [adminId, productivityFilter]); // Must include all dependencies used inside the function

    useEffect(() => {
        if (adminId) {
            fetchAllData();
        }
    }, [adminId, productivityFilter, fetchAllData]);


    const pendingRequests = requests.filter(r => r.status === "Pending");
    const completed = projects.filter(p => p.status === "Completed Payment").length;
    const inProgress = projects.length - completed;


    const statusCounts = {
        "In Progress": 0,
        "To Review": 0,
        "Completed - Pending Payment": 0,
        "Completed Payment": 0
    };

    projects.forEach(p => {
        if (p.status === "In Progress") {
            statusCounts["In Progress"]++;
        }

        if (p.status === "To Review") {
            statusCounts["To Review"]++;
        }


        if (p.status === "Completed - Pending Payment") {
            statusCounts["Completed - Pending Payment"]++;
        }

        if (p.status === "Completed Payment") {
            statusCounts["Completed Payment"]++;
        }
    });





    const statusBarData = {
        labels: ["Project Status"],
        datasets: [
            {
                label: "In Progress",
                data: [statusCounts["In Progress"]],
                backgroundColor: "#d6d727",
            },
            {
                label: "To Review",
                data: [statusCounts["To Review"]],
                backgroundColor: "#92cad1",
            },
            {
                label: "Completed - Pending Payment",
                data: [statusCounts["Completed - Pending Payment"]],
                backgroundColor: "#e9724d",
            },
            {
                label: "Completed Payment",
                data: [statusCounts["Completed Payment"]],
                backgroundColor: "#79ccb3",
            },
        ],
    };


    const requestPieData = {
        labels: ["Assigned", "Unassigned", "Rejected"],
        datasets: [
            {
                label: "Request Distribution",
                data: [
                    filteredRequestCounts.assigned || 0,
                    filteredRequestCounts.unassigned || 0,
                    filteredRequestCounts.rejected || 0
                ],
                backgroundColor: ["#b0d7e1", "#f1802d", "#e74c3c"],
            },
        ],
    };


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
                    </div>

                    <div className="dashboard-section">
                        <h4>Recent Notifications</h4>
                        {notifications.length === 0 ? (
                            <p className="muted">No recent activity</p>
                        ) : (
                            notifications.map((n, i) => {
                                const handleNotificationClick = () => {
                                    if (n.type === "chat" && n.relatedId) {
                                        window.location.href = `/admin-chat/${n.relatedId}`;
                                    } else if (n.type === "request") {
                                        window.location.href = "/admin-requests";
                                    } else if (n.type === "task" && n.relatedId) {
                                        window.location.href = `/admin-projects`;
                                    } else if (n.type === "payment" && n.relatedId) {
                                        window.location.href = `/admin-payments`; // Or specific project view if applicable
                                    } else {
                                        console.log("No navigation for this type.");
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
                            })

                        )}
                    </div>

                    <div className="dashboard-section">
                        <h4>Request Processing Summary</h4>
                        <div className="filter-row">
                            <label>Filter by:</label>
                            <select
                                value={productivityFilter}
                                onChange={(e) => {
                                    setProductivityFilter(e.target.value);
                                }}
                            >
                                <option value="week">Past Week</option>
                                <option value="month">Past Month</option>
                                <option value="year">Past Year</option>
                            </select>
                        </div>
                        <div style={{ maxWidth: "320px", margin: "0 auto" }}>
                            <Pie data={requestPieData} />

                        </div>
                    </div>


                    <div className="dashboard-section">
                        <h4>Projects Status</h4>
                        <div style={{ maxWidth: "750px", margin: "0 auto" }}>
                            <Bar data={statusBarData} />
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}

export default AdminDashboard;
