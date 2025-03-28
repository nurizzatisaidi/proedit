import React, { useEffect, useState } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaComments, FaHome, FaFileAlt, FaFolder, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "../styles/List.css";

function ClientChatList() {
    const [chats, setChats] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/chats/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch chats');
            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error("Error fetching chats: ", error);
        }
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat" },
        { name: "Notifications", icon: <FaBell />, path: "/user-notifications" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header />
                <div className="list-section">
                    <h1>My Chats</h1>
                    {chats.map(chat => (
                        <div key={chat.chatId} className="list-card">
                            <Link to={`/chat/${chat.chatId}`}>
                                <FaComments /> Chat with {chat.participants.join(', ')}
                            </Link>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default ClientChatList;
