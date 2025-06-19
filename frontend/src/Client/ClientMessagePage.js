import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaPaperclip, FaMoneyBillWave } from 'react-icons/fa';
import "../styles/ChatPage.css";

function ClientMessagePage() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
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

    const suggestedQuestions = [
        "What is the current status of my project?",
        "Can I revise the video title?",
        "When will the editing be done?",
        "How do I make payment?",
        "What is the payment process?",
        "Can I provide more feedback?",
    ];


    const fetchChatList = useCallback(async () => {
        setIsChatListLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/chats/user/${userId}`);
            const data = await response.json();
            setChatList(data);
        } catch (err) {
            console.error("Failed to load chat list", err);
        } finally {
            setIsChatListLoading(false);
        }
    }, [userId, BASE_URL]);

    const fetchMessages = useCallback(async () => {
        // setIsMessageLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/messages/chat/${chatId}`);
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Error fetching chat messages: ", error);
        } finally {
            setIsMessageLoading(false);
        }
    }, [chatId, BASE_URL]);

    useEffect(() => {
        const fetch = async () => await fetchChatList();
        fetch();
    }, [fetchChatList]);

    useEffect(() => {
        const fetch = async () => await fetchMessages();
        if (chatId) fetch();
    }, [chatId, fetchMessages]);

    const handleCombinedSend = async () => {
        if (!newMessage.trim() && !selectedFile) return;
        setIsSending(true);

        try {
            if (selectedFile) {
                const fileRef = ref(storage, `chat_attachments/${chatId}/${Date.now()}_${selectedFile.name}`);
                await uploadBytes(fileRef, selectedFile);
                const fileUrl = await getDownloadURL(fileRef);

                const optimisticMessage = {
                    content: fileUrl,
                    senderId: userId,
                    senderUsername: username,
                    timestamp: { seconds: Math.floor(Date.now() / 1000) }
                };

                setMessages(prev => [...prev, optimisticMessage]);

                const payload = {
                    chatId,
                    senderId: userId,
                    senderUsername: username,
                    timestamp: optimisticMessage.timestamp,
                    content: fileUrl,
                };

                await fetch(`${BASE_URL}/api/messages/send`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                setSelectedFile(null);
                setNewMessage("");
                setIsSending(false);
                return;
            }

            const optimisticMessage = {
                content: newMessage,
                senderId: userId,
                senderUsername: username,
                timestamp: { seconds: Math.floor(Date.now() / 1000) }
            };

            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage("");

            const payload = {
                chatId,
                senderId: userId,
                content: optimisticMessage.content,
            };

            await fetch(`${BASE_URL}/api/messages/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setTimeout(() => {
                fetchMessages(); // manually refresh, but...
            }, 300);

        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setIsSending(false);
        }
    };

    const formatMessage = (content) => {
        if (!content) return "";

        // Only format if it's a structured message
        if (content.includes("📝") && content.includes("•")) {
            return content
                .replace("📝", "📝") // optional: preserve icon
                .replace(/📝\s*(.*?)\n/, (_, title) => `<div style="font-weight:bold; text-align:left;">📝 ${title}</div>`)
                .replace(/\n/g, "<br/>"); // line breaks for bullet points
        }

        return content;
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
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/user-payments" },
        { name: "Notifications", icon: <FaBell />, path: "/client-notifications" },
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
                            {isChatListLoading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <h2>{activeChat?.projectTitle || "Chat"}</h2>
                                    {activeChat?.projectId && (
                                        <button
                                            className="taskboard-btn"
                                            onClick={() => navigate(`/client-projects/${activeChat.projectId}/progress`)}
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
                                        <p dangerouslySetInnerHTML={{
                                            __html: msg.content.startsWith("https://firebasestorage")
                                                ? msg.content.match(/\.(jpeg|jpg|gif|png)$/)
                                                    ? `<img src="${msg.content}" alt="attachment" style="max-width:200px;" />`
                                                    : `<a href="${msg.content}" target="_blank" rel="noopener noreferrer">View File</a>`
                                                : formatMessage(msg.content)
                                        }} />


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

                        {/* Frequest Suggested Question */}
                        <div className="faq-suggestions">
                            <p className="faq-title">Quick Questions:</p>
                            <div className="faq-buttons">
                                {suggestedQuestions.map((q, idx) => (
                                    <button key={idx} onClick={() => setNewMessage(q)}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="chat-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={
                                    selectedFile
                                        ? `📎 ${selectedFile.name}`
                                        : "Type a message or attach a file..."
                                }
                                onKeyPress={(e) => e.key === 'Enter' && handleCombinedSend()}
                            />

                            <button onClick={handleCombinedSend} disabled={isSending}>
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

export default ClientMessagePage;
