import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PaypalScriptLoader from "./components/PaypalScriptLoader";
import { FaHome, FaFolder, FaComments, FaBell, FaFileAlt, FaUser, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import "./styles/TaskBoard.css";
import "./styles/List.css";

const TaskProgressBoard = () => {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const { projectId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const username = localStorage.getItem("username") || "User";
    const role = localStorage.getItem("role"); // "client" or "admin"
    const [allTasksDone, setAllTasksDone] = useState(false);
    const [showBlockedPopup, setShowBlockedPopup] = useState(false);
    const [projectTitle, setProjectTitle] = useState("");
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [projectDetails, setProjectDetails] = useState({});
    const [privateDrive, setPrivateDrive] = useState("");
    const [paymentExists, setPaymentExists] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [showClientPaymentPopup, setShowClientPaymentPopup] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [showPayPal, setShowPayPal] = useState(false);
    const [lineItems, setLineItems] = useState([]);

    const addLineItem = () => {
        setLineItems([...lineItems, { label: "", amount: "" }]);
    };

    const totalAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const statuses = ["todo", "inprogress", "done"];
    const statusLabels = {
        todo: "To Do",
        inprogress: "In Progress",
        done: "Done"
    };

    const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });

    const fetchTasks = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${projectId}/tasks`);
            const data = await res.json();

            const allDone = data.every(task => task.status?.toLowerCase() === "done");
            setAllTasksDone(allDone);

            const grouped = { todo: [], inprogress: [], done: [] };
            data.forEach(task => {
                const key = task.status?.toLowerCase().replace(/\s/g, "");
                if (grouped[key]) grouped[key].push(task);
            });

            setTasks(grouped);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }, [projectId, BASE_URL]);


    const fetchProjectTitle = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${projectId}`);
            const data = await res.json();
            setProjectTitle(data.title || "Untitled Project");
            setProjectDetails(data);
        } catch (err) {
            console.error("Error fetching project title:", err);
        }
    }, [projectId, BASE_URL]);

    const checkPaymentExists = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/payments/project/${projectId}/latest`);

            if (res.ok) {
                const data = await res.json();
                setPaymentExists(true);
                setPaymentDetails(data);
            } else {
                setPaymentExists(false);
            }

        } catch (err) {
            console.error("Error checking payment:", err);
            setPaymentExists(false);
        }
    }, [projectId, BASE_URL]);

    const showToastWithTimeout = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    useEffect(() => {
        fetchTasks();
        fetchProjectTitle();
        if (role === "user") {
            checkPaymentExists();
        }
    }, [fetchTasks, fetchProjectTitle, checkPaymentExists, role]);

    useEffect(() => {
        if (showPayPal && paymentDetails) {
            const interval = setInterval(() => {
                if (window.paypal) {
                    const container = document.getElementById("paypal-button-taskprogress");
                    if (container) container.innerHTML = "";

                    window.paypal.Buttons({
                        createOrder: (data, actions) => {
                            return actions.order.create({
                                purchase_units: [{
                                    description: paymentDetails.description || "Project Payment",
                                    amount: {
                                        currency_code: "MYR",
                                        value: parseFloat(paymentDetails.amount).toFixed(2),
                                    }
                                }]
                            });
                        },
                        onApprove: async (data, actions) => {
                            const order = await actions.order.capture();
                            const transactionId = order.id;

                            // Confirm payment with backend
                            const res = await fetch(`${BASE_URL}/api/payments/confirm`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    paymentId: paymentDetails.paymentId,
                                    projectId: paymentDetails.projectId,
                                    paypalTransactionId: transactionId,
                                }),
                            });

                            if (res.ok) {
                                alert("Payment successful!");
                                setShowPayPal(false);
                                checkPaymentExists(); // refresh payment status
                            } else {
                                alert("Failed to confirm payment.");
                            }
                        },
                        onError: (err) => {
                            console.error("PayPal error:", err);
                            alert("Error processing PayPal payment.");
                        }
                    }).render("#paypal-button-taskprogress");

                    clearInterval(interval);
                }
            }, 300);

            return () => clearInterval(interval);
        }
    }, [showPayPal, paymentDetails, BASE_URL, checkPaymentExists]);



    const menuItems = role === "admin" ? [
        { name: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/admin-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/admin-projects" },
        { name: "Chat", icon: <FaComments />, path: "/admin-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/admin-notifications" },
        { name: "Editors", icon: <FaUser />, path: "/admin-editors-list" },
        { name: "Clients", icon: <FaUsers />, path: "/admin-clients-list" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/admin-payments" }
    ] : [
        { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
        { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/user-payments" },
        { name: "Notifications", icon: <FaBell />, path: "/client-notifications" },
    ];

    const handleSubmit = useCallback(async () => {
        const formattedDescription = lineItems
            .map(item => `${item.label}: RM ${parseFloat(item.amount || 0).toFixed(2)}`)
            .join("\n");

        const payload = {
            projectId: projectDetails.projectId,
            projectTitle: projectDetails.title,
            clientId: projectDetails.userId,
            clientUsername: projectDetails.username,
            editorId: projectDetails.editorId,
            editorUsername: projectDetails.editorUsername,
            amount: totalAmount,
            description: formattedDescription,
            privateDrive: privateDrive
        };

        try {
            const res = await fetch(`${BASE_URL}/api/payments/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Payment issued successfully!");
                setShowPaymentPopup(false);
            } else {
                alert("Failed to issue payment.");
            }
        } catch (err) {
            console.error("Error creating payment:", err);
            alert("An error occurred.");
        }
    }, [
        lineItems,
        privateDrive,
        projectDetails.projectId,
        projectDetails.title,
        projectDetails.userId,
        projectDetails.username,
        projectDetails.editorId,
        projectDetails.editorUsername,
        totalAmount,
        BASE_URL
    ]);


    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                {/* Paypal Loader */}
                <PaypalScriptLoader />
                <Header username={username} />
                <section className="list-section">
                    <div className="top-bar">
                        <h1>Project Task Progress</h1>
                        <div className="project-title-header">
                            <p className="project-title-sub">Project: {projectTitle}</p>

                            {role === "admin" ? (
                                <div className="payment-btn-wrapper">
                                    <button
                                        className="issue-payment-btn"
                                        onClick={() => {
                                            if (allTasksDone) {
                                                setShowPaymentPopup(true);
                                            } else {
                                                setShowBlockedPopup(true);
                                            }
                                        }}
                                    >
                                        Issue Payment
                                    </button>
                                </div>
                            ) : role === "user" ? (
                                <div className="payment-btn-wrapper">
                                    <button
                                        className="make-payment-btn"
                                        onClick={() => {
                                            if (!paymentExists) {
                                                showToastWithTimeout("Payment is not available yet. Please wait for the admin to issue it.");
                                            } else if (!allTasksDone) {
                                                setShowBlockedPopup(true);
                                            } else {
                                                setShowClientPaymentPopup(true); // show popup
                                            }
                                        }}
                                    >
                                        Make Payment
                                    </button>


                                </div>
                            ) : null}
                        </div>

                    </div>

                    <div className="task-board">
                        {statuses.map(status => (
                            <div key={status} className={`task-column ${status}`}>
                                <h3>{statusLabels[status]}</h3>
                                {tasks[status].map((task) => (
                                    <div key={task.taskId} className="task-card">
                                        <h4>{task.title}</h4>
                                        <p>{task.description}</p>
                                        <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Task status blocked pop up*/}
                {showBlockedPopup && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h3>Action Not Allowed</h3>
                            <p>All tasks must be marked as "Done" before payment can proceed.</p>
                            <div className="popup-buttons">
                                <button className="cancel-btn" onClick={() => setShowBlockedPopup(false)}>OK</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Pop up */}
                {showPaymentPopup && (
                    <div className="popup-overlay">
                        <div className="popup-content issue-payment-popup">
                            <h2>Issue Payment</h2>

                            <div className="request-details">
                                <div className="detail-row"><span>Project:</span> {projectDetails.title}</div>
                                <div className="detail-row"><span>Client:</span> {projectDetails.username}</div>
                                <div className="detail-row"><span>Editor:</span> {projectDetails.editorUsername}</div>
                            </div>

                            <h4 style={{ marginTop: "15px", marginLeft: "8px" }}>Breakdown</h4>
                            <table className="payment-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th style={{ textAlign: "right" }}>Amount (RM)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.label}
                                                    onChange={(e) => {
                                                        const updated = [...lineItems];
                                                        updated[index].label = e.target.value;
                                                        setLineItems(updated);
                                                    }}
                                                    placeholder="e.g. Scriptwriting"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) => {
                                                        const updated = [...lineItems];
                                                        updated[index].amount = e.target.value;
                                                        setLineItems(updated);
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
                                <button className="add-row-btn" onClick={addLineItem}>➕ Add Row</button>
                            </div>

                            <p style={{ marginTop: "10px", fontWeight: "bold" }}>Total: RM {totalAmount.toFixed(2)}</p>

                            <div className="form-group">
                                <label>Final Drive Link:</label>
                                <input
                                    type="text"
                                    value={privateDrive}
                                    onChange={(e) => setPrivateDrive(e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>

                            <div className="popup-buttons">
                                <button className="cancel-btn" onClick={() => setShowPaymentPopup(false)}>Cancel</button>
                                <button className="submit-btn" onClick={handleSubmit}>Submit</button>
                            </div>
                        </div>
                    </div>

                )}

                {/* Client Make Payment Pop up */}
                {showClientPaymentPopup && paymentDetails && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Confirm Payment</h2>

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
                                <button className="cancel-btn" onClick={() => setShowClientPaymentPopup(false)}>Cancel</button>
                                <button
                                    className="submit-btn"
                                    onClick={() => {
                                        setShowClientPaymentPopup(false);
                                        setShowPayPal(true);
                                    }}
                                >
                                    Continue Payment
                                </button>

                            </div>
                        </div>
                    </div>
                )}

                {/* Show paypal popup */}
                {showPayPal && paymentDetails && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Complete Your Payment</h2>
                            <div id="paypal-button-taskprogress"></div>
                            <button className="cancel-btn" onClick={() => setShowPayPal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Payment is not available yet */}
                {showToast && (
                    <div className="custom-toast">
                        {toastMessage}
                    </div>
                )}
                <Footer />
            </main>
        </div>
    );
};

export default TaskProgressBoard;
