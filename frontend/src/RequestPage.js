import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { FaFileAlt, FaFolder, FaComments, FaBell, FaHome, FaPlus } from "react-icons/fa";
import "./styles/RequestPage.css";
import "./styles/List.css";

function RequestPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showRequestPopup, setShowRequestPopup] = useState(false);
    const [requests, setRequests] = useState([]); // Store user's requests
    const [username, setUsername] = useState("user");

    const [formData, setFormData] = useState({
        title: "",
        videoType: "",
        duration: "",
        sharedDrive: "",
        notes: "",
    });

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }

        fetchRequests(); // ✅ Fetch user requests when the page loads
    }, []);  // ✅ Empty dependency array means this runs **only once** when the page loads

    const fetchRequests = async () => {
        const userId = localStorage.getItem("userId"); // ✅ Get userId from LocalStorage
        console.log("User ID in fetchRequests:", userId); // ✅ Debugging

        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/requests/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched Requests:", data); // ✅ Debugging
                setRequests(data);
            } else {
                alert("Failed to load requests.");
            }
        } catch (error) {
            console.error("Error fetching requests: ", error);
        }
    };

    const videoTypes = ["Tutorial", "Presentation", "Marketing", "Animation", "Interview"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get userId from LocalStorage
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        // Preparing data to send
        const requestData = { ...formData, userId };

        try {
            const response = await fetch("http://localhost:8080/api/requests/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                alert("Request submitted successfully!");
                setShowRequestPopup(false);
                setFormData({ title: "", videoType: "", duration: "", sharedDrive: "", notes: "" });

                fetchRequests(); // ✅ Refresh request list after submission
            } else {
                alert("Failed to submit request.");
            }
        } catch (error) {
            console.error("Error submitting request: ", error);
            alert("Error submitting request.");
        }
    };

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
                        <h1>My Requests</h1>
                        <button className="add-user-btn" onClick={() => setShowRequestPopup(true)}>
                            <FaPlus /> Create Request
                        </button>
                    </div>

                    {/* Display List of Requests */}
                    <div className="list">
                        {Array.isArray(requests) && requests.length > 0 ? (
                            requests.map((request) => (
                                <div className="list-card" key={request.requestId}>
                                    <div className="list-details">
                                        <p><strong>Title:</strong> {request.title}</p>
                                        <p><strong>Video Type:</strong> {request.videoType}</p>
                                        <p><strong>Duration:</strong> {request.duration} mins</p>
                                        <p><strong>Status:</strong> {request.status}</p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="edit-btn">View</button>
                                        <button className="delete-btn">Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No requests found.</p>
                        )}
                    </div>

                    {/* Request Form Popup */}
                    {showRequestPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <h2>Create New Request</h2>
                                <form onSubmit={handleSubmit}>

                                    <div className="form-group">
                                        <label className="form-label">Title:</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Video Type:</label>
                                        <select name="videoType" value={formData.videoType} onChange={handleChange} required>
                                            <option value="">Select Video Type</option>
                                            {videoTypes.map((type) => (
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

                                    <div className="form-group">
                                        <label className="form-label">Notes:</label>
                                        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional instructions or special requests..."></textarea>
                                    </div>

                                    <div className="button-group">
                                        <button type="button" className="cancel-btn" onClick={() => setShowRequestPopup(false)}>Cancel</button>
                                        <button type="submit" className="submit-btn">Submit Request</button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default RequestPage;
