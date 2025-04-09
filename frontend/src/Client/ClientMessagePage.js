import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell } from 'react-icons/fa';
import "../styles/ChatPage.css"; // make sure spinner CSS is added here or imported

function ClientMessagePage() {
    const { chatId } = useParams();
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatList, setChatList] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isChatListLoading, setIsChatListLoading] = useState(true); // 🔄 loading flag
    const [isMessageLoading, setIsMessageLoading] = useState(true);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchChatList();
    }, []);

    useEffect(() => {
        if (chatId) fetchMessages();
    }, [chatId]);

    const fetchChatList = async () => {
        setIsChatListLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/chats/user/${userId}`);
            const data = await response.json();
            setChatList(data);
        } catch (err) {
            console.error("Failed to load chat list", err);
        } finally {
            setIsChatListLoading(false);
        }
    };

    const fetchMessages = async () => {
        setIsMessageLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/messages/chat/${chatId}`);
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Error fetching chat messages: ", error);
        } finally {
            setIsMessageLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const optimisticMessage = {
            content: newMessage,
            senderId: userId,
            senderUsername: username,
            timestamp: { seconds: Math.floor(Date.now() / 1000) }
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage("");

        try {
            const payload = {
                chatId,
                senderId: userId,
                content: optimisticMessage.content,
            };

            await fetch("http://localhost:8080/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setTimeout(fetchMessages, 300);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/user-notifications" },
    ];

    const activeChat = useMemo(
        () => chatList.find(chat => chat.chatId === chatId),
        [chatList, chatId]
    );

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <div className="chat-layout-container">

                    {/* Left Chat List */}
                    <div className="chat-list-panel">
                        <h3>Group Chats</h3>
                        {isChatListLoading ? (
                            <div className="spinner" />
                        ) : (
                            chatList.map((chat) => (
                                <div
                                    key={chat.chatId}
                                    className={`chat-list-item ${chat.chatId === chatId ? 'active' : ''}`}
                                    onClick={() => navigate(`/user-chat/${chat.chatId}`)}
                                >
                                    <div className="chat-user-avatar">{chat.projectTitle?.charAt(0)}</div>
                                    <div className="chat-user-info">
                                        <p className="chat-project-title">{chat.projectTitle}</p>
                                        <p className="chat-participants-preview">{chat.participantUsernames?.join(", ")}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Chat View */}
                    <div className="chat-view-panel">
                        <div className="chat-header">
                            {isChatListLoading ? <div className="spinner" /> : <h2>{activeChat?.projectTitle || "Chat"}</h2>}
                        </div>

                        <div className="messages-container">
                            {isMessageLoading ? (
                                <div className="spinner" />
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className={`chat-message ${msg.senderId === userId ? "own-message" : "other-message"}`}>
                                        {msg.senderId !== userId && (
                                            <strong className="sender-name">{msg.senderUsername}</strong>
                                        )}
                                        <p>{msg.content}</p>
                                        <span className="timestamp">
                                            {msg.timestamp?.seconds
                                                ? new Date(msg.timestamp.seconds * 1000).toLocaleString([], {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })
                                                : ""}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ClientMessagePage;
