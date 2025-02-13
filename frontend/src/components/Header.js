import React, { useState } from "react";
import { FaSignOutAlt, FaAngleDown } from "react-icons/fa";
import '../styles/Header.css'; // Import the shared Header styles here
import { useNavigate } from "react-router-dom";

const Header = ({ username }) => {
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken"); // Clear auth token
        navigate("/"); // Redirect to login page
    };

    const handleCancelLogout = () => {
        setShowLogoutPopup(false); // Close the popup
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
                    <span className="username">Hello, {username}</span>
                    <img
                        src="https://via.placeholder.com/40" // Replace with actual profile picture URL
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
                            <button className="cancel-btn" onClick={handleCancelLogout}>
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
