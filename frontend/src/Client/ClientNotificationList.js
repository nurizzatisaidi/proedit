import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
    FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaTrash, FaMoneyBillWave
} from "react-icons/fa";
import "../styles/List.css";

function ClientNotificationList() {
    const [notifications, setNotifications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("Client");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/notifications/user/${userId}`);
            const sorted = response.data.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            setNotifications(sorted);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, [userId]);
    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/mark-read/${notificationId}`);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`http://localhost:8080/api/notifications/${notificationId}`);
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
            navigate(`/user-chat/${relatedId}`);
        } else if (type === "request") {
            navigate("/user-requests");
        } else if (type === "payment") {
            navigate("/user-payments");
        }
    };

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
                <section className="list-section">
                    <div className="top-bar">
                        <h1>Notifications</h1>
                    </div>

                    <div className="list">
                        {notifications.length === 0 ? (
                            <p>No notifications found.</p>
                        ) : (
                            notifications.map((notif) => (
                                <div className={`list-card ${notif.read ? "read" : "unread"}`} key={notif.notificationId}>
                                    <div className="list-details" onClick={() => handleNavigate(notif.type, notif.relatedId)} style={{ cursor: "pointer" }}>
                                        <p><strong>{notif.type.toUpperCase()}</strong> - {notif.message}</p>
                                        <p style={{ fontSize: "0.9rem", color: "#666" }}>{new Date(notif.timestamp.seconds * 1000).toLocaleString()}</p>
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
            </main>

            {showToast && (
                <div className="custom-toast">{toastMessage}</div>
            )}
        </div>
    );
}
export default ClientNotificationList;
