import React, { useState, useRef, useEffect } from "react";
import {
    FaSignOutAlt,
    FaAngleDown,
    FaAngleUp,
    FaUser,
    FaCog,
    FaKey,
    FaQuestionCircle
} from "react-icons/fa";
import "../styles/Header.css";
import { useNavigate } from "react-router-dom";

const DEFAULT_PROFILE_PIC = "/default_avatar.png";

const Header = () => {
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [profilePic, setProfilePic] = useState(getStoredProfilePic());
    const [displayName, setDisplayName] = useState(localStorage.getItem("username") || "Guest");

    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    function getStoredProfilePic() {
        const storedPic = localStorage.getItem("profilePic");

        if (!storedPic || storedPic === "null" || storedPic === "undefined" || storedPic.trim() === "") {
            return DEFAULT_PROFILE_PIC;
        }

        return storedPic;
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const updatedPic = getStoredProfilePic();
            const updatedName = localStorage.getItem("username") || "Guest";

            if (updatedPic !== profilePic) setProfilePic(updatedPic);
            if (updatedName !== displayName) setDisplayName(updatedName);
        }, 1000);

        return () => clearInterval(interval);
    }, [profilePic, displayName]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogoutRequest = () => {
        setShowDropdown(false);
        setShowLogoutPopup(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("profilePic");
        localStorage.removeItem("userId");
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
                    <span className="username">Hello, {displayName}</span>
                    <img
                        src={profilePic}
                        alt="Profile"
                        className="profile-picture"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_PROFILE_PIC;
                        }}
                    />

                    {showDropdown ? (
                        <FaAngleUp className="dropdown-icon" onClick={toggleDropdown} />
                    ) : (
                        <FaAngleDown className="dropdown-icon" onClick={toggleDropdown} />
                    )}

                    {showDropdown && (
                        <div className="dropdown-menu">
                            <ul>
                                <li onClick={() => navigate("/profile")}>
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

            {/* Logout Confirmation */}
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
