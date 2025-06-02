import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
    FaHome, FaFileAlt, FaFolder, FaComments, FaBell, FaMoneyBillWave, FaEye, FaWallet
} from "react-icons/fa";
import "../styles/List.css";
import "../styles/ProjectPage.css";

function ClientPaymentList() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPayPal, setShowPayPal] = useState(false);
    const userId = localStorage.getItem("userId");
    console.log("Client userId:", userId);

    const username = localStorage.getItem("username") || "User";

    const fetchClientPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/projects/user/` + userId);
            const projects = await res.json();
            const allPayments = [];

            for (const project of projects) {
                const paymentRes = await fetch(`${BASE_URL}/api/payments/project/${project.projectId}/all`);
                if (paymentRes.ok) {
                    const paymentsData = await paymentRes.json();
                    allPayments.push(...paymentsData);
                }
            }
            setPayments(allPayments);
        } catch (err) {
            console.error("Error fetching client payments:", err);
        } finally {
            setIsLoading(false);
        }

    }, [userId, BASE_URL]);

    useEffect(() => {
        if (userId) fetchClientPayments();
    }, [userId, fetchClientPayments]);

    useEffect(() => {
        const lower = searchQuery.toLowerCase();
        const filtered = payments.filter((p) => {
            const matchTitle = p.projectTitle.toLowerCase().includes(lower);
            const matchStatus = filterStatus === "All" || p.status === filterStatus;
            return matchTitle && matchStatus;
        });
        setFilteredPayments(filtered);
    }, [searchQuery, filterStatus, payments]);

    useEffect(() => {
        if (showPayPal && selectedPayment) {
            const interval = setInterval(() => {
                if (window.paypal) {
                    const container = document.getElementById("paypal-button-container");
                    if (container) {
                        container.innerHTML = "";
                    }

                    window.paypal.Buttons({
                        createOrder: function (data, actions) {
                            return actions.order.create({
                                purchase_units: [{
                                    description: selectedPayment.description || "Project Payment",
                                    amount: {
                                        currency_code: "MYR",
                                        value: selectedPayment.amount.toFixed(2),
                                    }
                                }]
                            });
                        },
                        onApprove: async function (data, actions) {
                            const order = await actions.order.capture();
                            const transactionId = order.id;

                            const res = await fetch(`${BASE_URL}/api/payments/confirm`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    paymentId: selectedPayment.paymentId,
                                    projectId: selectedPayment.projectId,
                                    paypalTransactionId: transactionId,
                                }),
                            });

                            if (res.ok) {
                                showToastMessage("Payment successful!");
                                setShowPayPal(false);
                                fetchClientPayments();
                            } else {
                                showToastMessage("Failed to confirm payment.");
                            }

                        },
                        onError: function (err) {
                            console.error("PayPal error:", err);
                            showToastMessage("There was an error processing the payment.");
                        }

                    }).render("#paypal-button-container");

                    clearInterval(interval);
                }
            }, 300);

            return () => clearInterval(interval);
        }
    }, [showPayPal, selectedPayment, fetchClientPayments, BASE_URL]);

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/user-payments" },
        { name: "Notifications", icon: <FaBell />, path: "/client-notifications" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <section className="list-section">
                    <div className="top-bar">
                        <h1>My Payments</h1>
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
                                placeholder="Search by project title..."
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
                                        {payment.status === "pending_client_payment" && (
                                            <button
                                                className="payment-btn"
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setShowPayPal(true);
                                                }}
                                            >
                                                <FaWallet /> Pay Now
                                            </button>


                                        )}

                                        {payment.status === "paid" && (
                                            <a
                                                href={`${BASE_URL}/api/payments/invoice/${payment.projectId}/${payment.paymentId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="payment-btn"
                                            >
                                                Download Invoice
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                {/* Select Payment Pop up */}
                {showPopup && selectedPayment && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Payment Details</h2>
                            <div className="request-details">
                                <div className="detail-row"><span>Project:</span> {selectedPayment.projectTitle}</div>
                                <div className="detail-row"><span>Editor:</span> {selectedPayment.editorUsername}</div>
                                <div className="detail-row"><span>Amount:</span> RM {parseFloat(selectedPayment.amount).toFixed(2)}</div>
                                <div className="detail-row"><span>Status:</span> {selectedPayment.status === "pending_client_payment" ? "Pending" : "Paid"}</div>
                                <div className="detail-row"><span>Issued On:</span> {selectedPayment.createdAt?.seconds ? new Date(selectedPayment.createdAt.seconds * 1000).toLocaleString() : "N/A"}</div>
                                <div className="detail-row"><span>Description:</span></div>
                                <pre style={{ whiteSpace: "pre-wrap" }}>{selectedPayment.description}</pre>
                                {selectedPayment.status === "paid" && selectedPayment.privateDrive && (
                                    <div className="detail-row">
                                        <span>Final Drive:</span>
                                        <a href={selectedPayment.privateDrive} target="_blank" rel="noopener noreferrer">View</a>
                                    </div>
                                )}

                                {selectedPayment.status !== "paid" && (
                                    <div className="detail-row">
                                        <span>Final Drive:</span>
                                        <em>Complete payment to access the final product.</em>
                                    </div>
                                )}

                            </div>
                            <div className="center-button">
                                <button className="cancel-btn" onClick={() => setShowPopup(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Paypal Pop up */}
                {showPayPal && selectedPayment && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Complete Your Payment</h2>
                            <div id="paypal-button-container"></div>
                            <button className="cancel-btn" onClick={() => setShowPayPal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Toast Message*/}
                {showToast && (
                    <div className="custom-toast">
                        {toastMessage}
                    </div>
                )}

            </main>
        </div>
    );
}

export default ClientPaymentList;