package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.Chat;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;
import com.google.firebase.cloud.FirestoreClient;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

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

}
