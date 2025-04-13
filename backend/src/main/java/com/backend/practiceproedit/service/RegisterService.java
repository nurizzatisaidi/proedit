package com.backend.practiceproedit.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import com.backend.practiceproedit.model.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;

@Service
public class RegisterService {

    @Autowired
    private FirebaseService firebaseService;

    public String registerUser(String name, String email, String password) throws Exception {
        Firestore db = firebaseService.getFirestore();
        try {
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
            System.out.println("Hashed Password: " + hashedPassword); // Debug log

            User user = new User(null, name, email, hashedPassword, "user");
            ApiFuture<DocumentReference> future = db.collection("users").add(user);
            String userId = future.get().getId();
            db.collection("users").document(userId).update("userId", userId);

            return "User registered successfully with ID: " + userId;
        } catch (Exception e) {
            throw new Exception("Error during registration: " + e.getMessage());
        }
    }

    public String registerGoogleUser(String uid, String displayName, String email, String photoUrl) throws Exception {
        Firestore db = firebaseService.getFirestore();
        try {
            // Check if the user already exists
            boolean userExists = !db.collection("users")
                    .whereEqualTo("email", email)
                    .get()
                    .get()
                    .isEmpty();

            if (userExists) {
                return "User already exists";
            }

            // Create a new user object
            User user = new User(uid, displayName, email, null, "user");
            user.setPhotoUrl(photoUrl); // Assuming User has a `photoUrl` field
            db.collection("users").add(user);

            return "Google user registered successfully!";
        } catch (Exception e) {
            throw new Exception("Error during Google user registration: " + e.getMessage());
        }
    }

}
