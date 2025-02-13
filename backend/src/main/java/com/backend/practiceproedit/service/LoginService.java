package com.backend.practiceproedit.service;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import org.springframework.security.crypto.bcrypt.BCrypt;

@Service
public class LoginService {

    private static final Logger LOGGER = Logger.getLogger(LoginService.class.getName());

    @Autowired
    private FirebaseService firebaseService;

    public String loginUser(String email, String password) throws Exception {
        Firestore db = firebaseService.getFirestore();
        try {
            QuerySnapshot userDoc = db.collection("users").whereEqualTo("email", email).get().get();

            if (userDoc.isEmpty()) {
                return "Invalid email or password"; // User not found
            }

            // Get user details
            String storedPassword = userDoc.getDocuments().get(0).getString("password");
            String role = userDoc.getDocuments().get(0).getString("role");

            // Check if password is correct
            if (BCrypt.checkpw(password, storedPassword)) {
                if ("admin".equals(role)) {
                    return "Admin"; // Admin role
                } else if ("user".equals(role)) {
                    return "User"; // Regular user role
                }
                return "Invalid role"; // For unexpected roles
            } else {
                return "Invalid email or password"; // Password mismatch
            }
        } catch (Exception e) {
            throw new Exception("Error during login: " + e.getMessage());
        }
    }

}
