package com.backend.practiceproedit.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

@RestController
@RequestMapping("/google-login")
@CrossOrigin(origins = "http://localhost:3000")
public class GoogleLoginController {

    @PostMapping
    public ResponseEntity<String> loginWithGoogle(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        try {
            // Verify Firebase token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = (String) decodedToken.getClaims().get("name");
            String photoUrl = (String) decodedToken.getClaims().get("picture");

            // Register or log in user
            // Call registerGoogleUser in FirebaseService if needed
            return ResponseEntity.ok("Google login successful! UID: " + uid + ", Email: " + email);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid Firebase token");
        }
    }
}
