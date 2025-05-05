package com.backend.practiceproedit.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class MessageService {

    private final Firestore db;
    private final FirebaseService firebaseService;

    @Autowired
    public MessageService(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
        this.db = firebaseService.getFirestore();
    }

    // Create a new message in the chat
    // public Map<String, Object> createMessage(String chatId, String senderId,
    // String content)
    // throws ExecutionException, InterruptedException {

    // CollectionReference messagesRef =
    // db.collection("chats").document(chatId).collection("messages");
    // DocumentReference newMessageRef = messagesRef.document();

    // String senderUsername = firebaseService.getUsernameById(senderId); // get
    // sender's name

    // Map<String, Object> message = new HashMap<>();
    // message.put("messageId", newMessageRef.getId());
    // message.put("senderId", senderId);
    // message.put("senderUsername", senderUsername);
    // message.put("content", content);
    // message.put("timestamp", FieldValue.serverTimestamp());

    // newMessageRef.set(message).get(); // Save to Firestore
    // return message;
    // }
    public Map<String, Object> createMessage(String chatId, String senderId, String content,
            String fileUrl, String fileType, String fileName)
            throws ExecutionException, InterruptedException {

        CollectionReference messagesRef = db.collection("chats").document(chatId).collection("messages");
        DocumentReference newMessageRef = messagesRef.document();

        String senderUsername = firebaseService.getUsernameById(senderId);

        Map<String, Object> message = new HashMap<>();
        message.put("messageId", newMessageRef.getId());
        message.put("senderId", senderId);
        message.put("senderUsername", senderUsername);
        message.put("content", content);
        message.put("timestamp", FieldValue.serverTimestamp());

        // Optional file fields
        if (fileUrl != null)
            message.put("fileUrl", fileUrl);
        if (fileType != null)
            message.put("fileType", fileType);
        if (fileName != null)
            message.put("fileName", fileName);

        newMessageRef.set(message).get();
        return message;
    }

    // Get all messages by chatId
    public List<Map<String, Object>> getMessagesByChatId(String chatId)
            throws ExecutionException, InterruptedException {

        CollectionReference messagesRef = db.collection("chats").document(chatId).collection("messages");
        ApiFuture<QuerySnapshot> future = messagesRef.orderBy("timestamp", Query.Direction.ASCENDING).get();

        List<Map<String, Object>> messages = new ArrayList<>();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            Map<String, Object> msg = doc.getData();
            msg.put("messageId", doc.getId());
            messages.add(msg);
        }

        return messages;
    }
}
