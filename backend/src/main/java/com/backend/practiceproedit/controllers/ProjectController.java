package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Project;
import com.backend.practiceproedit.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // Get all projects
    @GetMapping("/all")
    public ResponseEntity<List<Project>> getAllProjects() {
        try {
            List<Project> projects = projectService.getAllProjects();
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get projects by editor Id
    @GetMapping("/editor/{editorId}")
    public ResponseEntity<List<Project>> getProjectsByEditor(@PathVariable String editorId) {
        try {
            List<Project> projects = projectService.getProjectsByEditorId(editorId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Delete Project by project Id
    @DeleteMapping("/delete/{projectId}")
    public ResponseEntity<String> deleteProject(@PathVariable String projectId) {
        try {
            boolean deleted = projectService.deleteProjectById(projectId);
            if (deleted) {
                return ResponseEntity.ok("Project deleted successfully.");
            } else {
                return ResponseEntity.status(404).body("Project not found.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete project.");
        }
    }

}
