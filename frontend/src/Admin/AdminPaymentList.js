import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
    FaHome, FaFolder, FaFileAlt, FaUser, FaUsers, FaComments, FaBell, FaEye, FaTrash, FaMoneyBillWave
} from "react-icons/fa";
import "../styles/List.css";
import "../styles/ProjectPage.css";

function AdminPaymentList() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const username = localStorage.getItem("username") || "Admin";

    useEffect(() => {
        fetchAllPayments();
    }, []);

    const fetchAllPayments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/payments/all-projects-payments");
            const data = await response.json();
            if (Array.isArray(data)) {
                setPayments(data);
            } else {
                setPayments([]);
                console.error("Expected an array but got:", data);
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deletePayment = async (payment) => {

        try {
            const response = await fetch(`http://localhost:8080/api/payments/${payment.projectId}/${payment.paymentId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showToastMessage("Payment deleted successfully.");
                fetchAllPayments();
            } else {
                showToastMessage("Failed to delete payment.");
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
            alert("An error occurred while deleting.");
        }
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    useEffect(() => {
        const lowerSearch = searchQuery.toLowerCase();
        const filtered = payments.filter((p) => {
            const matchTitle = p.projectTitle.toLowerCase().includes(lowerSearch);
            const matchClient = p.clientUsername.toLowerCase().includes(lowerSearch);
            const matchStatus = filterStatus === "All" || p.status === filterStatus;
            return (matchTitle || matchClient) && matchStatus;
        });
        setFilteredPayments(filtered);
    }, [searchQuery, filterStatus, payments]);

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
                        <h1>All Payments</h1>
                    </div>

                    <div className="project-filters">
                        <select
                            className="project-filter-dropdown"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="pending_client_payment">Pending</option>
                            <option value="paid">Paid</option>
                        </select>

                        <div className="search-wrapper">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by title or client..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="list">
                        {isLoading ? (
                            <div style={{ textAlign: "center" }}>
                                <div className="spinner"></div>
                                <p>Loading payments...</p>
                            </div>
                        ) : filteredPayments.length === 0 ? (
                            <div className="no-message">No payments found.</div>
                        ) : (
                            filteredPayments.map((payment) => (
                                <div className="list-card" key={payment.paymentId}>
                                    <div className="list-details sleek-card-info">
                                        <h3 className="list-title">{payment.projectTitle}</h3>
                                        <p>Client: {payment.clientUsername}</p>
                                        <p>Editor: {payment.editorUsername}</p>
                                        <p>Amount: RM {parseFloat(payment.amount).toFixed(2)}</p>
                                        <p>Issued On: {payment.createdAt?.seconds ? new Date(payment.createdAt.seconds * 1000).toLocaleString() : "N/A"}</p>
                                        <p>
                                            <span className={`status-badge ${payment.status}`}>
                                                {payment.status === "pending_client_payment" ? "Pending" : "Paid"}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="list-actions">
                                        <button className="view-btn" onClick={() => {
                                            setSelectedPayment(payment);
                                            setShowPopup(true);
                                        }}>
                                            <FaEye /> View
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => {
                                                setPaymentToDelete(payment);
                                                setShowDeletePopup(true);
                                            }}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {showPopup && selectedPayment && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Payment Details</h2>
                            <div className="request-details">
                                <div className="detail-row"><span>Project:</span> {selectedPayment.projectTitle}</div>
                                <div className="detail-row"><span>Client:</span> {selectedPayment.clientUsername}</div>
                                <div className="detail-row"><span>Editor:</span> {selectedPayment.editorUsername}</div>
                                <div className="detail-row"><span>Amount:</span> RM {parseFloat(selectedPayment.amount).toFixed(2)}</div>
                                <div className="detail-row"><span>Status:</span> {selectedPayment.status === "pending_client_payment" ? "Pending" : "Paid"}</div>
                                <div className="detail-row"><span>Issued On:</span> {selectedPayment.createdAt?.seconds ? new Date(selectedPayment.createdAt.seconds * 1000).toLocaleString() : "N/A"}</div>
                                <div className="detail-row"><span>Description:</span></div>
                                <pre style={{ whiteSpace: "pre-wrap" }}>{selectedPayment.description}</pre>
                                {selectedPayment.paypalTransactionId && (
                                    <div className="detail-row">
                                        <span>PayPal ID:</span> {selectedPayment.paypalTransactionId}
                                    </div>
                                )}
                            </div>
                            <div className="center-button">
                                <button className="cancel-btn" onClick={() => setShowPopup(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Payment Popup */}
                {showDeletePopup && paymentToDelete && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Confirm Delete</h2>
                            <p>Are you sure you want to delete the payment for <strong>{paymentToDelete.projectTitle}</strong>?</p>

                            <div className="popup-buttons">

                                <button
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowDeletePopup(false);
                                        setPaymentToDelete(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={async () => {
                                        await deletePayment(paymentToDelete);
                                        setShowDeletePopup(false);
                                        setPaymentToDelete(null);
                                    }}
                                >
                                    Delete
                                </button>
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


            </main>
        </div>
    );
}

export default AdminPaymentList;