package com.backend.practiceproedit.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.practiceproedit.model.User;
import com.backend.practiceproedit.service.RegisterService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/register")
// @CrossOrigin(origins = "http://localhost:3000")
public class RegisterController {

    @Autowired
    private RegisterService registerService;

    @PostMapping
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        try {
            String result = registerService.registerUser(user.getName(), user.getEmail(), user.getPassword());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error registering user: " + e.getMessage());
        }
    }

    // @PostMapping("/google-login")
    // public ResponseEntity<String> handleGoogleLogin(@RequestBody Map<String,
    // String> payload) {
    // try {
    // String idToken = payload.get("token"); // Get the token from the request
    // payload

    // // Verify the Firebase ID token
    // FirebaseToken decodedToken =
    // FirebaseAuth.getInstance().verifyIdToken(idToken);

    // // Extract user information
    // String uid = decodedToken.getUid();
    // String displayName = decodedToken.getName();
    // String email = decodedToken.getEmail();
    // String photoUrl = decodedToken.getPicture();

    // // Register the user in Firestore if not already registered
    // String result = registerService.registerGoogleUser(uid, displayName, email,
    // photoUrl);

    // // Return a success response
    // return ResponseEntity.ok("User logged in successfully!");
    // } catch (FirebaseAuthException e) {
    // // Handle invalid token
    // return ResponseEntity.status(401).body("Invalid Firebase token");
    // } catch (Exception e) {
    // // Handle general errors
    // return ResponseEntity.status(500).body("Error during Google login: " +
    // e.getMessage());
    // }
    // }

}
