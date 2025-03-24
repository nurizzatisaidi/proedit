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

    // Get all projects (Admin view)
    @GetMapping("/all")
    public ResponseEntity<List<Project>> getAllProjects() {
        try {
            List<Project> projects = projectService.getAllProjects();
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get projects by editorId (Editor view)
    @GetMapping("/editor/{editorId}")
    public ResponseEntity<List<Project>> getProjectsByEditor(@PathVariable String editorId) {
        try {
            List<Project> projects = projectService.getProjectsByEditorId(editorId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
