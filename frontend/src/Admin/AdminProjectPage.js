import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFolder, FaFileAlt, FaUser, FaUsers, FaComments, FaBell, FaEye, FaEdit, FaTrash, FaMoneyBill, FaPlus } from "react-icons/fa";
import "../styles/RequestPage.css";
import "../styles/List.css";

function AdminProjectPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("Admin");
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        videoType: "",
        duration: "",
        sharedDrive: "",
        notes: "",
    });

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchAllProjects();
    }, []);

    const fetchAllProjects = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/projects/all");
            if (!response.ok) throw new Error("Failed to fetch projects");
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects: ", error);
        }
    };

    const handleView = (project) => {
        setSelectedProject(project);
        setShowViewPopup(true);
    };

    const handleEdit = (projectId) => {
        window.location.href = `/admin-edit-project/${projectId}`;
    };

    const handleDelete = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                const response = await fetch(`http://localhost:8080/api/projects/delete/${projectId}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    alert("Project deleted successfully");
                    fetchAllProjects();
                } else {
                    alert("Failed to delete project.");
                }
            } catch (error) {
                console.error("Error deleting project:", error);
            }
        }
    };

    const handleIssuePayment = (projectId) => {
        window.location.href = `/admin-issue-payment/${projectId}`;
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8080/api/projects/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Project created successfully!");
                setShowCreatePopup(false);
                setFormData({
                    title: "",
                    videoType: "",
                    duration: "",
                    sharedDrive: "",
                    notes: "",
                });
                fetchAllProjects(); // refresh list
            } else {
                alert("Failed to create project.");
            }
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Error creating project.");
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/admin-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/admin-projects" },
        { name: "Chat", icon: <FaComments />, path: "/admin-chat" },
        { name: "Notifications", icon: <FaBell />, path: "/admin-notifications" },
        { name: "Editors", icon: <FaUser />, path: "/admin-editors-list" },
        { name: "Clients", icon: <FaUsers />, path: "/admin-clients-list" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <div className="top-bar">
                    <h1>All Projects</h1>
                    <button className="add-user-btn" onClick={() => setShowCreatePopup(true)}>
                        <FaPlus /> Create New Project
                    </button>
                </div>

                <section className="list-section">
                    <input
                        type="text"
                        placeholder="Search by title or client..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="list">
                        {projects.filter((project) => {
                            const lowerQuery = searchQuery.toLowerCase();
                            return (
                                project.title?.toLowerCase().includes(lowerQuery) ||
                                project.username?.toLowerCase().includes(lowerQuery)
                            );
                        }).map((project) => (
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
                                    <button className="edit-btn" onClick={() => handleEdit(project.projectId)}><FaEdit /> Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(project.projectId)}><FaTrash /> Delete</button>
                                    <button className="payment-btn" onClick={() => handleIssuePayment(project.projectId)}><FaMoneyBill /> Issue Payment</button>
                                </div>
                            </div>
                        ))}
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
                                <p>{selectedProject.notes}</p>
                            </div>
                        </div>

                        <div className="center-button">
                            <button className="cancel-btn" onClick={() => setShowViewPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreatePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="form-group">
                                <label className="form-label">Title:</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Video Type:</label>
                                <select name="videoType" value={formData.videoType} onChange={handleChange} required>
                                    <option value="">Select Video Type</option>
                                    {["Tutorial", "Presentation", "Marketing", "Animation", "Interview", "Teaching"].map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preferred Duration (Minutes):</label>
                                <input type="number" name="duration" value={formData.duration} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Shared Drive Link:</label>
                                <input type="url" name="sharedDrive" value={formData.sharedDrive} onChange={handleChange} required />
                            </div>

                            <div className="form-note">
                                Please ensure the shared drive contains raw footage or reference files. <br />
                                <strong>Note:</strong> High-quality assets help editors produce the best results.
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes:</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes or expectations..."></textarea>
                            </div>

                            <div className="button-group">
                                <button type="button" className="cancel-btn" onClick={() => setShowCreatePopup(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminProjectPage;
