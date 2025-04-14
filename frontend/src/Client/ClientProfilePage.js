import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFileAlt, FaFolder, FaComments, FaBell } from "react-icons/fa";
import "../styles/ProfilePage.css"; // 👈 create this for custom styles

function ClientProfilePage() {
    const userId = localStorage.getItem("userId");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        photoUrl: ""
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch(`http://localhost:8080/users/${userId}`);
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
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:8080/users/update-profile/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Profile updated successfully!");

                localStorage.setItem("username", formData.name);
                localStorage.setItem("profilePic", formData.photoUrl);

                fetchUserProfile();
            } else {
                alert("Failed to update profile.");
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

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
                <Header username={user?.name} />
                <div className="profile-page">
                    <div className="profile-card">
                        <img
                            className="profile-pic"
                            src={formData.photoUrl || localStorage.getItem("profilePic") || "https://via.placeholder.com/150"}
                            alt="Profile"
                        />
                        <h3>{user?.name}</h3>
                        <p>{user?.email}</p>
                        <p>{user?.phoneNumber || "No phone number yet"}</p>
                        <p>Role: {user?.role}</p>
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
                            <label>Photo URL</label>
                            <input name="photoUrl" value={formData.photoUrl} onChange={handleChange} />
                        </div>
                        <button className="save-btn" onClick={handleSave}>Save</button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ClientProfilePage;
