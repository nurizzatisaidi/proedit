import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFolder, FaFileAlt, FaUser, FaUsers, FaComments, FaBell, FaEye, FaEdit, FaTrash, FaMoneyBill, FaPlus } from "react-icons/fa";
import "../styles/List.css";
import "../styles/ProjectPage.css";


function AdminProjectPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("Admin");
    const [filterStatus, setFilterStatus] = useState("All");
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editors, setEditors] = useState([]);
    const [clients, setClients] = useState([]);
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
        fetchEditors();
        fetchClients();

    }, []);

    const fetchAllProjects = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/projects/all");
            if (!response.ok) throw new Error("Failed to fetch projects");
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEditors = async () => {
        try {
            const response = await fetch("http://localhost:8080/users/editors");
            const data = await response.json();
            setEditors(data);
        } catch (error) {
            console.error("Failed to fetch editors:", error);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch("http://localhost:8080/users/clients");
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleView = (project) => {
        setSelectedProject(project);
        setShowViewPopup(true);
    };

    const handleEdit = (project) => {
        setEditFormData(project);
        setShowEditPopup(true);
    };

    const handleDelete = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project and the related request?")) {
            try {
                const deleteResponse = await fetch(`http://localhost:8080/api/projects/delete/${projectId}`, {
                    method: "DELETE",
                });

                if (deleteResponse.ok) {
                    alert("Project and related request deleted successfully.");
                    setProjects(projects.filter(project => project.projectId !== projectId)); // Update UI
                } else {
                    throw new Error("Failed to delete project and related request.");
                }
            } catch (error) {
                console.error("Error during deletion: ", error);
                alert("Error during deletion process. Check logs for more details.");
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

    const filteredProjects = projects.filter((project) => {
        const matchesStatus = filterStatus === "All" || project.status === filterStatus;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleUpdateProject = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/projects/update/${editFormData.projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData),
            });

            if (response.ok) {
                alert("Project updated successfully!");
                setShowEditPopup(false);
                fetchAllProjects();
            } else {
                alert("Failed to update project.");
            }
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/admin-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/admin-projects" },
        { name: "Chat", icon: <FaComments />, path: "/admin-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/admin-notifications" },
        { name: "Editors", icon: <FaUser />, path: "/admin-editors-list" },
        { name: "Clients", icon: <FaUsers />, path: "/admin-clients-list" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <section className="list-section">
                    <div className="top-bar">
                        <h1>All Projects</h1>
                        <button className="add-user-btn" onClick={() => setShowCreatePopup(true)}>
                            <FaPlus /> Create New Project
                        </button>
                    </div>

                    <select className="project-filter-dropdown" onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="All">All</option>
                        <option value="In Progress">In Progress</option>
                        <option value="To Review">To Review</option>
                        <option value="Completed - Pending Payment">Completed - Pending Payment</option>
                        <option value="Completed Payment">Completed Payment</option>
                    </select>


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
                        ) : filteredProjects.map((project) => (
                            <div className="list-card" key={project.projectId}>
                                <div className="list-details sleek-card-info">
                                    <h3 className="list-title">{project.title}</h3>
                                    <p>Client: {project.username || "Unknown"}</p>
                                    <p>
                                        <span className={`status-badge ${project.status ? project.status.toLowerCase().replace(" ", "-") : ''}`}>
                                            {project.status || "Status Unknown"}
                                        </span>
                                    </p>
                                </div>
                                <div className="list-actions">
                                    <button className="view-btn" onClick={() => handleView(project)}><FaEye /> View</button>
                                    <button className="edit-btn" onClick={() => handleEdit(project)}><FaEdit /> Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(project.projectId)}><FaTrash /> Delete</button>
                                    <button className="payment-btn" onClick={() => handleIssuePayment(project.projectId)}><FaMoneyBill /> Issue Payment</button>
                                </div>
                            </div>
                        ))}
                    </div>

                </section>
            </main>

            {/* View Project Details Popup */}
            {showViewPopup && selectedProject && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Project Details</h2>
                        <div className="request-details">
                            <div className="detail-row">
                                <p><span>Title:</span>
                                    {selectedProject.title}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Client:</span>
                                    {selectedProject.username || "Unknown"}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Editor:</span>
                                    {selectedProject.editorUsername || "Unknown"}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Status:</span>
                                    {selectedProject.status}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Video Type:</span>
                                    {selectedProject.videoType}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Client's Note:</span>
                                    {selectedProject.notes}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Duration:</span>
                                    {selectedProject.duration} minutes</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Shared Drive:</span>
                                    {selectedProject.sharedDrive ?
                                        <a href={selectedProject.sharedDrive} target="_blank" rel="noopener noreferrer"> View Drive </a>
                                        : "Not shared"}
                                </p>
                            </div>
                        </div>

                        <div className="center-button">
                            <button className="cancel-btn" onClick={() => setShowViewPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create new Project Popup */}
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

                            <div className="form-group">
                                <label>Client:</label>
                                <select name="userId" value={formData.userId} onChange={handleChange} required>
                                    <option value="">Select Client</option>
                                    {clients.map((client) => (
                                        <option key={client.userId} value={client.userId}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Editor:</label>
                                <select name="editorId" value={formData.editorId} onChange={handleChange} required>
                                    <option value="">Select Editor</option>
                                    {editors.map((editor) => (
                                        <option key={editor.userId} value={editor.userId}>{editor.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="popup-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setShowCreatePopup(false)}>Cancel</button>
                                <button type="submit" className="add-btn">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Edit Project</h2>

                        <div className="form-group-edit">
                            <label>Title:</label>
                            <input name="title" value={editFormData.title || ""} onChange={handleEditInputChange} />
                        </div>

                        <div className="form-group-edit">
                            <label>Video Type:</label>
                            <select name="videoType" value={editFormData.videoType || ""} onChange={handleEditInputChange}>
                                <option value="">Select Type</option>
                                {["Tutorial", "Presentation", "Marketing", "Animation", "Interview", "Teaching"].map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-edit">
                            <label>Duration (Minutes):</label>
                            <input type="number" name="duration" value={editFormData.duration || ""} onChange={handleEditInputChange} />
                        </div>

                        <div className="form-group-edit">
                            <label>Client's Note:</label>
                            <textarea name="notes" value={editFormData.notes || ""} onChange={handleEditInputChange} />
                        </div>

                        <div className="form-group-edit">
                            <label>Private Drive:</label>
                            <input name="privateDrive" value={editFormData.privateDrive || ""} onChange={handleEditInputChange} />
                        </div>

                        <div className="form-group-edit">
                            <label>Editor:</label>
                            <select name="editorUsername" value={editFormData.editorUsername || ""} onChange={handleEditInputChange}>
                                <option value="">Select Editor</option>
                                {editors.map((editor) => (
                                    <option key={editor.userId} value={editor.name}>{editor.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Read-only fields */}
                        <div className="form-group-edit">
                            <label>Client:</label>
                            <input value={editFormData.username || ""} readOnly />
                        </div>

                        <div className="form-group-edit">
                            <label>Shared Drive:</label>
                            <input value={editFormData.sharedDrive || ""} readOnly />
                        </div>

                        <div className="form-group-edit">
                            <label>Status:</label>
                            <input value={editFormData.status || ""} readOnly />
                        </div>

                        <div className="button-group">
                            <button className="cancel-btn" onClick={() => setShowEditPopup(false)}>Cancel</button>
                            <button className="submit-btn" onClick={handleUpdateProject}>Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProjectPage;
