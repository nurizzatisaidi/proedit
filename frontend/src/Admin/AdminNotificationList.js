import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
    FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaTrash,
    FaUser, FaUsers, FaMoneyBillWave
} from "react-icons/fa";
import "../styles/List.css";

function AdminNotificationList() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [notifications, setNotifications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("Admin");
    const [showToast, setShowToast] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState("");
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/notifications/user/${userId}`);
            const sorted = response.data.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            setNotifications(sorted);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false); // <-- Stop spinner
        }
    }, [BASE_URL, userId]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`${BASE_URL}/api/notifications/mark-read/${notificationId}`);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`${BASE_URL}/api/notifications/${notificationId}`);
            showToastMessage("Notification deleted.");
            fetchNotifications();
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleNavigate = (type, relatedId) => {
        if (type === "chat" && relatedId) {
            navigate(`/admin-chat/${relatedId}`);
        } else if (type === "request") {
            navigate("/admin-requests");
        } else if (type === "payment") {
            navigate("/admin-payments");
        } else if (type === "task") {
            navigate("/admin-projects");
        }
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
                <section className="list-section">
                    <div className="top-bar">
                        <h1>Notifications</h1>
                    </div>

                    <div className="list">
                        {isLoading ? (
                            <div style={{ textAlign: "center" }}>
                                <div className="spinner"></div>
                                <p>Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <p>No notifications found.</p>
                        ) : (
                            notifications.map((notif) => (
                                <div className={`list-card ${notif.read ? "read" : "unread"}`} key={notif.notificationId}>
                                    <div className="list-details" onClick={() => handleNavigate(notif.type, notif.relatedId)} style={{ cursor: "pointer" }}>
                                        <p><strong>{notif.type.toUpperCase()}</strong> - {notif.message}</p>
                                        <p style={{ fontSize: "0.9rem", color: "#666" }}>
                                            {new Date(notif.timestamp.seconds * 1000).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="list-actions">
                                        {!notif.read && (
                                            <button className="edit-btn" onClick={() => markAsRead(notif.notificationId)}>
                                                Mark as Read
                                            </button>
                                        )}
                                        <button className="delete-btn" onClick={() => deleteNotification(notif.notificationId)}>
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                <Footer />
            </main>

            {showToast && (
                <div className="custom-toast">{toastMessage}</div>
            )}
        </div>
    );
}

export default AdminNotificationList;
