import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaFileAlt, FaFolder, FaComments, FaBell, FaHome, FaPlus, FaEye, FaTrash } from "react-icons/fa";
import "../styles/RequestPage.css";
import "../styles/List.css";

function RequestPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showRequestPopup, setShowRequestPopup] = useState(false);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requests, setRequests] = useState([]);
    const [username, setUsername] = useState("user");
    const [searchQuery, setSearchQuery] = useState("");


    const hasShownNoRequestsAlert = useRef(false);

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

        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/requests/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched Requests:", data);
                setRequests(data);

                if (data.length === 0 && !hasShownNoRequestsAlert.current) {
                    alert("You have no requests yet.");
                    hasShownNoRequestsAlert.current = true;
                }

            } else {
                alert("Failed to load requests.");
            }
        } catch (error) {
            console.error("Error fetching requests: ", error);
        }
    };


    const videoTypes = ["Tutorial", "Presentation", "Marketing", "Animation", "Interview", "Teaching"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setShowViewPopup(true);
    };

    const handleDelete = async (request) => {
        if (request.status === "Accepted") {
            alert("You cannot delete an accepted request.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this request?")) return;

        try {
            const response = await fetch(`http://localhost:8080/api/requests/delete/${request.requestId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Request deleted successfully.");
                fetchRequests();
            } else {
                alert("Failed to delete request.");
            }
        } catch (error) {
            console.error("Error deleting request: ", error);
        }
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

                fetchRequests();
            } else {
                alert("Failed to submit request.");
            }
        } catch (error) {
            console.error("Error submitting request: ", error);
            alert("Error submitting request.");
        }
    };

    const filteredRequests = requests.filter((req) =>
        req.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
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
                    <input
                        type="text"
                        placeholder="Search by title"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="list">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <div className="list-card" key={request.requestId}>
                                    <div className="list-details sleek-card-info">
                                        <h3 className="list-title">{request.title}</h3>
                                        <p>Video Type: {request.videoType}</p>
                                        <p>
                                            <span className={`status-badge ${request.status.toLowerCase()}`}>
                                                {request.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="view-btn" onClick={() => handleViewRequest(request)}>
                                            <FaEye /> View
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(request)}>
                                            <FaTrash /> Delete
                                        </button>
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
                                        <input
                                            type="url"
                                            name="sharedDrive"
                                            value={formData.sharedDrive}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>
                                    <div className="form-note">
                                        Please ensure your Google Drive link contains the raw video files so our E-Flix editors can access them for editing. <br />
                                        <strong>Note:</strong> Uploading high-quality video files is highly recommended to ensure the best editing results and to prevent your request from being rejected due to poor video quality.
                                    </div>



                                    <div className="form-group">
                                        <label className="form-label">Notes:</label>
                                        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional instructions or special requests..."></textarea>
                                    </div>

                                    <div className="popup-buttons">
                                        <button type="button" className="cancel-btn" onClick={() => setShowRequestPopup(false)}>Cancel</button>
                                        <button type="submit" className="submit-btn">Submit Request</button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    )}

                </section>
            </main>

            {/* View Request Popup */}
            {showViewPopup && selectedRequest && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Request Details</h2>

                        <div className="request-details">
                            <div className="detail-row">
                                <p><span>Title:</span> {selectedRequest.title}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Username:</span> {selectedRequest.username}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Video Type:</span> {selectedRequest.videoType}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Duration:</span> {selectedRequest.duration} mins</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Created At:</span> {selectedRequest.createdAt ? new Date(selectedRequest.createdAt.seconds * 1000).toLocaleString() : "N/A"}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Notes:</span> {selectedRequest.notes || "No notes provided"}</p>
                            </div>
                            <div className="detail-row">
                                <p><span>Shared Drive:</span>
                                    {selectedRequest.sharedDrive ?
                                        <a href={selectedRequest.sharedDrive} target="_blank" rel="noopener noreferrer"> View Drive </a>
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

export default RequestPage;
