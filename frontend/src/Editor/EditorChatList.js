import React, { useEffect, useState, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaComments, FaHome, FaFolder, FaBell, FaTasks } from 'react-icons/fa';
import "../styles/List.css";
import "../styles/ChatList.css";

function EditorChatList() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [userId] = useState(localStorage.getItem('userId'));
    const [username, setUsername] = useState(localStorage.getItem('username') || "Editor");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const fetchChats = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/chats/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch chats');
            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error("Error fetching chats: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, BASE_URL]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }
        fetchChats();
    }, [fetchChats]);

    const navigate = useNavigate();

    const handleChat = (chatId) => {
        navigate(`/editor-chat/${chatId}`);
    };

    const handleTaskBoard = (projectId) => {
        navigate(`/editor-project-board/${projectId}`);
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" },
    ];

    const filteredChats = chats.filter(chat => {
        const lowerSearch = searchQuery.toLowerCase();

        const titleMatch = (chat.projectTitle || "").toLowerCase().includes(lowerSearch);
        const userMatch = chat.participantUsernames?.some(name =>
            name.toLowerCase().includes(lowerSearch) && name !== username
        );

        return titleMatch || userMatch;
    });


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
                                        <h3 className="list-title">
                                            {chat.projectTitle && chat.projectTitle !== "Untitled Project"
                                                ? chat.projectTitle
                                                : chat.participantUsernames.filter(name => name !== username).join(", ") || "Untitled"}
                                        </h3>

                                        <p className="chat-participants">{chat.participantUsernames.join(', ')}</p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="chat-btn" onClick={() => handleChat(chat.chatId)}>
                                            <FaComments /> Chat
                                        </button>
                                        {chat.projectId ? (
                                            <button className="board-btn" onClick={() => handleTaskBoard(chat.projectId)}>
                                                <FaTasks /> Board
                                            </button>
                                        ) : null}

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

export default EditorChatList;
