import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFolder, FaComments, FaBell } from "react-icons/fa";
import "../styles/List.css";

function EditorProjectsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("editor");

    useEffect(() => {
        const storedName = localStorage.getItem("username");
        const storedId = localStorage.getItem("userId");
        if (storedName) setUsername(storedName);
        if (storedId) fetchProjects(storedId);
    }, []);

    const fetchProjects = async (editorId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/projects/editor/${editorId}`);
            if (!response.ok) throw new Error("Failed to fetch projects");
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects: ", error);
        }
    };

    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />
                <section className="list-section">
                    <div className="top-bar">
                        <h1>Your Assigned Projects</h1>
                    </div>

                    <div className="list">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <div className="list-card" key={project.projectId}>
                                    <div className="list-details">
                                        <p><strong>Title:</strong> {project.title}</p>
                                        <p><strong>Client:</strong> {project.clientUsername || "Unknown"}</p>
                                        <p><strong>Status:</strong> {project.status}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No assigned projects found.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default EditorProjectsPage;
