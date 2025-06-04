package com.backend.practiceproedit.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.backend.practiceproedit.model.User;
import com.backend.practiceproedit.service.FirebaseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

@RestController
@RequestMapping("/google-login")
// @CrossOrigin(origins = "https://proedit-399a8.web.app")
// @CrossOrigin(origins = "http://localhost:3000")
public class GoogleLoginController {

    @Autowired
    private FirebaseService firebaseService;

    @PostMapping
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        try {
            // ✅ Verify token from Firebase
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = decodedToken.getName(); // From Firebase claim
            String photoUrl = decodedToken.getPicture();

            // ✅ Register if not exists
            firebaseService.registerGoogleUser(uid, name, email, photoUrl);

            // ✅ Fetch user from Firestore to get their role
            User user = firebaseService.getUserById(uid);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found after registration.");
            }

            // ✅ Send user details to frontend
            Map<String, String> response = new HashMap<>();
            response.put("userId", uid);
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("photoUrl", user.getPhotoUrl());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error during Google login: " + e.getMessage());
        }
    }
}
