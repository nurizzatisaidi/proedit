package com.backend.practiceproedit.service;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.Map;
import java.util.HashMap;

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

    public Map<String, String> loginUser(String email, String password) throws Exception {
        Firestore db = firebaseService.getFirestore();
        Map<String, String> response = new HashMap<>(); // ✅ Initialize response before using it

        try {
            QuerySnapshot userDoc = db.collection("users").whereEqualTo("email", email).get().get();

            if (userDoc.isEmpty()) {
                response.put("status", "error");
                response.put("message", "Invalid email or password");
                return response; // ✅ Return the response properly
            }

            // Get user details
            String storedPassword = userDoc.getDocuments().get(0).getString("password");
            String role = userDoc.getDocuments().get(0).getString("role");
            String name = userDoc.getDocuments().get(0).getString("name");
            String userId = userDoc.getDocuments().get(0).getString("userId");

            System.out.println("User ID being sent to frontend: " + userId); // ✅ Debug log

            // Check if password is correct
            if (BCrypt.checkpw(password, storedPassword)) {
                response.put("userId", userId);
                response.put("role", role);
                response.put("name", name); // ✅ Pass the name to the frontend
                return response;
            } else {
                response.put("status", "error");
                response.put("message", "Invalid email or password");
                return response;
            }
        } catch (Exception e) {
            throw new Exception("Error during login: " + e.getMessage());
        }
    }

}
