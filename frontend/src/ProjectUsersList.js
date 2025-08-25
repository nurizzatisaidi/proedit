// src/pages/ProjectUsersList.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FaUser, FaEnvelope, FaPhone, FaComments, FaHome, FaFolder, FaBell, FaFileAlt, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import "./styles/List.css";
import "./styles/UsersList.css"; // create minimal styles or reuse

export default function ProjectUsersList() {
    const { projectId } = useParams();
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [username, setUsername] = useState(localStorage.getItem("username") || "User");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${projectId}/users`);
            if (!res.ok) throw new Error("Failed to load users");
            const data = await res.json();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [BASE_URL, projectId]);

    useEffect(() => {
        const nm = localStorage.getItem("username");
        if (nm) setUsername(nm);
        fetchUsers();
    }, [fetchUsers]);

    // exclude self from the list
    const currentUserId = localStorage.getItem("userId");

    const visibleUsers = users.filter(u => u.userId !== currentUserId);

    const filtered = visibleUsers.filter(u => {
        const q = search.toLowerCase();
        return (
            (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.role || "").toLowerCase().includes(q)
        );
    });

    const handleOpenChat = async (userId) => {
        // If you want to jump to the chat for this project, reuse your existing endpoint
        // /api/chats/project/{projectId} to get chatId, then navigate:
        try {
            const res = await fetch(`${BASE_URL}/api/chats/project/${projectId}`);
            if (!res.ok) throw new Error("No chat for this project");
            const data = await res.json(); // { chatId, ... }
            navigate(`/editor-chat/${data.chatId}`); // or /admin-chat or /user-chat depending on role
        } catch (e) {
            console.error(e);
            // Optionally: show toast
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
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/admin-payments" }
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <section className="list-section">
                    <div className="top-bar">
                        <h1>People in this Project</h1>
                    </div>

                    <input
                        type="text"
                        placeholder="Search by name, email, or role"
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {isLoading ? (
                        <div style={{ textAlign: "center" }}>
                            <div className="spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <div className="list">
                            {filtered.map(u => (
                                <div key={u.userId} className="list-card user-card">
                                    <div className="user-avatar">
                                        {u.photoUrl ? (
                                            <img src={u.photoUrl} alt={u.name} />
                                        ) : (
                                            <div className="avatar-fallback"><FaUser /></div>
                                        )}
                                    </div>

                                    <div className="list-details">
                                        <h3 className="list-title">{u.name}</h3>
                                        <div className="user-meta">
                                            <span className={`role-badge role-${(u.role || "unknown").toLowerCase()}`}>{u.role || "Unknown"}</span>
                                        </div>
                                        <p className="user-contact">
                                            <FaEnvelope /> {u.email || "-"}
                                        </p>
                                        <p className="user-contact">
                                            <FaPhone /> {u.phone || u.phoneNumber || "-"}
                                        </p>
                                    </div>

                                    <div className="list-actions">
                                        <button className="chat-btn" onClick={() => handleOpenChat(u.userId)}>
                                            <FaComments /> Chat
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <Footer />
            </main>
        </div>
    );
}
