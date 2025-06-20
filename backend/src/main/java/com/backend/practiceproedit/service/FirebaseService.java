package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.User;
import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
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
import com.backend.practiceproedit.model.Project;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import com.google.cloud.firestore.Query;
import com.google.cloud.Timestamp;
import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import org.springframework.beans.factory.annotation.Value;

@Service
public class FirebaseService {

    @Value("${firebase.credentials.path}")
    private String firebaseCredentialsPath;

    @Value("${firebase.database.url}")
    private String firebaseDatabaseUrl;

    private Firestore db;
    private final Map<String, String> usernameCache = new HashMap<>();
    private final Map<String, String> projectTitleCache = new HashMap<>();

    @PostConstruct
    public void initializeFirebase() {
        try {
            // FileInputStream serviceAccount = new
            // FileInputStream("serviceAccountKey.json");
            // FileInputStream serviceAccount = new
            // FileInputStream("/etc/secrets/firebase_key.json");
            FileInputStream serviceAccount = new FileInputStream(firebaseCredentialsPath);

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    // .setDatabaseUrl("https://proedit-399a8-default-rtdb.firebaseio.com")
                    .setDatabaseUrl(firebaseDatabaseUrl)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
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
            user.put("password", hashedPassword);
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
            User user = new User(uid, displayName, email, null, "user");
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
                user.setUserId(document.getId());
                users.add(user);
            }
            return users;
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Error fetching users with role '" + role + "': " + e.getMessage());
        }
    }

    // Method to get the user By their ID
    public User getUserById(String userId) throws ExecutionException, InterruptedException {
        DocumentSnapshot document = db.collection("users").document(userId).get().get();
        if (document.exists()) {
            return document.toObject(User.class);
        }
        return null;
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

            db.collection("users").document(uid).set(editor);
            db.collection("editors").document(uid).set(editor);

            // Create admin-editor chat
            createAdminEditorChat(uid);

            return "Editor registered successfully with ID: " + uid;
        } catch (FirebaseAuthException e) {
            throw new Exception("Error creating editor in Firebase Authentication: " + e.getMessage());
        }
    }

    // Get the username by UserId
    // only need one username, good for one-time use
    public String getUsernameById(String userId) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = db.collection("users").document(userId).get().get();
        return doc.exists() ? doc.getString("name") : "Unknown User";
    }

    public String getProjectTitleById(String projectId) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = db.collection("projects").document(projectId).get().get();
        return snapshot.exists() ? snapshot.getString("title") : "Untitled Project";
    }

    // Get many username at one for rendering a chat list (Batch Fetching)
    public Map<String, String> getUsernamesByIds(Set<String> userIds) throws ExecutionException, InterruptedException {
        Map<String, String> usernames = new HashMap<>();
        List<ApiFuture<DocumentSnapshot>> futures = new ArrayList<>();

        for (String userId : userIds) {
            futures.add(db.collection("users").document(userId).get());
        }

        for (int i = 0; i < futures.size(); i++) {
            DocumentSnapshot snapshot = futures.get(i).get();
            if (snapshot.exists()) {
                String name = snapshot.getString("name");
                usernames.put(snapshot.getId(), name);
            }
        }

        return usernames;
    }

    // Get many project title all at once (Batch Fetching)
    public Map<String, String> getProjectTitlesByIds(List<String> projectIds) throws Exception {
        Firestore db = getFirestore();
        Map<String, String> titles = new HashMap<>();

        for (String projectId : projectIds) {
            if (projectId == null || projectId.trim().isEmpty()) {
                System.out.println("Warning: Skipping empty or null projectId in chat.");
                continue; // Skip invalid projectId
            }

            DocumentSnapshot doc = db.collection("projects").document(projectId).get().get();
            if (doc.exists()) {
                titles.put(projectId, doc.getString("title"));
            }
        }

        return titles;
    }

    // Get a project by its Project ID
    public Project getProjectById(String projectId) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = db.collection("projects").document(projectId).get().get();
        return doc.exists() ? doc.toObject(Project.class) : null;
    }

    // Update user profiles for all users
    public void updateUserProfile(String userId, User updatedUser) throws ExecutionException, InterruptedException {
        DocumentReference userRef = db.collection("users").document(userId);
        DocumentSnapshot snapshot = userRef.get().get();

        if (!snapshot.exists()) {
            throw new RuntimeException("User not found");
        }

        Map<String, Object> updates = new HashMap<>();

        // Only allow specific fields to be updated
        updates.put("name", updatedUser.getName());
        updates.put("email", updatedUser.getEmail());
        updates.put("photoUrl", updatedUser.getPhotoUrl());

        if (updatedUser.getPhoneNumber() != null) {
            updates.put("phoneNumber", updatedUser.getPhoneNumber());
        }

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            String hashedPassword = BCrypt.hashpw(updatedUser.getPassword(), BCrypt.gensalt());
            updates.put("password", hashedPassword);
        }

        // Prevent role/userId from being updated
        userRef.update(updates).get();
    }

    public List<String> getAllUserIdsByRole(String role) throws ExecutionException, InterruptedException {
        Firestore db = getFirestore();
        Query query = db.collection("users").whereEqualTo("role", role);
        ApiFuture<QuerySnapshot> future = query.get();

        List<String> userIds = new ArrayList<>();
        for (DocumentSnapshot document : future.get().getDocuments()) {
            userIds.add(document.getId());
        }
        return userIds;
    }

    // Create new admin editor chat
    public void createAdminEditorChat(String editorId) throws ExecutionException, InterruptedException {
        Firestore db = getFirestore();

        // Get all admin user IDs
        List<String> adminIds = getAllUserIdsByRole("admin");

        for (String adminId : adminIds) {
            // Check if chat already exists between this admin and editor
            ApiFuture<QuerySnapshot> future = db.collection("chats")
                    .whereEqualTo("projectId", "") // This is a general chat, not linked to a project
                    .whereEqualTo("participantIds", List.of(adminId, editorId))
                    .get();

            List<QueryDocumentSnapshot> docs = future.get().getDocuments();
            if (!docs.isEmpty())
                continue; // Chat already exists

            // Create chat
            Map<String, Object> chatData = new HashMap<>();
            chatData.put("projectId", ""); // No project
            chatData.put("participantIds", List.of(adminId, editorId));
            chatData.put("createdAt", Timestamp.now());

            db.collection("chats").add(chatData);
        }
    }

}
