import React, { useState } from "react";
import "./styles/EditorDashboard.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { FaHome, FaFolder, FaComments, FaBell } from "react-icons/fa";

function EditorDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Define menu items for the Editor
    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" },
        { name: "Settings", icon: <FaHome />, path: "/editor-settings" },
    ];

    // Sample tasks for the Kanban board
    const tasks = {
        todo: [
            { id: 1, time: "24 May 2024, 2:00 p.m.", description: "Create a project folder for PaleoScan, and copy all content provided by the client", category: "PaleoScan Tutorial Videos" },
            { id: 2, time: "24 May 2024, 2:00 p.m.", description: "Review submitted edits from the client", category: "Editing Review" },
        ],
        inProgress: [
            { id: 3, time: "24 May 2024, 2:00 p.m.", description: "Editing video tutorials for ProEdit system", category: "Video Editing" },
        ],
        done: [
            { id: 4, time: "24 May 2024, 2:00 p.m.", description: "Upload final edited project to drive", category: "Final Upload" },
        ],
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username="Editor" />

                <div className="task-board">
                    <h2>Tasks</h2>
                    <button className="new-task-btn">New Task +</button>

                    <div className="task-columns">
                        {["To Do", "In Progress", "Done"].map((status, index) => (
                            <div key={index} className={`task-column ${status.toLowerCase().replace(" ", "-")}`}>
                                <h3>{status}</h3>
                                {tasks[status.toLowerCase().replace(" ", "")]?.map((task) => (
                                    <div key={task.id} className="task-card">
                                        <p className="task-time">{task.time}</p>
                                        <p className="task-desc">{task.description}</p>
                                        <span className="task-category">{task.category}</span>
                                        <div className="task-actions">
                                            <button className="edit-btn">✏️</button>
                                            <button className="delete-btn">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EditorDashboard;
