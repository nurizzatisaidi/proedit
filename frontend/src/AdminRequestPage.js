import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaTrash, FaEye, FaUser, FaUsers } from "react-icons/fa";
import "./styles/List.css";

function AdminRequestPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [requests, setRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState("All");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/requests/all");
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched Requests:", data);
                setRequests(data);
            } else {
                alert("Failed to load requests.");
            }
        } catch (error) {
            console.error("Error fetching requests: ", error);
        }
    };

    const handleDelete = async (requestId) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            const response = await fetch(`http://localhost:8080/api/requests/delete/${requestId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Request deleted successfully.");
                fetchRequests();
            } else {
                alert("Failed to delete request.");
            }
        } catch (error) {
            console.error("Error deleting request: ", error);
        }
    };

    const filteredRequests = requests.filter((req) =>
        filterStatus === "All" ? true : req.status === filterStatus
    );

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
                <Header username="Admin" />
                <section className="list-section">
                    <div className="top-bar">
                        <h1>All User Requests</h1>
                        <select className="filter-dropdown" onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="list">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <div className="list-card" key={request.requestId}>
                                    <div className="list-details">
                                        <p><strong>Title:</strong> {request.title}</p>
                                        <p><strong>User:</strong> {request.userId}</p>
                                        <p><strong>Video Type:</strong> {request.videoType}</p>
                                        <p><strong>Duration:</strong> {request.duration} mins</p>
                                        <p><strong>Status:</strong> {request.status}</p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="edit-btn"><FaEye /> View</button>
                                        <button className="delete-btn" onClick={() => handleDelete(request.requestId)}><FaTrash /> Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No requests found.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default AdminRequestPage;
