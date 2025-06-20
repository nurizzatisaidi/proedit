import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaHome, FaFolder, FaComments, FaBell, FaEye, FaTasks } from "react-icons/fa";
import "../styles/List.css";
import "../styles/ProjectPage.css";

function EditorProjectsPage() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("editor");
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const fetchProjects = useCallback(async (editorId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/projects/editor/${editorId}`);
            if (!response.ok) throw new Error("Failed to fetch projects");
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [BASE_URL]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        const storedId = localStorage.getItem("userId");
        console.log("Stored userId:", storedId);

        if (storedName) setUsername(storedName);
        if (storedId) fetchProjects(storedId);
    }, [fetchProjects]);

    const handleView = (project) => {
        setSelectedProject(project);
        setShowViewPopup(true);
    };

    const handleProjectBoard = (projectId) => {
        window.location.href = `/editor-project-board/${projectId}`;
    };

    const handleChat = useCallback(async (projectId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/chats/project/${projectId}`);
            if (!response.ok) throw new Error("Chat not found");

            const chat = await response.json();
            const chatId = chat.chatId;

            window.location.href = `/editor-chat/${chatId}`;
        } catch (error) {
            console.error("Error getting chat by projectId:", error);
            alert("Chat not found for this project.");
        }
    }, [BASE_URL]);


    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <div className="top-bar">
                </div>
                <section className="list-section">
                    <div className="top-bar">
                        <h1>Your Assigned Projects</h1>
                    </div>

                    <div className="project-filters">
                        <select className="project-filter-dropdown" onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">All</option>
                            <option value="In Progress">In Progress</option>
                            <option value="To Review">To Review</option>
                            <option value="Completed - Pending Payment">Completed - Pending Payment</option>
                            <option value="Completed Payment">Completed Payment</option>
                        </select>

                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search by title or client..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="list">
                        {isLoading ? (
                            <div style={{ textAlign: "center" }}>
                                <div className="spinner"></div>
                                <p>Loading requests...</p>
                            </div>
                        ) : projects.filter((project) => {
                            const lowerQuery = searchQuery.toLowerCase();
                            const matchesStatus = filterStatus === "All" || project.status === filterStatus;
                            const matchesSearch =
                                project.title?.toLowerCase().includes(lowerQuery) ||
                                project.username?.toLowerCase().includes(lowerQuery);
                            return matchesStatus && matchesSearch;
                        }).length > 0 ? (
                            projects
                                .filter((project) => {
                                    const lowerQuery = searchQuery.toLowerCase();
                                    return (
                                        project.title?.toLowerCase().includes(lowerQuery) ||
                                        project.username?.toLowerCase().includes(lowerQuery)
                                    );
                                })
                                .map((project) => (
                                    <div className="list-card" key={project.projectId}>
                                        <div className="list-details sleek-card-info">
                                            <h3 className="list-title">{project.title}</h3>
                                            <p>Client: {project.username || "Unknown"}</p>
                                            <p>
                                                <span className={`status-badge ${project.status.toLowerCase().replace(" ", "-")}`}>
                                                    {project.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="list-actions">
                                            <button className="view-btn" onClick={() => handleView(project)}><FaEye /> View</button>
                                            <button className="board-btn" onClick={() => handleProjectBoard(project.projectId)}><FaTasks /> Board</button>
                                            <button className="chat-btn" onClick={() => handleChat(project.projectId)}><FaComments /> Chat</button>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p>No assigned projects found.</p>
                        )}
                    </div>
                </section>
                <Footer />
            </main>

            {showViewPopup && selectedProject && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Project Details</h2>
                        <div className="request-details">
                            <div className="detail-row">
                                <span>Title:</span>
                                <p>{selectedProject.title}</p>
                            </div>
                            <div className="detail-row">
                                <span>Client:</span>
                                <p>{selectedProject.username || "Unknown"}</p>
                            </div>
                            <div className="detail-row">
                                <span>Status:</span>
                                <p>{selectedProject.status}</p>
                            </div>
                            <div className="detail-row">
                                <span>Video Type:</span>
                                <p>{selectedProject.videoType}</p>
                            </div>
                            <div className="detail-row">
                                <span>Duration:</span>
                                <p>{selectedProject.duration} mins</p>
                            </div>
                            <div className="detail-row">
                                <span>Client's Note:</span>
                                <p>{selectedProject.notes} </p>
                            </div>
                        </div>

                        <div className="center-button">
                            <button className="cancel-btn" onClick={() => setShowViewPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default EditorProjectsPage;
