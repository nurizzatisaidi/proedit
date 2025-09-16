package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.Chat;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;
import com.google.firebase.cloud.FirestoreClient;

import java.sql.Time;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.concurrent.ExecutionException;
import com.google.cloud.Timestamp;

@Service
public class ChatService {

    private final Firestore db;
    private final FirebaseService firebaseService;

    public ChatService(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
        this.db = firebaseService.getFirestore();
    }

    // Get all chats where a specific user is a participant
    public List<Chat> getChatsByUserId(String userId) throws ExecutionException, InterruptedException {
        CollectionReference chatsRef = db.collection("chats");
        Query query = chatsRef.whereArrayContains("participantIds", userId);

        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Chat> chats = new ArrayList<>();

        for (DocumentSnapshot doc : documents) {
            Chat chat = doc.toObject(Chat.class);
            chat.setChatId(doc.getId()); // ensure chatId is set from Firestore doc ID
            chats.add(chat);
        }

        return chats;
    }

    // Get all the chats from Firestore for Admin
    public List<Chat> getAllChats() throws ExecutionException, InterruptedException {
        CollectionReference chatsRef = db.collection("chats");
        ApiFuture<QuerySnapshot> future = chatsRef.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Chat> chats = new ArrayList<>();
        for (DocumentSnapshot doc : documents) {
            Chat chat = doc.toObject(Chat.class);
            chat.setChatId(doc.getId());
            chats.add(chat);
        }
        return chats;
    }

    // Get chat by the project ID
    public Chat getChatByProjectId(String projectId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();

        ApiFuture<QuerySnapshot> future = db.collection("chats")
                .whereEqualTo("projectId", projectId)
                .get();

        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        if (!documents.isEmpty()) {
            return documents.get(0).toObject(Chat.class);
        }

        return null;
    }

    // Get or Create a Direct chat between two users for a specific project
    public String getOrCreateDirectChat(String userA, String userB) throws ExecutionException, InterruptedException {

        // Defensive Programming to ensure valid innput and prevent illogical scenarios
        if (userA == null || userB == null || userA.isEmpty() || userB.isEmpty()) {
            throw new IllegalArgumentException("Both user ID must be provided");
        } else if (userA.equals(userB)) {
            throw new IllegalArgumentException("User cannot have a chat with themselves");
        }

        // To avoid duplicate chats between the two uers, example (abc-xyz & xyz-abc)
        String a = userA.compareTo(userB) < 0 ? userA : userB;
        String b = userA.compareTo(userB) < 0 ? userB : userA;
        String dmKey = a + "-" + b;

        // 1. Check for any existing DM chat between the two users
        QuerySnapshot existing = db.collection("chats").whereEqualTo("type", "dm").whereEqualTo("dmKey", dmKey).limit(1)
                .get().get();

        if (!existing.isEmpty()) {
            return existing.getDocuments().get(0).getId();
        }

        // 2. Create a new chat Document
        DocumentReference chatRef = db.collection("chats").document();
        Map<String, Object> chat = new HashMap<>();
        chat.put("chatId", chatRef.getId());
        chat.put("type", "dm");
        chat.put("dmKey", dmKey);
        chat.put("participantIds", Arrays.asList(a, b));
        chat.put("createdDate", Timestamp.now());
        // no projectId for DM chats

        chatRef.set(chat).get();
        return chatRef.getId();

    }

}
