package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.User;
import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseService {

    private Firestore db;

    @PostConstruct
    public void initializeFirebase() {
        try {
            FileInputStream serviceAccount = new FileInputStream("serviceAccountKey.json");

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://proedit-399a8-default-rtdb.firebaseio.com")
                    .build();

            if (FirebaseApp.getApps().isEmpty()) { // ✅ Prevent duplicate initialization
                FirebaseApp.initializeApp(options);
            }
            this.db = FirestoreClient.getFirestore();

            System.out.println("Firebase initialized successfully.");
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("Error initializing Firebase: " + e.getMessage());
        }
    }

    public Firestore getFirestore() {
        return this.db;
    }

    public String registerUser(String name, String email, String password) throws Exception {
        try {
            // Create user in Firebase Authentication
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(password)
                    .setDisplayName(name);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
            String uid = userRecord.getUid(); // Firebase Authentication UID

            // Hash the password before saving in Firestore
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

            // Save user details in Firestore
            Map<String, Object> user = new HashMap<>();
            user.put("userId", uid);
            user.put("name", name);
            user.put("email", email);
            user.put("password", hashedPassword); // ✅ Store hashed password
            user.put("role", "user");

            db.collection("users").document(uid).set(user);

            return "User registered successfully with ID: " + uid;
        } catch (FirebaseAuthException e) {
            e.printStackTrace();
            throw new Exception("Error creating user in Firebase Authentication: " + e.getMessage());
        }
    }

    public String registerGoogleUser(String uid, String displayName, String email, String photoUrl) throws Exception {
        Firestore db = this.getFirestore();
        try {
            // Check if the user already exists
            boolean userExists = !db.collection("users")
                    .whereEqualTo("email", email)
                    .get()
                    .get()
                    .isEmpty();

            if (userExists) {
                return "User already exists. Logged in successfully.";
            }

            // Create a new user object for first-time registration
            User user = new User(uid, displayName, email, null, "google");
            user.setPhotoUrl(photoUrl); // Set the user's photo URL
            db.collection("users").document(uid).set(user);

            return "Google user registered successfully!";
        } catch (Exception e) {
            throw new Exception("Error during Google user registration: " + e.getMessage());
        }
    }

    // Method to fetch users by role
    public List<User> getUsersByRole(String role) throws Exception {
        try {
            // Query Firestore for users with the specified role
            ApiFuture<QuerySnapshot> future = db.collection("users")
                    .whereEqualTo("role", role)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            // Convert Firestore documents to User objects
            List<User> users = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                User user = document.toObject(User.class);
                user.setUserId(document.getId()); // Set the Firestore document ID as the userId
                users.add(user);
            }
            return users;
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Error fetching users with role '" + role + "': " + e.getMessage());
        }
    }

    // Method to delete a user by ID
    public void deleteUser(String userId) throws Exception {
        try {
            // Delete the user from Firebase Authentication
            FirebaseAuth.getInstance().deleteUser(userId);

            // Delete the user from Firestore
            ApiFuture<WriteResult> writeResult = db.collection("users").document(userId).delete();
            System.out.println("User with ID " + userId + " deleted from Firestore.");
        } catch (FirebaseAuthException e) {
            e.printStackTrace();
            throw new Exception("Error deleting user from Firebase Authentication: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Error deleting user from Firestore: " + e.getMessage());
        }
    }

    // Register an Editor
    public String registerEditor(String name, String email, String password) throws Exception {
        try {
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(password)
                    .setDisplayName(name);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
            String uid = userRecord.getUid();

            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

            Map<String, Object> editor = new HashMap<>();
            editor.put("userId", uid);
            editor.put("name", name);
            editor.put("email", email);
            editor.put("password", hashedPassword);
            editor.put("role", "editor");

            // ✅ Save in both users and editors collections
            db.collection("users").document(uid).set(editor);
            db.collection("editors").document(uid).set(editor);

            return "Editor registered successfully with ID: " + uid;
        } catch (FirebaseAuthException e) {
            throw new Exception("Error creating editor in Firebase Authentication: " + e.getMessage());
        }
    }
}
