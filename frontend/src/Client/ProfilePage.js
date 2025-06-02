import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
    FaHome,
    FaFileAlt,
    FaFolder,
    FaComments,
    FaBell,
    FaPlusCircle, FaMoneyBillWave, FaUser, FaUsers
} from "react-icons/fa";
import "../styles/ProfilePage.css";

function ProfilePage() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        photoUrl: ""
    });

    const fetchUserProfile = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/users/${userId}`);
            const data = await res.json();
            setUser(data);
            setFormData({
                name: data.name || "",
                email: data.email || "",
                password: "",
                phoneNumber: data.phoneNumber || "",
                photoUrl: data.photoUrl || ""
            });
            localStorage.setItem("profilePic", data.photoUrl || "");
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    }, [userId, BASE_URL]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${BASE_URL}/users/update-profile/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToastMessage("Profile updated successfully!");
                localStorage.setItem("username", formData.name);
                localStorage.setItem("profilePic", formData.photoUrl);
                fetchUserProfile();
            } else {
                showToastMessage("Fail to update profile.");

            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    let menuItems = [];
    if (role === "admin") {
        menuItems = [
            { name: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
            { name: "Requests", icon: <FaFileAlt />, path: "/admin-requests" },
            { name: "Projects", icon: <FaFolder />, path: "/admin-projects" },
            { name: "Chat", icon: <FaComments />, path: "/admin-chat-list" },
            { name: "Notifications", icon: <FaBell />, path: "/admin-notifications" },
            { name: "Editors", icon: <FaUser />, path: "/admin-editors-list" },
            { name: "Clients", icon: <FaUsers />, path: "/admin-clients-list" },
            { name: "Payments", icon: <FaMoneyBillWave />, path: "/admin-payments" }
        ];
    } else if (role === "editor") {
        menuItems = [
            { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
            { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
            { name: "Chat", icon: <FaComments />, path: "/editor-chat-list" },
            { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" },
        ];
    } else {
        menuItems = [
            { name: "Dashboard", icon: <FaHome />, path: "/user-dashboard" },
            { name: "Requests", icon: <FaFileAlt />, path: "/user-requests" },
            { name: "Projects", icon: <FaFolder />, path: "/user-projects" },
            { name: "Chat", icon: <FaComments />, path: "/user-chat-list" },
            { name: "Payments", icon: <FaMoneyBillWave />, path: "/user-payments" },
            { name: "Notifications", icon: <FaBell />, path: "/client-notifications" },
        ];
    }

    return (
        <div className="dashboard-container">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                menuItems={menuItems}
            />
            <main className="main-content">
                <Header username={user?.name} />
                <div className="profile-page">
                    <div className="profile-card">
                        <div className="profile-pic-wrapper">
                            <img
                                className="profile-pic"
                                src={formData.photoUrl?.trim() ? formData.photoUrl : "/default_avatar.png"}
                                alt="Profile"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default_avatar.png";
                                }}
                            />


                            <label htmlFor="photoUpload" className="upload-icon">
                                <FaPlusCircle />
                            </label>
                            <input
                                id="photoUpload"
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImageUpload}
                            />
                        </div>

                        <h3 style={{ marginBottom: "10px" }}>{user?.name}</h3>

                        <div className="profile-info-line">
                            <span className="profile-icon"><FaFileAlt /></span>
                            <p>{user?.email}</p>
                        </div>
                        <div className="profile-info-line">
                            <span className="profile-icon"><FaComments /></span>
                            <p>{formData.phoneNumber || "No phone number yet"}</p>
                        </div>
                        <div className="profile-info-line">
                            <span className="profile-icon"><FaFolder /></span>
                            <p>Role: {user?.role}</p>
                        </div>
                    </div>

                    <div className="profile-form">
                        <h2>Profile Settings</h2>
                        <div className="form-group">
                            <label>Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input name="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Photo URL (optional)</label>
                            <input name="photoUrl" value={formData.photoUrl} onChange={handleChange} />
                        </div>
                        <button className="save-btn" onClick={handleSave}>Save</button>
                    </div>
                </div>

                {/* Show Toast Message */}
                {showToast && (
                    <div className="custom-toast">
                        {toastMessage}
                    </div>
                )}

            </main>
        </div>
    );
}

export default ProfilePage;
