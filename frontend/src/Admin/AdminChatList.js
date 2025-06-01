import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaComments, FaHome, FaFileAlt, FaFolder, FaBell, FaUser, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import "../styles/List.css";
import "../styles/ChatList.css";

function AdminChatList() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [username, setUsername] = useState(localStorage.getItem('username') || "Admin");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const fetchAllChats = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/chats/all`);
            if (!response.ok) throw new Error("Failed to fetch chats");
            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error("Error fetching all chats:", error);
        } finally {
            setIsLoading(false);
        }
    }, [BASE_URL]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }
        fetchAllChats();
    }, [fetchAllChats]);

    const handleChat = (chatId) => {
        navigate(`/admin-chat/${chatId}`);
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

    const filteredChats = chats.filter(chat =>
        chat.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <section className="list-section">
                    <div className="top-bar">
                        <h1>All Chats</h1>
                    </div>

                    <input
                        type="text"
                        placeholder="Search by project title"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {isLoading ? (
                        <div style={{ textAlign: "center" }}>
                            <div className="spinner"></div>
                            <p>Loading all chats...</p>
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <p>No chats found.</p>
                    ) : (
                        <div className="list">
                            {filteredChats.map(chat => (
                                <div key={chat.chatId} className="list-card">
                                    <div className="list-details sleek-card-info">
                                        <h3 className="list-title">{chat.projectTitle}</h3>
                                        <p className="chat-participants">{chat.participantUsernames.join(", ")}</p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="chat-btn" onClick={() => handleChat(chat.chatId)}>
                                            <FaComments /> Chat
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminChatList;
