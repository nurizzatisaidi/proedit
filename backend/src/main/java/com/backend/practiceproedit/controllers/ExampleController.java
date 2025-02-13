package com.backend.practiceproedit.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.practiceproedit.service.FirebaseService;
import com.google.cloud.firestore.Firestore;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "http://localhost:3000") // Allow requests from React frontend
@RestController
public class ExampleController {

    @Autowired
    private FirebaseService firebaseService;

    @GetMapping("/getData")
    public String getDataFromFirestore() {
        Firestore db = firebaseService.getFirestore(); // Get Firestore instance
        // Perform Firestore operations
        return "Data fetched successfully";
    }
    // @GetMapping
    // public ResponseEntity<String> getData() {
    // String message = "Data fetched Successfully"; // Example response
    // return ResponseEntity.ok(message);
    // }

    @GetMapping("/message")
    public ResponseEntity<String> getMessage() {
        return ResponseEntity.ok("Hello from the Backend!");
    }

}