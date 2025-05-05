import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaHome, FaFolder, FaComments, FaBell } from "react-icons/fa";
import "../styles/TaskBoard.css";
import "../styles/List.css";

const EditorDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState("Editor");
    const [editorId, setEditorId] = useState("");
    const [projectCount, setProjectCount] = useState(0);
    const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });

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
        if (storedEditorId) setEditorId(storedEditorId);
    }, []);

    const fetchTasksForEditor = useCallback(async () => {
        if (!editorId) return;

        try {
            const res = await fetch(`http://localhost:8080/api/projects/editor/${editorId}/tasks`);
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
    }, [editorId]);

    const fetchProjectCount = useCallback(async () => {
        if (!editorId) return;

        try {
            const res = await fetch(`http://localhost:8080/api/projects/editor/${editorId}`);
            const projects = await res.json();
            setProjectCount(projects.length);
        } catch (err) {
            console.error("Error fetching project count:", err);
        }
    }, [editorId]);

    const handleDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const movedTask = tasks[source.droppableId][source.index];
        const updatedTasks = { ...tasks };

        // Remove from source
        updatedTasks[source.droppableId].splice(source.index, 1);

        // Update status & insert into destination
        movedTask.status = destination.droppableId;
        updatedTasks[destination.droppableId].splice(destination.index, 0, movedTask);

        setTasks(updatedTasks);

        // 🔁 Sync to backend
        await fetch(`http://localhost:8080/api/projects/${movedTask.projectId}/tasks/${movedTask.taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movedTask)
        });
    };


    useEffect(() => {
        fetchTasksForEditor();
        fetchProjectCount();
    }, [fetchTasksForEditor, fetchProjectCount]);

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
            </main>
        </div>
    );
};

export default EditorDashboard;
