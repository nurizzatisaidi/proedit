import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaUser, FaUsers, FaPlus, FaEdit, FaTrash, FaMoneyBillWave } from "react-icons/fa";
import "../styles/List.css";

function ClientList() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState("Admin");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [editedClient, setEditedClient] = useState({ userId: "", name: "", email: "", password: "" });
    const [newClient, setNewClient] = useState({ name: "", email: "", password: "" });

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/users?role=user`);
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setIsLoading(false);
        }
    }, [BASE_URL]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchClients();
    }, [fetchClients]);

    const handleAddClient = async (e) => {
        e.preventDefault();
        if (!newClient.name || !newClient.email || !newClient.password) {
            alert("Please fill in all fields!");
            return;
        }
        try {
            await axios.post(`${BASE_URL}/users/register`, newClient);
            showToastMessage("Client added successfully!");
            setNewClient({ name: "", email: "", password: "" });
            setShowAddPopup(false);
            fetchClients();
        } catch (error) {
            console.error("Error adding client:", error);
            showToastMessage("Failed to add client.");
        }
    };

    const handleEditClient = (client) => {
        setEditedClient({
            userId: client.userId,
            name: client.name,
            email: client.email,
            password: ""
        });
        setShowEditPopup(true);
    };

    const submitEditClient = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${BASE_URL}/users/update-profile/${editedClient.userId}`, editedClient);
            showToastMessage("Client updated successfully!");
            setShowEditPopup(false);
            fetchClients();
        } catch (error) {
            console.error("Error updating client:", error);
            showToastMessage("Failed to update client.");
        }
    };


    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <h1>User List</h1>
                        <button className="add-user-btn" onClick={() => setShowAddPopup(true)}>
                            <FaPlus /> Add User
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
                        ) : clients.length > 0 ? (
                            filteredClients.map((client) => (
                                <div className="list-card" key={client.userId}>
                                    <div className="list-details">
                                        <p><strong>Name:</strong> {client.name}</p>
                                        <p><strong>Email:</strong> {client.email}</p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="edit-btn" onClick={() => handleEditClient(client)}><FaEdit />Edit</button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => {
                                                setSelectedClient(client);
                                                setShowDeletePopup(true);
                                            }}
                                        >
                                            <FaTrash /> Delete
                                        </button>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No clients found.</p>
                        )}
                    </div>
                </section>
            </main>

            {/* Create new Client Popup */}
            {showAddPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Add New Client</h2>
                        <form onSubmit={handleAddClient}>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={newClient.password}
                                    onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="button-group">
                                <button type="button" className="cancel-btn" onClick={() => setShowAddPopup(false)}>Cancel</button>
                                <button type="submit" className="add-btn">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Client Popup */}
            {showDeletePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete <strong>{selectedClient.name}</strong>?</p>

                        <div className="popup-buttons">
                            <button className="cancel-btn" onClick={() => setShowDeletePopup(false)}>Cancel</button>
                            <button
                                className="reject-btn"
                                onClick={async () => {
                                    try {
                                        await axios.delete(`${BASE_URL}/users/${selectedClient.userId}`);
                                        showToastMessage("Client deleted successfully!");
                                        setShowDeletePopup(false);
                                        fetchClients();
                                    } catch (error) {
                                        console.error("Error deleting client:", error);
                                        showToastMessage("Failed to delete client.");
                                    }
                                }}
                            >
                                Delete
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Update Client Popup */}
            {showEditPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Edit Client</h2>
                        <form onSubmit={submitEditClient}>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={editedClient.name}
                                    onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={editedClient.email}
                                    onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password:</label>
                                <input
                                    type="password"
                                    placeholder="Only when a new password is needed..."
                                    value={editedClient.password}
                                    onChange={(e) => setEditedClient({ ...editedClient, password: e.target.value })}
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

            {/* Show Toast Message */}
            {showToast && (
                <div className="custom-toast">
                    {toastMessage}
                </div>
            )}



        </div>
    );
}

export default ClientList;
