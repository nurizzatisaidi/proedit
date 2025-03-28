import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header"; // Import the reusable Header component
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaUser, FaUsers, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/List.css";

function ClientList() {
    const [clients, setClients] = useState([]);
    const [username, setUsername] = useState("Admin");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newClient, setNewClient] = useState({ name: "", email: "", password: "" });

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get("http://localhost:8080/users?role=user");
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        if (!newClient.name || !newClient.email || !newClient.password) {
            alert("Please fill in all fields!");
            return;
        }
        try {
            await axios.post("http://localhost:8080/users/register", newClient);
            alert("Client added successfully!");
            setNewClient({ name: "", email: "", password: "" });
            setShowAddPopup(false);
            fetchClients();
        } catch (error) {
            console.error("Error adding client:", error);
            alert("Failed to add client.");
        }
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm("Are you sure you want to delete this client?")) return;
        try {
            await axios.delete(`http://localhost:8080/users/${id}`);
            alert("Client deleted successfully!");
            fetchClients();
        } catch (error) {
            console.error("Error deleting client:", error);
            alert("Failed to delete client.");
        }
    };

    const handleEditClient = (id) => {
        alert(`Edit functionality for client with ID ${id} will be added later.`);
    };

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <Header username={username} /> {/* Add the reusable Header component */}
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
                        {clients.length > 0 ? (
                            filteredClients.map((client) => (
                                <div className="list-card" key={client.userId}>
                                    <div className="list-details">
                                        <p><strong>Name:</strong> {client.name}</p>
                                        <p><strong>Email:</strong> {client.email}</p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="edit-btn" onClick={() => handleEditClient(client.userId)}><FaEdit />Edit</button>
                                        <button className="delete-btn" onClick={() => handleDeleteClient(client.userId)}><FaTrash />Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No clients found.</p>
                        )}
                    </div>
                </section>
            </main>

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


        </div>
    );
}

export default ClientList;
