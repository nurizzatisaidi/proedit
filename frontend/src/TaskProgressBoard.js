import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { FaHome, FaFolder, FaComments, FaBell, FaFileAlt, FaUser, FaUsers } from "react-icons/fa";
import "./styles/TaskBoard.css";
import "./styles/List.css";

const TaskProgressBoard = () => {
    const { projectId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const username = localStorage.getItem("username") || "User";
    const role = localStorage.getItem("role"); // "client" or "admin"
    const [projectTitle, setProjectTitle] = useState("");


    const statuses = ["todo", "inprogress", "done"];
    const statusLabels = {
        todo: "To Do",
        inprogress: "In Progress",
        done: "Done"
    };

    const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });

    const fetchTasks = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/projects/${projectId}/tasks`);
            const data = await res.json();
            const grouped = { todo: [], inprogress: [], done: [] };
            data.forEach(task => {
                const key = task.status?.toLowerCase().replace(/\s/g, "");
                if (grouped[key]) grouped[key].push(task);
            });
            setTasks(grouped);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }, [projectId]);

    const fetchProjectTitle = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/projects/${projectId}`);
            const data = await res.json();
            setProjectTitle(data.title || "Untitled Project");
        } catch (err) {
            console.error("Error fetching project title:", err);
        }
    }, [projectId]);


    useEffect(() => {
        fetchTasks();
        fetchProjectTitle();
    }, [fetchTasks, fetchProjectTitle]);


    const menuItems = role === "admin" ? [
        { name: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
        { name: "Requests", icon: <FaFileAlt />, path: "/admin-requests" },
        { name: "Projects", icon: <FaFolder />, path: "/admin-projects" },
        { name: "Chat", icon: <FaComments />, path: "/admin-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/admin-notifications" },
        { name: "Editors", icon: <FaUser />, path: "/admin-editors-list" },
        { name: "Clients", icon: <FaUsers />, path: "/admin-clients-list" },
    ] : [
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
                <Header username={username} />

                <section className="list-section">
                    <div className="top-bar">
                        <h1>Project Task Progress</h1>
                        <p className="project-title-sub">Project: {projectTitle}</p>
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
            </main>
        </div>
    );
};

export default TaskProgressBoard;
