import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaUser, FaUsers, FaPlus, FaEdit, FaTrash, FaMoneyBillWave } from "react-icons/fa";
import "../styles/List.css";

function EditorList() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [editors, setEditors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState("Admin");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [editorToDelete, setEditorToDelete] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editedEditor, setEditedEditor] = useState({ userId: "", name: "", email: "", password: "" });
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [newEditor, setNewEditor] = useState({ name: "", email: "", password: "" });

    const fetchEditors = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/users/editors`);
            setEditors(response.data);
        } catch (error) {
            console.error("Error fetching editors:", error);
        } finally {
            setIsLoading(false);
        }
    }, [BASE_URL]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchEditors();
    }, [fetchEditors]);

    const handleAddEditor = async (e) => {
        e.preventDefault();
        if (!newEditor.name || !newEditor.email || !newEditor.password) {
            alert("Please fill in all fields!");
            return;
        }
        try {
            await axios.post(`${BASE_URL}/users/register-editor`, newEditor);
            showToastMessage("Editor added successfully!");
            setNewEditor({ name: "", email: "", password: "" });
            setShowAddPopup(false);
            fetchEditors();
        } catch (error) {
            console.error("Error adding editor:", error);
            showToastMessage("Failed to add editor.");
        }
    };

    const confirmDeleteEditor = async () => {
        try {
            await axios.delete(`${BASE_URL}/users/editors/${editorToDelete.userId}`);
            showToastMessage("Editor deleted successfully!");
            setShowDeletePopup(false);
            setEditorToDelete(null);
            fetchEditors();
        } catch (error) {
            console.error("Error deleting editor:", error);
            showToastMessage("Failed to delete editor.");
            setShowDeletePopup(false);
        }
    };

    const handleDeleteEditor = (editor) => {
        setEditorToDelete(editor);
        setShowDeletePopup(true);
    };

    const handleEditEditor = (editor) => {
        setEditedEditor({
            userId: editor.userId,
            name: editor.name,
            email: editor.email,
            password: ""
        });
        setShowEditPopup(true);
    };

    const submitEditEditor = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${BASE_URL}/users/update-profile/${editedEditor.userId}`, editedEditor);
            showToastMessage("Editor updated successfully!");
            setShowEditPopup(false);
            fetchEditors();
        } catch (error) {
            console.error("Error updating editor:", error);
            showToastMessage("Failed to update editor.");
        }
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
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
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/admin-payments" }
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
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
                                        <button className="edit-btn" onClick={() => handleEditEditor(editor)}><FaEdit />Edit</button>

                                        <button className="delete-btn" onClick={() => handleDeleteEditor(editor)}>
                                            <FaTrash />Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No editors found.</p>
                        )}
                    </div>
                </section>
                <Footer />
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

            {/* Delete Editor Popup */}
            {showDeletePopup && editorToDelete && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete <strong>{editorToDelete.name}</strong>?</p>
                        <div className="popup-buttons">
                            <button className="cancel-btn" onClick={() => setShowDeletePopup(false)}>Cancel</button>
                            <button className="reject-btn" onClick={confirmDeleteEditor}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Editor Popup */}
            {showEditPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Edit Editor</h2>
                        <form onSubmit={submitEditEditor}>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={editedEditor.name}
                                    onChange={(e) => setEditedEditor({ ...editedEditor, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={editedEditor.email}
                                    onChange={(e) => setEditedEditor({ ...editedEditor, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password:</label>
                                <input
                                    type="password"
                                    placeholder="Only when a new password is needed..."
                                    value={editedEditor.password}
                                    onChange={(e) => setEditedEditor({ ...editedEditor, password: e.target.value })}
                                />
                            </div>
                            <div className="popup-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setShowEditPopup(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Message */}
            {showToast && (
                <div className="custom-toast">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

export default EditorList;
