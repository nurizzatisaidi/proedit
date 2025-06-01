package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Request;
import com.backend.practiceproedit.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/requests")
// @CrossOrigin(origins = "http://localhost:3000")

public class RequestController {

    @Autowired
    private RequestService requestService;

    // Creating a new request
    @PostMapping("/create")
    public ResponseEntity<String> createRequest(@RequestBody Request request) {
        try {
            String requestId = requestService.createRequest(request);
            return ResponseEntity.ok("Request submitted successfully with ID: " + requestId);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body("Error submitting request: " + e.getMessage());
        }
    }

    // Retrieving the list of request
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Request>> getUserRequests(@PathVariable String userId) {
        try {
            List<Request> requests = requestService.getRequestByUserId(userId);

            if (requests.isEmpty()) {
                System.out.println("No requests found for userId: " + userId);
                return ResponseEntity.status(404).body(null);
            }

            System.out.println("Sending JSON Response: " + requests);

            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Request>> getAllRequests() {
        try {
            List<Request> requests = requestService.getAllRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/delete/{requestId}")
    public ResponseEntity<String> deleteRequest(@PathVariable String requestId) {
        try {
            boolean isDeleted = requestService.deleteRequest(requestId);
            if (isDeleted) {
                return ResponseEntity.ok("Request deleted successfully");
            }
            return ResponseEntity.status(404).body("Request not found");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting request");
        }
    }

    // Process a request (Accept or Reject)
    @PostMapping("/process/{requestId}")
    public ResponseEntity<String> processRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, String> payload) {

        try {
            String status = payload.get("status");
            String comment = payload.get("comment");
            String editorId = payload.get("editorId"); // Might be null for rejection
            String adminUserId = payload.get("adminUserId"); // Retrieve the adminUserId from payload

            // Debugging logs
            System.out.println("Processing requestId: " + requestId);
            System.out.println("Status: " + status);
            System.out.println("Comment: " + comment);
            System.out.println("EditorId: " + editorId);
            System.out.println("AdminId: " + adminUserId);

            // Call RequestService to handle processing
            requestService.processRequest(requestId, status, comment, editorId, adminUserId);

            return ResponseEntity.ok("Request updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing request: " + e.getMessage());
        }
    }
}
