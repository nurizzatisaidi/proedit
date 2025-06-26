import React from 'react';
import '../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar, menuItems }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const completeMenuItems = [
        ...menuItems,
        { name: 'Settings', icon: <FaCog className="menu-icon" />, path: '/work-in-progress' },
    ];

    return (
        <nav className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                {isOpen && (
                    <div class="logo-container">
                        <img src="/Proedit_Logo_White.png" alt="ProEdit Logo" className="logo" />
                    </div>

                )}
                <button className="hamburger-menu" onClick={toggleSidebar}>
                    ☰
                </button>
            </div>
            <ul className="sidebar-menu">
                {completeMenuItems.map(({ name, icon, path }) => (
                    <li
                        key={name}
                        className={`menu-item ${location.pathname === path ? 'active' : ''}`}
                        onClick={() => navigate(path)}
                    >
                        {React.cloneElement(icon, { className: 'menu-icon' })}
                        {isOpen && <span>{name}</span>}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Sidebar;
