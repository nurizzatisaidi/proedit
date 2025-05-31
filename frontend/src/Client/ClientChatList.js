import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaComments, FaHome, FaFileAlt, FaFolder, FaBell, FaMoneyBillWave, FaTasks } from 'react-icons/fa';
import "../styles/List.css";
import "../styles/ChatList.css";

function ClientChatList() {
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [userId] = useState(localStorage.getItem('userId'));
    const [username, setUsername] = useState(localStorage.getItem('username') || "User");
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const fetchChats = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/chats/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch chats');
            const data = await response.json();
            setChats(data);

            if (data.length === 0) {
                showToastMessage("You have no chats yet.");
            }
        } catch (error) {
            console.error("Error fetching chats: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }
        fetchChats();
    }, [fetchChats]);

    const navigate = useNavigate();

    const handleChat = (chatId) => {
        navigate(`/user-chat/${chatId}`);
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/user-payments" },
        { name: "Notifications", icon: <FaBell />, path: "/client-notifications" },
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
                        <h1>My Chats</h1>
                    </div>

                    {/* Search Field */}
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
                            <p>Loading chats...</p>
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className="no-message">
                            <p>You have no chats yet.</p>
                        </div>
                    ) : (
                        <div className="list">
                            {filteredChats.map(chat => (
                                <div key={chat.chatId} className="list-card">
                                    <div className="list-details sleek-card-info">
                                        <h3 className="list-title">{chat.projectTitle}</h3>
                                        <p className="chat-participants">{chat.participantUsernames.join(', ')}</p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="chat-btn" onClick={() => handleChat(chat.chatId)}>
                                            <FaComments /> Chat
                                        </button>
                                        <button
                                            className="board-btn"
                                            onClick={() => window.location.href = `/client-projects/${chat.projectId}/progress`}
                                        >
                                            <FaTasks /> Task Board
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {showToast && (
                <div className="custom-toast">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

export default ClientChatList;
