package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Task;
import com.backend.practiceproedit.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // Create a new task under a specific project
    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<String> createTask(@PathVariable String projectId, @RequestBody Task task) {
        try {
            String taskId = taskService.createTask(projectId, task);
            return ResponseEntity.ok(taskId);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating task: " + e.getMessage());
        }
    }

    // Get all tasks for a specific project
    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<Task>> getTasks(@PathVariable String projectId) {
        try {
            List<Task> tasks = taskService.getTasksByProject(projectId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Update a task within a project
    @PutMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<String> updateTask(@PathVariable String projectId,
            @PathVariable String taskId,
            @RequestBody Task task) {
        try {
            taskService.updateTask(projectId, taskId, task);
            return ResponseEntity.ok("Task updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating task: " + e.getMessage());
        }
    }

    // Delete a task from a project
    @DeleteMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<String> deleteTask(@PathVariable String projectId,
            @PathVariable String taskId) {
        try {
            taskService.deleteTask(projectId, taskId);
            return ResponseEntity.ok("Task deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting task: " + e.getMessage());
        }
    }
}
