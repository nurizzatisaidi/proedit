package com.backend.practiceproedit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.practiceproedit.model.User;
import com.backend.practiceproedit.service.LoginService;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "http://localhost:3000")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @PostMapping
    public ResponseEntity<String> loginUser(@RequestBody User user) {
        try {
            String result = loginService.loginUser(user.getEmail(), user.getPassword());

            if ("Admin".equals(result)) {
                return ResponseEntity.ok("Admin");
            } else if ("User".equals(result)) {
                return ResponseEntity.ok("User");
            } else {
                return ResponseEntity.status(401).body(result); // Unauthorized response
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error logging in: " + e.getMessage());
        }
    }

}
