import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaTrash, FaEye, FaUser, FaUsers, FaCheck, FaTimes } from "react-icons/fa";
import "../styles/List.css";

function AdminRequestPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [username, setUsername] = useState("Admin");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [showAcceptPopup, setShowAcceptPopup] = useState(false);
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [adminComment, setAdminComment] = useState("");
    const [assignedEditor, setAssignedEditor] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [editors, setEditors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");



    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchRequests();
        fetchEditors();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/requests/all");
            if (response.ok) {
                let data = await response.json();
                console.log("Fetched data:", data);


                // ✅ Replace userId with username for frontend display
                const updatedRequests = await Promise.all(
                    data.map(async (request) => {
                        const userResponse = await fetch(`http://localhost:8080/api/users/${request.userId}`);
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            return { ...request, username: userData.name };
                        }
                        return request;
                    })
                );

                setRequests(updatedRequests);
            } else {
                alert("Failed to load requests.");
            }
        } catch (error) {
            console.error("Error fetching requests: ", error);
        } finally {
            setIsLoading(false);
        }
    };


    // Get the editors dropdown list
    const fetchEditors = async () => {
        try {
            const response = await fetch("http://localhost:8080/users/editors");

            if (!response.ok) {
                throw new Error(`Failed to fetch editors: ${response.statusText}`);
            }

            const data = await response.json();

            // ✅ Ensure data is an array and contains the required fields
            if (!Array.isArray(data)) {
                throw new Error("Invalid editor data format received.");
            }

            setEditors(data);
            console.log("Fetched Editors:", data);
        } catch (error) {
            console.error("Error fetching editors:", error);
            alert("Failed to load editors. Please check the API connection.");
        }
    };

    // Handling Accepted Request
    const handleAcceptRequest = async () => {
        if (!adminComment || !assignedEditor) {
            alert("Please provide a comment and select an editor.");
            return;
        }
        const adminUserId = localStorage.getItem("userId"); // Get admin user ID from localStorage


        try {
            const response = await fetch(`http://localhost:8080/api/requests/process/${selectedRequest.requestId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "Accepted",
                    comment: adminComment,
                    editorId: assignedEditor,
                    adminUserId: adminUserId
                })
            });

            if (response.ok) {
                alert("Request Accepted Successfully!");
                setShowAcceptPopup(false);
                fetchRequests(); // Refresh requests
            } else {
                alert("Failed to process request.");
            }
        } catch (error) {
            console.error("Error processing request: ", error);
        }
    };

    // Handling Rejected Request
    const handleRejectRequest = async () => {
        if (!rejectionReason) {
            alert("Please provide a reason for rejection.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/requests/process/${selectedRequest.requestId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "Rejected",
                    comment: rejectionReason
                })
            });

            if (response.ok) {
                alert("Request Rejected Successfully!");
                setShowRejectPopup(false);
                fetchRequests(); // Refresh requests
            } else {
                alert("Failed to process request.");
            }
        } catch (error) {
            console.error("Error processing request: ", error);
        }
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


    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setShowViewPopup(true);
    };

    const filteredRequests = requests.filter((req) => {
        const matchesStatus = filterStatus === "All" || req.status === filterStatus;
        const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });


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
                        <h1>All User Requests</h1>
                        <select className="filter-dropdown" onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title"
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
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <div className="list-card" key={request.requestId}>
                                    <div className="list-details sleek-card-info">
                                        <h3 className="list-title">{request.title}</h3>
                                        <p>User: {request.username || "Unknown"}</p>
                                        <p>Video Type: {request.videoType}</p>
                                        <p>Duration: {request.duration} mins</p>
                                        <p>
                                            <span className={`status-badge ${request.status.toLowerCase()}`}>
                                                {request.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="view-btn" onClick={() => handleViewRequest(request)}><FaEye /> View</button>
                                        <button className="accept-btn" onClick={() => { setSelectedRequest(request); setShowAcceptPopup(true); }}><FaCheck /> Accept</button>
                                        <button className="reject-btn" onClick={() => { setSelectedRequest(request); setShowRejectPopup(true); }}><FaTimes /> Reject</button>
                                        <button className="delete-btn" onClick={() => handleDelete(request)}><FaTrash /> Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No requests found.</p>
                        )}
                    </div>
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

                        <div className="popup-buttons">
                            <button className="cancel-btn" onClick={() => setShowViewPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}



            {/* Accept Request Popup */}
            {showAcceptPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Accept Request</h2>

                        <div className="form-group">
                            <label>Admin Comment:</label>
                            <textarea value={adminComment} onChange={(e) => setAdminComment(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Assign Editor:</label>
                            <select value={assignedEditor} onChange={(e) => setAssignedEditor(e.target.value)}>
                                <option value="">Select Editor</option>
                                {editors.map((editor) => (
                                    <option key={editor.userId} value={editor.userId}>{editor.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="popup-buttons">
                            <button className="cancel-btn" onClick={() => setShowAcceptPopup(false)}>Cancel</button>
                            <button className="accept-btn" onClick={handleAcceptRequest}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Request Popup */}
            {showRejectPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Reject Request</h2>
                        <div className="form-group">
                            <label>Reason for Rejection:</label>
                            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                        </div>
                        <div className="popup-buttons">
                            <button className="cancel-btn" onClick={() => setShowRejectPopup(false)}>Cancel</button>
                            <button className="accept-btn" onClick={handleRejectRequest}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminRequestPage;

