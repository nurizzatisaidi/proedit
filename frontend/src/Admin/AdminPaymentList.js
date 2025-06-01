import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
    FaHome, FaFolder, FaFileAlt, FaUser, FaUsers, FaComments, FaBell, FaEye, FaTrash, FaMoneyBillWave, FaEdit
} from "react-icons/fa";
import "../styles/List.css";
import "../styles/ProjectPage.css";

function AdminPaymentList() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
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
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const username = localStorage.getItem("username") || "Admin";

    const fetchAllPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/payments/all-projects-payments`);
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
    }, [BASE_URL]);

    useEffect(() => {
        fetchAllPayments();
    }, [fetchAllPayments]);

    const deletePayment = async (payment) => {

        try {
            const response = await fetch(`${BASE_URL}/api/payments/${payment.projectId}/${payment.paymentId}`, {
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

    const [breakdownRows, setBreakdownRows] = useState([
        { label: "", amount: 0 }
    ]);
    const [privateDriveLink, setPrivateDriveLink] = useState("");


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
                                        {payment.status === "pending_client_payment" && (
                                            <button
                                                className="edit-btn"
                                                onClick={() => {
                                                    setSelectedPayment(payment);

                                                    // Populate breakdown rows from description string
                                                    const parsedBreakdown = payment.description
                                                        ? payment.description.split("\n").map(line => {
                                                            const [label, amountPart] = line.split(": RM ");
                                                            return { label: label.trim(), amount: parseFloat(amountPart) || 0 };
                                                        })
                                                        : [{ label: "", amount: 0 }];
                                                    setBreakdownRows(parsedBreakdown);

                                                    // Populate private drive link
                                                    setPrivateDriveLink(payment.privateDrive || "");

                                                    setShowUpdatePopup(true);
                                                }}
                                            >
                                                <FaEdit /> Edit
                                            </button>

                                        )}
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
                                {selectedPayment.status === "paid" && selectedPayment.privateDrive && (
                                    <div className="detail-row">
                                        <span>Final Drive:</span>
                                        <a href={selectedPayment.privateDrive} target="_blank" rel="noopener noreferrer">
                                            View Drive Link
                                        </a>
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

                {/* Update Payment for NOT PAID YET */}
                {showUpdatePopup && selectedPayment && (
                    <div className="popup-overlay">
                        <div className="popup-content issue-payment-popup">
                            <h2>Edit Payment</h2>

                            <h4 style={{ marginTop: "15px", marginLeft: "8px" }}>Breakdown</h4>
                            <table className="payment-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th style={{ textAlign: "right" }}>Amount (RM)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdownRows.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.label}
                                                    onChange={(e) => {
                                                        const updated = [...breakdownRows];
                                                        updated[index].label = e.target.value;
                                                        setBreakdownRows(updated);
                                                    }}
                                                    placeholder="e.g. Scriptwriting"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) => {
                                                        const updated = [...breakdownRows];
                                                        updated[index].amount = parseFloat(e.target.value) || 0;
                                                        setBreakdownRows(updated);
                                                    }}
                                                    placeholder="0.00"
                                                    style={{ textAlign: "right" }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="add-row-wrapper">
                                <button className="add-row-btn" onClick={() => setBreakdownRows([...breakdownRows, { label: "", amount: 0 }])}>
                                    ➕ Add Row
                                </button>
                            </div>

                            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                                Total: RM {breakdownRows.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2)}
                            </p>

                            <div className="form-group">
                                <label>Final Drive Link:</label>
                                <input
                                    type="text"
                                    value={privateDriveLink}
                                    onChange={(e) => setPrivateDriveLink(e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>

                            <div className="popup-buttons">
                                <button className="cancel-btn" onClick={() => setShowUpdatePopup(false)}>Cancel</button>
                                <button
                                    className="submit-btn"
                                    onClick={async () => {
                                        const totalAmount = breakdownRows.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                                        const description = breakdownRows.map(item => `${item.label}: RM ${parseFloat(item.amount).toFixed(2)}`).join("\n");

                                        try {
                                            const response = await fetch(`${BASE_URL}/api/payments/${selectedPayment.projectId}/${selectedPayment.paymentId}`, {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    amount: totalAmount,
                                                    description: description,
                                                    privateDrive: privateDriveLink,
                                                }),
                                            });

                                            if (response.ok) {
                                                showToastMessage("Payment updated successfully.");
                                                setShowUpdatePopup(false);
                                                fetchAllPayments();
                                            } else {
                                                showToastMessage("Failed to update payment.");
                                            }
                                        } catch (error) {
                                            console.error("Update error:", error);
                                            showToastMessage("Error updating payment.");
                                        }
                                    }}
                                >
                                    Save
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