import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header"; // Import the reusable Header component
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaUser, FaUsers, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/List.css";

function EditorList() {
    const [editors, setEditors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState("Admin");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newEditor, setNewEditor] = useState({ name: "", email: "", password: "" });

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchEditors();
    }, []);

    const fetchEditors = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/users/editors");
            setEditors(response.data);
        } catch (error) {
            console.error("Error fetching editors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddEditor = async (e) => {
        e.preventDefault();
        if (!newEditor.name || !newEditor.email || !newEditor.password) {
            alert("Please fill in all fields!");
            return;
        }
        try {
            await axios.post("http://localhost:8080/users/register-editor", newEditor);
            alert("Editor added successfully!");
            setNewEditor({ name: "", email: "", password: "" });
            setShowAddPopup(false);
            fetchEditors();
        } catch (error) {
            console.error("Error adding editor:", error);
            alert("Failed to add editor.");
        }
    };

    const handleDeleteEditor = async (id) => {
        if (!window.confirm("Are you sure you want to delete this editor?")) return;
        try {
            await axios.delete(`http://localhost:8080/users/editors/${id}`);
            alert("Editor deleted successfully!");
            fetchEditors();
        } catch (error) {
            console.error("Error deleting editor:", error);
            alert("Failed to delete editor.");
        }
    };

    const handleEditEditor = (id) => {
        alert(`Edit functionality for editor with ID ${id} will be added later.`);
    };

    const filteredEditors = editors.filter((editor) =>
        editor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        editor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <Header username={username} /> {/* Add the reusable Header component */}
                <section className="list-section">
                    <div className="top-bar">
                        <h1>Editors List</h1>
                        <button className="add-user-btn" onClick={() => setShowAddPopup(true)}>
                            <FaPlus /> Add Editor
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email"
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
                        ) : editors.length > 0 ? (
                            filteredEditors.map((editor) => (
                                <div className="list-card" key={editor.userId}>
                                    <div className="list-details">
                                        <p><strong>Name:</strong> {editor.name}</p>
                                        <p><strong>Email:</strong> {editor.email}</p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="edit-btn" onClick={() => handleEditEditor(editor.userId)}><FaEdit />Edit</button>
                                        <button className="delete-btn" onClick={() => handleDeleteEditor(editor.userId)}><FaTrash />Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No editors found.</p>
                        )}
                    </div>
                </section>
            </main>

            {/* Create New Editor Popup */}
            {showAddPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Add New Editor</h2>
                        <form onSubmit={handleAddEditor}>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={newEditor.name}
                                    onChange={(e) => setNewEditor({ ...newEditor, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={newEditor.email}
                                    onChange={(e) => setNewEditor({ ...newEditor, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={newEditor.password}
                                    onChange={(e) => setNewEditor({ ...newEditor, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="popup-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setShowAddPopup(false)}>Cancel</button>
                                <button type="submit" className="add-btn">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditorList;
