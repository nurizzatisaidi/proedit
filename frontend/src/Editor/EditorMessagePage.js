import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFolder, FaComments, FaBell, FaPaperclip } from 'react-icons/fa';
import "../styles/ChatPage.css";

function EditorMessagePage() {
    const { chatId } = useParams();
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatList, setChatList] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isChatListLoading, setIsChatListLoading] = useState(true);
    const [isMessageLoading, setIsMessageLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchChatList = useCallback(async () => {
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
    }, [userId]);

    const fetchMessages = useCallback(async () => {
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
    }, [chatId]);
    useEffect(() => {
        fetchChatList();
    }, [fetchChatList]);

    useEffect(() => {
        if (chatId) fetchMessages();
    }, [chatId, fetchMessages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedFile) return;
        setIsSending(true);

        try {
            let contentToSend = newMessage;

            if (selectedFile) {
                const fileRef = ref(storage, `chat_attachments/${chatId}/${Date.now()}_${selectedFile.name}`);
                await uploadBytes(fileRef, selectedFile);
                contentToSend = await getDownloadURL(fileRef);
            }

            const optimisticMessage = {
                content: contentToSend,
                senderId: userId,
                senderUsername: username,
                timestamp: { seconds: Math.floor(Date.now() / 1000) }
            };

            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage("");
            setSelectedFile(null);

            const payload = {
                chatId,
                senderId: userId,
                senderUsername: username,
                timestamp: optimisticMessage.timestamp,
                content: contentToSend,
            };

            await fetch("http://localhost:8080/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setTimeout(fetchMessages, 300);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };


    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" },
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
                                    onClick={() => navigate(`/editor-chat/${chat.chatId}`)}
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
                            {isChatListLoading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <h2>{activeChat?.projectTitle || "Chat"}</h2>
                                    {activeChat?.projectId && (
                                        <button
                                            className="taskboard-btn"
                                            onClick={() => navigate(`/editor-project-board/${activeChat.projectId}`)}
                                        >
                                            View Task Board
                                        </button>
                                    )}
                                </>
                            )}
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
                                placeholder={selectedFile ? `📎 ${selectedFile.name}` : "Type a message or attach a file..."}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button onClick={handleSendMessage} disabled={isSending}>
                                {isSending ? "Sending..." : "Send"}
                            </button>
                            <label className="file-label" title="Attach file">
                                <FaPaperclip size={16} />
                                <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default EditorMessagePage;
