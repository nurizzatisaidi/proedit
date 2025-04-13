package com.backend.practiceproedit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.practiceproedit.model.User;
import com.backend.practiceproedit.service.FirebaseService;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "http://localhost:3000") // Allow requests from React frontend
@RestController

@RequestMapping("/users")
public class UserController {
    @Autowired
    private FirebaseService firebaseService;

    // Register a new client-user
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        try {
            String result = firebaseService.registerUser(user.getName(), user.getEmail(), user.getPassword());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error registering user: " + e.getMessage());
        }
    }

    // Get all Client-user
    @GetMapping
    public ResponseEntity<List<User>> getAllUsersWithRole(
            @RequestParam(required = false, defaultValue = "user") String role) {
        try {
            List<User> users = firebaseService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // Delete Client-user
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        try {
            firebaseService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }

    // Register new Editor
    @PostMapping("/register-editor")
    public ResponseEntity<String> registerEditor(@RequestBody User user) {
        try {
            String result = firebaseService.registerEditor(user.getName(), user.getEmail(), user.getPassword());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error registering editor: " + e.getMessage());
        }
    }

    // Get all Editors
    @GetMapping("/editors")
    public ResponseEntity<List<User>> getAllEditors() {
        try {
            List<User> editors = firebaseService.getUsersByRole("editor");
            return ResponseEntity.ok(editors);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get all Clients
    @GetMapping("/clients")
    public ResponseEntity<List<User>> getAllClients() {
        try {
            List<User> editors = firebaseService.getUsersByRole("user");
            return ResponseEntity.ok(editors);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get the user by their userId
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        try {
            User user = firebaseService.getUserById(userId);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(404).body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Delete Editor
    @DeleteMapping("/editors/{userId}")
    public ResponseEntity<String> deleteEditor(@PathVariable String userId) {
        try {
            firebaseService.deleteUser(userId);
            return ResponseEntity.ok("Editor deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting editor: " + e.getMessage());
        }
    }

    // Update User profile
    @PutMapping("/update-profile/{userId}")
    public ResponseEntity<String> updateProfile(@PathVariable String userId, @RequestBody User updatedUser) {
        try {
            firebaseService.updateUserProfile(userId, updatedUser);
            return ResponseEntity.ok("Profile updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage());
        }
    }

}
