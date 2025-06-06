import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/AdminDashboard.css";

import { FaHome, FaFolder, FaComments, FaBell } from "react-icons/fa";
import "../styles/TaskBoard.css";
import "../styles/List.css";

const EditorDashboard = () => {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("Editor");
    const [editorId, setEditorId] = useState("");
    const [projectCount, setProjectCount] = useState(0);
    const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });
    const [selectedProjectId, setSelectedProjectId] = useState("all");
    const [projects, setProjects] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const statuses = ["todo", "inprogress", "done"];
    const statusLabels = {
        todo: "To Do",
        inprogress: "In Progress",
        done: "Done"
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const storedEditorId = localStorage.getItem("userId");
        if (storedUsername) setUsername(storedUsername);
        if (storedEditorId) {
            setEditorId(storedEditorId);

            // Fetch notifications
            fetch(`${BASE_URL}/api/notifications/user/${storedEditorId}`)
                .then(res => res.ok ? res.json() : [])
                .then((data) => {
                    const recentUnread = data
                        .filter(n => !n.read)
                        .sort((a, b) => {
                            const aTime = a.timestamp?.seconds || a.timestamp?._seconds || 0;
                            const bTime = b.timestamp?.seconds || b.timestamp?._seconds || 0;
                            return bTime - aTime;
                        })
                        .slice(0, 5);
                    setNotifications(recentUnread);
                })
                .catch(() => setNotifications([]));
        }
    }, [BASE_URL]);


    const fetchTasksForEditor = useCallback(async () => {
        if (!editorId) return;
        try {
            const res = await fetch(`${BASE_URL}/api/projects/editor/${editorId}/tasks`);
            const data = await res.json();
            setAllTasks(data);
            updateFilteredTasks(data, selectedProjectId);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }, [editorId, selectedProjectId, BASE_URL]);

    const updateFilteredTasks = (taskList, projectId) => {
        const filtered = projectId === "all"
            ? taskList
            : taskList.filter(t => t.projectId === projectId);

        const grouped = { todo: [], inprogress: [], done: [] };
        filtered.forEach(task => {
            const key = task.status?.toLowerCase().replace(/\s/g, "");
            if (grouped[key]) grouped[key].push(task);
        });
        setTasks(grouped);
    };

    const fetchEditorProjects = useCallback(async () => {
        if (!editorId) return;
        try {
            const res = await fetch(`${BASE_URL}/api/projects/editor/${editorId}`);
            const data = await res.json();
            setProjects(data);
            setProjectCount(data.length);
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    }, [editorId, BASE_URL]);


    const handleDragEnd = useCallback(async (result) => {
        const { source, destination } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const movedTask = tasks[source.droppableId][source.index];
        const updatedTasks = { ...tasks };

        updatedTasks[source.droppableId].splice(source.index, 1);

        movedTask.status = destination.droppableId;
        updatedTasks[destination.droppableId].splice(destination.index, 0, movedTask);

        setTasks(updatedTasks);

        await fetch(`${BASE_URL}/api/projects/${movedTask.projectId}/tasks/${movedTask.taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movedTask)
        });
    }, [tasks, BASE_URL]);

    const handleProjectFilterChange = (e) => {
        const value = e.target.value;
        setSelectedProjectId(value);
        updateFilteredTasks(allTasks, value);
    };


    useEffect(() => {
        fetchTasksForEditor();
        fetchEditorProjects();
    }, [fetchTasksForEditor, fetchEditorProjects]);

    useEffect(() => {
        if (!editorId) return;

        fetch(`${BASE_URL}/api/notifications/user/${editorId}`)
            .then(res => res.ok ? res.json() : [])
            .then((data) => {
                const recentUnread = data
                    .filter(n => !n.read)
                    .sort((a, b) => {
                        const aTime = a.timestamp?.seconds || a.timestamp?._seconds || 0;
                        const bTime = b.timestamp?.seconds || b.timestamp?._seconds || 0;
                        return bTime - aTime;
                    })
                    .slice(0, 5);
                setNotifications(recentUnread);
            })
            .catch(() => setNotifications([]));
    }, [editorId, BASE_URL]);


    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" },
    ];

    const incompleteTaskCount = tasks.todo.length + tasks.inprogress.length;

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />

                <section className="list-section">
                    {/* Summary Cards */}
                    <div className="summary-cards">
                        <div className="summary-card blue">
                            <h4>Total Projects Assigned</h4>
                            <p>{projectCount}</p>
                        </div>
                        <div className="summary-card orange">
                            <h4>Incomplete Tasks</h4>
                            <p>{incompleteTaskCount}</p>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="dashboard-section">
                        <div className="notifications-header">
                            <h4>Recent Notifications</h4>
                            <button className="view-all-btn" onClick={() => window.location.href = "/editor-notifications"}>
                                View All
                            </button>
                        </div>
                        {notifications.length === 0 ? (
                            <p className="muted">No recent activity</p>
                        ) : (
                            <div className="notification-list">
                                {notifications.map((n, i) => {
                                    const handleNotificationClick = () => {
                                        if (n.type === "chat" && n.relatedId) {
                                            window.location.href = `/editor-chat/${n.relatedId}`;
                                        } else if (n.type === "request") {
                                            window.location.href = "/editor-projects";
                                        } else if (n.type === "task" && n.relatedId) {
                                            window.location.href = `/editor-project-board/${n.relatedId}`;
                                        }
                                    };

                                    return (
                                        <div key={i} className="card clickable" onClick={handleNotificationClick}>
                                            <p>{n.message}</p>
                                            <small className="tag">{n.type}</small><br />
                                            <small style={{ color: "#777" }}>
                                                {new Date((n.timestamp?.seconds || n.timestamp?._seconds || 0) * 1000).toLocaleString()}
                                            </small>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>




                    <div className="project-title-header">
                        <label>Filter by Project:</label>
                        <select value={selectedProjectId} onChange={handleProjectFilterChange} className="project-filter-dropdown">
                            <option value="all">All Projects</option>
                            {projects.map(p => (
                                <option key={p.projectId} value={p.projectId}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Kanban Board */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="task-board">
                            {statuses.map(status => (
                                <Droppable key={status} droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`task-column ${status} ${snapshot.isDraggingOver ? "drag-over" : ""}`}
                                        >
                                            <h3>{statusLabels[status]}</h3>
                                            {tasks[status].map((task, index) => (
                                                <Draggable key={task.taskId} draggableId={task.taskId} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            className="task-card"
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <h4>{task.title}</h4>
                                                            <p>{task.description}</p>
                                                            <p className="task-project-title"><strong>Project:</strong> {task.projectTitle}</p> {/* ✅ Add this */}
                                                            <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </section>
                <Footer />
            </main>
        </div>
    );
};

export default EditorDashboard;
