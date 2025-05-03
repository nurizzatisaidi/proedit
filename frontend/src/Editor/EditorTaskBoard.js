import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaHome, FaFolder, FaComments, FaBell, FaPlus } from "react-icons/fa";
import "../styles/TaskBoard.css";
import "../styles/List.css";

const EditorTaskBoard = () => {
    const { projectId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [editingTask, setEditingTask] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const username = localStorage.getItem("username") || "Editor";

    const statuses = ["todo", "inprogress", "done"];
    const statusLabels = {
        todo: "To Do",
        inprogress: "In Progress",
        done: "Done"
    };

    const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });
    const [showPopup, setShowPopup] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });

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

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const movedTask = tasks[source.droppableId][source.index];
        const updatedTasks = { ...tasks };

        updatedTasks[source.droppableId].splice(source.index, 1);
        movedTask.status = destination.droppableId;
        updatedTasks[destination.droppableId].splice(destination.index, 0, movedTask);

        setTasks(updatedTasks);

        await fetch(`http://localhost:8080/api/projects/${projectId}/tasks/${movedTask.taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movedTask)
        });
    };

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.dueDate) {
            alert("Please enter task title and due date.");
            return;
        }

        const taskData = {
            ...newTask,
            status: "todo",
            dueDate: new Date(newTask.dueDate)
        };

        await fetch(`http://localhost:8080/api/projects/${projectId}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData)
        });

        setNewTask({ title: "", description: "", dueDate: "" });
        setShowPopup(false);
        fetchTasks();
    };

    const confirmDeleteTask = async () => {
        try {
            await fetch(`http://localhost:8080/api/projects/${projectId}/tasks/${taskToDelete.taskId}`, {
                method: "DELETE",
            });
            setTaskToDelete(null);
            fetchTasks();
        } catch (err) {
            alert("Error deleting task");
            console.error(err);
        }
    };



    const menuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/editor-dashboard" },
        { name: "Projects", icon: <FaFolder />, path: "/editor-projects" },
        { name: "Chat", icon: <FaComments />, path: "/editor-chat-list" },
        { name: "Notifications", icon: <FaBell />, path: "/editor-notifications" }
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} menuItems={menuItems} />
            <main className="main-content">
                <Header username={username} />

                <section className="list-section">
                    <div className="top-bar">
                        <h1>Task Board</h1>
                        <button className="add-user-btn" onClick={() => setShowPopup(true)}>
                            <FaPlus /> Create Task
                        </button>
                    </div>

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
                                                        <div className="task-card" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <h4>{task.title}</h4>
                                                            <p>{task.description}</p>
                                                            <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                                                            <div className="task-actions">
                                                                <button className="edit-btn" onClick={() => setEditingTask(task)}><FaEdit /></button>
                                                                <button className="delete-btn" onClick={() => setTaskToDelete(task)}><FaTrash /></button>
                                                            </div>
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

                {/* Create Task Popup */}
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Create New Task</h2>
                            <form onSubmit={(e) => { e.preventDefault(); handleCreateTask(); }}>
                                <div className="form-group">
                                    <label>Title:</label>
                                    <input
                                        type="text"
                                        placeholder="Enter task title"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description:</label>
                                    <input
                                        type="text"
                                        placeholder="Enter task description"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Due Date:</label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="button-group">
                                    <button type="button" className="cancel-btn" onClick={() => setShowPopup(false)}>Cancel</button>
                                    <button type="submit" className="add-btn">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Task Edit Popup*/}
                {editingTask && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Edit Task</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await fetch(`http://localhost:8080/api/projects/${projectId}/tasks/${editingTask.taskId}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            ...editingTask,
                                            dueDate: new Date(editingTask.dueDate)
                                        })
                                    });
                                    setEditingTask(null);
                                    fetchTasks();
                                } catch (err) {
                                    alert("Failed to update task.");
                                }
                            }}>
                                <div className="form-group">
                                    <label>Title:</label>
                                    <input
                                        type="text"
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description:</label>
                                    <input
                                        type="text"
                                        value={editingTask.description}
                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Due Date:</label>
                                    <input
                                        type="date"
                                        value={editingTask.dueDate.split("T")[0]} // assumes ISO format
                                        onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="popup-buttons">
                                    <button type="button" className="cancel-btn" onClick={() => setEditingTask(null)}>Cancel</button>
                                    <button type="submit" className="add-btn">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Task Delete Popup*/}
                {taskToDelete && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2>Confirm Delete</h2>
                            <p>Are you sure you want to delete the task: <strong>{taskToDelete.title}</strong>?</p>
                            <div className="popup-buttons">
                                <button className="canceltask-btn" onClick={() => setTaskToDelete(null)}>Cancel</button>
                                <button className="delete-btn" onClick={confirmDeleteTask}>Delete</button>
                            </div>
                        </div>
                    </div>
                )}


            </main>
        </div>
    );
};

export default EditorTaskBoard;
