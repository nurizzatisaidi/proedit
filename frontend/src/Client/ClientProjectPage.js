import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaFileAlt, FaFolder, FaComments, FaBell, FaHome, FaEye } from "react-icons/fa";
import "../styles/ProjectPage.css";
import "../styles/List.css";

function ClientProjectPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("user");
    const [searchQuery, setSearchQuery] = useState("");


    const hasShownNoProjectsAlert = useRef(false);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }

        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/projects/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched Projects:", data);
                setProjects(data);

                if (data.length === 0 && !hasShownNoProjectsAlert.current) {
                    alert("You have no projects yet.");
                    hasShownNoProjectsAlert.current = true;
                }

            } else {
                alert("Failed to load projects.");
            }
        } catch (error) {
            console.error("Error fetching projects: ", error);
        }
    };

    const handleViewProject = (project) => {
        setSelectedProject(project);
        setShowViewPopup(true);
    };


    const filteredProjects = projects.filter((project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <Header username={username} />

                <section className="list-section">
                    <div className="top-bar">
                        <h1>My Projects</h1>
                    </div>

                    {/* Display List of Requests */}
                    <input
                        type="text"
                        placeholder="Search by title"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="list">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <div className="list-card" key={project.projectId}>
                                    <div className="list-details sleek-card-info">
                                        <h3 className="list-title">{project.title}</h3>
                                        <p>Video Type: {project.videoType}</p>
                                        <p>
                                            <span className={`status-badge ${project.status.toLowerCase()}`}>
                                                {project.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="view-btn" onClick={() => handleViewProject(project)}>
                                            <FaEye /> View
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No projects found.</p>
                        )}
                    </div>

                </section>
            </main>

            {/* View Request Popup */}
            {showViewPopup && selectedProject && (
                <div className="project-popup-overlay">
                    <div className="project-popup-content">
                        <h2>Project Details</h2>

                        <div className="project-details">
                            <div className="project-detail-row">
                                <p><span>Title:</span> {selectedProject.title}</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Assigned Editor:</span> {selectedProject.editorUsername}</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Video Type:</span> {selectedProject.videoType}</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Duration:</span> {selectedProject.duration} mins</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Notes:</span> {selectedProject.notes || "No notes provided"}</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Shared Drive:</span>
                                    {selectedProject.sharedDrive ?
                                        <a href={selectedProject.sharedDrive} target="_blank" rel="noopener noreferrer"> View Drive </a>
                                        : "Not shared"}
                                </p>
                            </div>
                        </div>

                        <div className="button-group">
                            <button className="cancel-btn" onClick={() => setShowViewPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientProjectPage;
