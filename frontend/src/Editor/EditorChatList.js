import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaComments, FaHome, FaFolder, FaBell } from 'react-icons/fa';
import "../styles/List.css";
import "../styles/ChatList.css";

function EditorChatList() {
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [userId] = useState(localStorage.getItem('userId'));
    const [username, setUsername] = useState(localStorage.getItem('username') || "Editor");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }
        fetchChats();
    }, []);

    const fetchChats = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/chats/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch chats');
            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error("Error fetching chats: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const navigate = useNavigate();

    const handleChat = (chatId) => {
        navigate(`/editor-chat/${chatId}`);
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" },
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
                        <p>You have no chats yet.</p>
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

export default EditorChatList;
