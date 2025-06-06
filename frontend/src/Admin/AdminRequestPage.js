import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaTrash, FaEye, FaUser, FaUsers, FaCheck, FaTimes, FaMoneyBillWave } from "react-icons/fa";
import "../styles/List.css";

function AdminRequestPage() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
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
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showCannotDeletePopup, setShowCannotDeletePopup] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/requests/all`);
            if (response.ok) {
                let data = await response.json();
                console.log("Fetched data:", data);

                const updatedRequests = await Promise.all(
                    data.map(async (request) => {
                        const userResponse = await fetch(`${BASE_URL}/api/users/${request.userId}`);
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
    }, [BASE_URL]);

    // Get the editors dropdown list
    const fetchEditors = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/users/editors`);

            if (!response.ok) {
                throw new Error(`Failed to fetch editors: ${response.statusText}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid editor data format received.");
            }

            setEditors(data);
            console.log("Fetched Editors:", data);
        } catch (error) {
            console.error("Error fetching editors:", error);
            alert("Failed to load editors. Please check the API connection.");
        }
    }, [BASE_URL]);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        fetchRequests();
        fetchEditors();
    }, [fetchRequests, fetchEditors]);

    // Handling Accepted Request
    const handleAcceptRequest = async () => {
        if (!adminComment.trim()) {
            showToastMessage("Please enter an admin comment.");
            return;
        }
        if (!assignedEditor) {
            showToastMessage("Please select an editor.");
            return;
        }

        const adminUserId = localStorage.getItem("userId");


        try {
            const response = await fetch(`${BASE_URL}/api/requests/process/${selectedRequest.requestId}`, {
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
                showToastMessage("Request accepted successfully!");

                setShowAcceptPopup(false);
                fetchRequests();
            } else {
                showToastMessage("Failed to process request.");
            }
        } catch (error) {
            console.error("Error processing request: ", error);
        }
    };

    // Handling Rejected Request
    const handleRejectRequest = async () => {
        if (!rejectionReason.trim()) {
            showToastMessage("Please enter a reason for rejection.");
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/api/requests/process/${selectedRequest.requestId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "Rejected",
                    comment: rejectionReason
                })
            });

            if (response.ok) {
                showToastMessage("Request rejected successfully!");

                setShowRejectPopup(false);
                fetchRequests();
            } else {
                showToastMessage("Failed to process request.");
            }
        } catch (error) {
            console.error("Error processing request: ", error);
        }
    };

    const confirmDelete = (request) => {
        if (request.status === "Accepted") {
            setShowCannotDeletePopup(true);
            return;
        }
        setRequestToDelete(request);
        setShowDeletePopup(true);
    };


    const handleDeleteConfirmed = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/requests/delete/${requestToDelete.requestId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showToastMessage("Request deleted successfully!");

                setShowDeletePopup(false);
                fetchRequests();
            } else {
                showToastMessage("Failed to delete request.");
            }
        } catch (error) {
            console.error("Error deleting request: ", error);
        }
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
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
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/admin-payments" }
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <section className="list-section">
                    <div className="top-bar">
                        <h1>All User Requests</h1>
                        <select className="project-filter-dropdown" onChange={(e) => setFilterStatus(e.target.value)}>
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
                                        <button
                                            className="view-btn"
                                            onClick={() => handleViewRequest(request)}
                                        >
                                            <FaEye /> View
                                        </button>

                                        <button
                                            className="accept-btn"
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setShowAcceptPopup(true);
                                            }}
                                            disabled={request.status !== "Pending"}
                                            style={{
                                                opacity: request.status !== "Pending" ? 0.5 : 1,
                                                cursor: request.status !== "Pending" ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            <FaCheck /> Accept
                                        </button>

                                        <button
                                            className="reject-btn"
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setShowRejectPopup(true);
                                            }}
                                            disabled={request.status !== "Pending"}
                                            style={{
                                                opacity: request.status !== "Pending" ? 0.5 : 1,
                                                cursor: request.status !== "Pending" ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            <FaTimes /> Reject
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() => confirmDelete(request)}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <p>No requests found.</p>
                        )}
                    </div>
                </section>
                <Footer />
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

            {/* Delete Request Popup */}
            {showDeletePopup && (
                <div className="logout-popup">
                    <div className="popup-content">
                        <h3>Are you sure you want to delete this request?</h3>
                        <div className="popup-actions">
                            <button className="cancel-btn" onClick={() => setShowDeletePopup(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={handleDeleteConfirmed}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cannot Delete Request Popup */}
            {showCannotDeletePopup && (
                <div className="logout-popup">
                    <div className="popup-content">
                        <h3>Cannot delete an accepted request.</h3>
                        <p style={{ marginTop: "10px", fontSize: "14px" }}>
                            Once a request is accepted and assigned to an editor, it cannot be removed.
                        </p>
                        <div className="popup-actions">
                            <button className="confirm-btn" onClick={() => setShowCannotDeletePopup(false)}>Okay</button>
                        </div>
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

export default AdminRequestPage;

