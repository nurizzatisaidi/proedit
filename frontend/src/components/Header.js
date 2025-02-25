import React, { useState, useEffect } from "react";
import { FaSignOutAlt, FaAngleDown } from "react-icons/fa";
import "../styles/Header.css"; // Import the shared Header styles
import { useNavigate } from "react-router-dom";

const Header = ({ username }) => {
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const navigate = useNavigate();

    // ✅ Get user details from localStorage
    const storedUsername = localStorage.getItem("username") || "Guest";
    const storedProfilePic = localStorage.getItem("profilePic") || "https://via.placeholder.com/40";

    // ✅ Use the prop if available, otherwise use localStorage
    const displayUsername = username || storedUsername;

    const handleLogout = () => {
        // ✅ Remove all stored user data
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        localStorage.removeItem("profilePic");

        navigate("/"); // Redirect to login page
    };

    return (
        <>
            <header className="header">
                <div className="header-left">
                    <img src="/Proedit_Logo.png" alt="ProEdit Logo" className="header-logo" />
                    <div className="vertical-line"></div>
                    <span className="header-title">ProEdit</span>
                </div>
                <div className="header-right">
                    <FaAngleDown className="dropdown-icon" />
                    <span className="username">Hello, {displayUsername}</span>
                    <img
                        src={storedProfilePic} // ✅ Dynamic profile picture
                        alt="Profile"
                        className="profile-picture"
                    />
                    <button
                        className="logout-btn"
                        title="Logout"
                        onClick={() => setShowLogoutPopup(true)}
                    >
                        <FaSignOutAlt />
                    </button>
                </div>
            </header>
            {showLogoutPopup && (
                <div className="logout-popup">
                    <div className="popup-content">
                        <h3>Are you sure you want to logout?</h3>
                        <div className="popup-actions">
                            <button className="cancel-btn" onClick={() => setShowLogoutPopup(false)}>
                                Cancel
                            </button>
                            <button className="confirm-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
