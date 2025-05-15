import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaFileAlt, FaFolder, FaComments, FaBell, FaHome, FaEye, FaTasks, FaMoneyBill, FaMoneyBillWave } from "react-icons/fa";
import "../styles/ProjectPage.css";
import "../styles/List.css";

function ClientProjectPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("user");
    const [toastMessage, setToastMessage] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showToast, setShowToast] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [paymentPopupProjectId, setPaymentPopupProjectId] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [paymentMap, setPaymentMap] = useState({}); // key = projectId, value = payment data or null




    const hasShownNoProjectsAlert = useRef(false);

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        if (storedName) {
            setUsername(storedName);
        }

        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/projects/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched Projects:", data);
                setProjects(data);
                for (const project of data) {
                    try {
                        const res = await fetch(`http://localhost:8080/api/payments/project/${project.projectId}/latest`);

                        if (res.ok) {
                            const paymentData = await res.json();
                            setPaymentMap(prev => ({ ...prev, [project.projectId]: paymentData }));
                        } else {
                            setPaymentMap(prev => ({ ...prev, [project.projectId]: null }));
                        }
                    } catch (err) {
                        setPaymentMap(prev => ({ ...prev, [project.projectId]: null }));
                    }
                }


                if (data.length === 0 && !hasShownNoProjectsAlert.current) {
                    showToastMessage("You have no projects yet.");
                    hasShownNoProjectsAlert.current = true;
                }

            } else {
                alert("Failed to load projects.");
            }
        } catch (error) {
            console.error("Error fetching projects: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewProject = (project) => {
        setSelectedProject(project);
        setShowViewPopup(true);
    };

    const handleViewPaymentDetails = (projectId) => {
        const payment = paymentMap[projectId];
        if (payment) {
            setPaymentDetails(payment);
            setPaymentPopupProjectId(projectId);
        } else {
            showToastMessage("Payment has not been issued yet by the admin.");
        }
    };



    const filteredProjects = projects.filter((project) => {
        const matchesTitle = project.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || project.status === statusFilter;
        return matchesTitle && matchesStatus;
    });

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };


    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/user-payments" },
        { name: "Notifications", icon: <FaBell />, path: "/user-notifications" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />

                <section className="list-section">
                    <div className="top-bar">
                        <h1>My Projects</h1>
                    </div>

                    {/* Display List of Requests */}
                    <div className="proj-filters">
                        <select
                            className="proj-filter-dropdown"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Search by title..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>


                    <div className="list">
                        {isLoading ? (
                            <div style={{ textAlign: "center" }}>
                                <div className="spinner"></div>
                                <p>Loading requests...</p>
                            </div>
                        ) : filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <div className="list-card" key={project.projectId}>
                                    <div className="list-details sleek-card-info">
                                        <h3 className="list-title">{project.title}</h3>
                                        <p>Video Type: {project.videoType}</p>
                                        <p>
                                            <span className={`status-badge ${project.status.toLowerCase()}`}>
                                                {project.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="view-btn" onClick={() => handleViewProject(project)}>
                                            <FaEye /> View
                                        </button>
                                        <button
                                            className="board-btn"
                                            onClick={() => window.location.href = `/client-projects/${project.projectId}/progress`}
                                        >
                                            <FaTasks /> Task Board
                                        </button>
                                        <button
                                            className="payment-btn"
                                            onClick={() => handleViewPaymentDetails(project.projectId)}
                                        >
                                            <FaMoneyBill /> View Payment
                                        </button>


                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-message">
                                <p>No projects found.</p>
                            </div>

                        )}
                    </div>

                </section>
            </main>

            {/* View Request Popup */}
            {showViewPopup && selectedProject && (
                <div className="project-popup-overlay">
                    <div className="project-popup-content">
                        <h2>Project Details</h2>

                        <div className="project-details">
                            <div className="project-detail-row">
                                <p><span>Title:</span> {selectedProject.title}</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Assigned Editor:</span> {selectedProject.editorUsername}</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Video Type:</span> {selectedProject.videoType}</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Duration:</span> {selectedProject.duration} mins</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Notes:</span> {selectedProject.notes || "No notes provided"}</p>
                            </div>
                            <div className="project-detail-row">
                                <p><span>Shared Drive:</span>
                                    {selectedProject.sharedDrive ?
                                        <a href={selectedProject.sharedDrive} target="_blank" rel="noopener noreferrer"> View Drive </a>
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

            {paymentPopupProjectId && paymentDetails && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Payment Details</h2>

                        <div className="request-details">
                            <div className="detail-row"><span>Project:</span> {paymentDetails.projectTitle}</div>
                            <div className="detail-row"><span>Issued By:</span> {paymentDetails.clientUsername}</div>
                            <div className="detail-row"><span>Editor:</span> {paymentDetails.editorUsername}</div>
                            <div className="detail-row">
                                <span>Issued On:</span>{" "}
                                {paymentDetails.createdAt?.seconds
                                    ? new Date(paymentDetails.createdAt.seconds * 1000).toLocaleString()
                                    : "N/A"}
                            </div>
                            <div className="detail-row"><span>Amount:</span> RM {parseFloat(paymentDetails.amount).toFixed(2)}</div>
                            <div className="detail-row"><span>Description:</span></div>
                            <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>{paymentDetails.description}</pre>

                        </div>

                        {paymentDetails.status === "pending_client_payment" && (
                            <p style={{ marginTop: "10px", color: "red", fontWeight: "bold" }}>
                                Payment is Pending.
                            </p>
                        )}

                        <div className="popup-buttons">
                            <button className="cancel-btn" onClick={() => setPaymentPopupProjectId(null)}>Close</button>
                            {paymentDetails.status === "pending_client_payment" && (
                                <button className="submit-btn" onClick={() => {
                                    alert("Redirecting to PayPal...");
                                    setPaymentPopupProjectId(null);
                                }}>
                                    Continue Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Toast Message Popup */}
            {showToast && (
                <div className="custom-toast">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

export default ClientProjectPage;
