import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFolder, FaComments, FaBell, FaEye, FaTasks } from "react-icons/fa";
import "../styles/List.css";

function EditorProjectsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("editor");
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        const storedId = localStorage.getItem("userId");
        console.log("Stored userId:", storedId);

        if (storedName) setUsername(storedName);
        if (storedId) fetchProjects(storedId);
    }, []);

    const fetchProjects = async (editorId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/projects/editor/${editorId}`);
            if (!response.ok) throw new Error("Failed to fetch projects");
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (project) => {
        setSelectedProject(project);
        setShowViewPopup(true);
    };

    const handleProjectBoard = (projectId) => {
        window.location.href = `/editor-project-board/${projectId}`;
    };

    const handleChat = (projectId) => {
        window.location.href = `/editor-chat/${projectId}`;
    };


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
                    <input
                        type="text"
                        placeholder="Search by title or client..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="list">
                        {isLoading ? (
                            <div style={{ textAlign: "center" }}>
                                <div className="spinner"></div>
                                <p>Loading requests...</p>
                            </div>
                        ) : projects.filter((project) => {
                            const lowerQuery = searchQuery.toLowerCase();
                            return (
                                project.title?.toLowerCase().includes(lowerQuery) ||
                                project.username?.toLowerCase().includes(lowerQuery)
                            );
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
