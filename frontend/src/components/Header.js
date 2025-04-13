import React, { useState, useRef, useEffect } from "react";
import { FaSignOutAlt, FaAngleDown, FaAngleUp, FaUser, FaCog, FaKey, FaQuestionCircle } from "react-icons/fa";
import "../styles/Header.css";
import { useNavigate } from "react-router-dom";

const Header = ({ username }) => {
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Get user details from localStorage
    const storedUsername = localStorage.getItem("username") || "Guest";
    const storedProfilePic = localStorage.getItem("profilePic") || "https://via.placeholder.com/40";

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Show logout confirmation popup instead of logging out immediately
    const handleLogoutRequest = () => {
        setShowDropdown(false);
        setShowLogoutPopup(true);
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        localStorage.removeItem("profilePic");
        navigate("/");
    };

    return (
        <>
            <header className="header">
                <div className="header-left">
                    <img src="/Proedit_Logo.png" alt="ProEdit Logo" className="header-logo" />
                    <div className="vertical-line"></div>
                    <span className="header-title">ProEdit</span>
                </div>
                <div className="header-right" ref={dropdownRef}>
                    <span className="username">Hello, {username || storedUsername}</span>

                    <img
                        src={storedProfilePic}
                        alt="Profile"
                        className="profile-picture"
                    />

                    {showDropdown ? (
                        <FaAngleUp className="dropdown-icon" onClick={toggleDropdown} />
                    ) : (
                        <FaAngleDown className="dropdown-icon" onClick={toggleDropdown} />
                    )}

                    {showDropdown && (
                        <div className="dropdown-menu">
                            <ul>
                                <li
                                    onClick={() => {
                                        const role = localStorage.getItem("userRole");
                                        if (role === "admin") navigate("/admin-myprofile");
                                        else if (role === "editor") navigate("/editor-myprofile");
                                        else navigate("/client-myprofile");
                                    }}
                                >
                                    <FaUser /> My Profile
                                </li>

                                <li onClick={() => navigate("/settings")}>
                                    <FaCog /> Settings
                                </li>
                                <li onClick={() => navigate("/change-password")}>
                                    <FaKey /> Change Password
                                </li>
                                <li onClick={() => navigate("/help")}>
                                    <FaQuestionCircle /> Help & Support
                                </li>
                                <li onClick={handleLogoutRequest} className="logout-option">
                                    <FaSignOutAlt /> Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>

            {/* Logout Confirmation Popup */}
            {showLogoutPopup && (
                <div className="logout-popup">
                    <div className="popup-content">
                        <h3>Are you sure you want to logout?</h3>
                        <div className="popup-actions">
                            <button className="cancel-btn" onClick={() => setShowLogoutPopup(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
