package com.backend.practiceproedit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

import com.backend.practiceproedit.model.User;
import com.backend.practiceproedit.service.LoginService;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "http://localhost:3000")
public class LoginController {

    @Autowired
    private LoginService loginService;

    // @PostMapping
    // public ResponseEntity<String> loginUser(@RequestBody User user) {
    // try {
    // String result = loginService.loginUser(user.getEmail(), user.getPassword());

    // if ("Admin".equals(result)) {
    // return ResponseEntity.ok("Admin");
    // } else if ("User".equals(result)) {
    // return ResponseEntity.ok("User");
    // } else if ("Editor".equals(result)) { // ✅ Add Editor response
    // return ResponseEntity.ok("Editor");
    // } else {
    // return ResponseEntity.status(401).body(result); // Unauthorized response
    // }
    // } catch (Exception e) {
    // return ResponseEntity.status(500).body("Error logging in: " +
    // e.getMessage());
    // }
    // }

    @PostMapping
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody User user) {
        try {
            Map<String, String> response = loginService.loginUser(user.getEmail(), user.getPassword());

            if (response.containsKey("role")) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error logging in: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

}
