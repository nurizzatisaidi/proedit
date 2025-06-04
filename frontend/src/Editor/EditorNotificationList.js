import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
    FaHome, FaFolder, FaComments, FaBell, FaTrash
} from "react-icons/fa";
import "../styles/List.css";

function EditorNotificationList() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [notifications, setNotifications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("Editor");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/notifications/user/${userId}`);
            const sorted = response.data
                .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
            setNotifications(sorted);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, [userId, BASE_URL]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await axios.put(`${BASE_URL}/api/notifications/mark-read/${notificationId}`);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    }, [fetchNotifications, BASE_URL]);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await axios.delete(`${BASE_URL}/api/notifications/${notificationId}`);
            showToastMessage("Notification deleted.");
            fetchNotifications();
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    }, [fetchNotifications, BASE_URL]);

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleNavigate = (type, relatedId) => {
        if (type === "chat" && relatedId) {
            navigate(`/editor-chat/${relatedId}`);
        } else if (type === "task" && relatedId) {
            navigate(`/editor-projects/${relatedId}/tasks`);
        } else if (type === "request") {
            navigate("/editor-projects");
        }
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" }
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
                                    <div
                                        className="list-details"
                                        onClick={() => handleNavigate(notif.type, notif.relatedId)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <p><strong>{notif.type.toUpperCase()}</strong> - {notif.message}</p>
                                        <p style={{ fontSize: "0.9rem", color: "#666" }}>
                                            {new Date(notif.timestamp?.seconds * 1000).toLocaleString()}
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

                {showToast && (
                    <div className="custom-toast">{toastMessage}</div>
                )}
                <Footer />
            </main>
        </div>
    );
}

export default EditorNotificationList;
