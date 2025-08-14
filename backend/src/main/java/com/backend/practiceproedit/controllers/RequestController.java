package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Request;
import com.backend.practiceproedit.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;
import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.Collections;
import com.backend.practiceproedit.service.APIService;

@RestController
@RequestMapping("api/requests")
// @CrossOrigin(origins = "https://proedit-399a8.web.app")
// @CrossOrigin(origins = "http://localhost:3000")

public class RequestController {

    @Autowired
    private RequestService requestService;

    @Autowired
    private APIService apiService;

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
    // @PostMapping("/process/{requestId}")
    // public ResponseEntity<String> processRequest(
    // @PathVariable String requestId,
    // @RequestBody Map<String, String> payload) {

    // try {
    // String status = payload.get("status");
    // String comment = payload.get("comment");
    // String editorId = payload.get("editorId"); // Might be null for rejection
    // String adminUserId = payload.get("adminUserId"); // Retrieve the adminUserId
    // from payload

    // // Debugging logs
    // System.out.println("Processing requestId: " + requestId);
    // System.out.println("Status: " + status);
    // System.out.println("Comment: " + comment);
    // System.out.println("EditorId: " + editorId);
    // System.out.println("AdminId: " + adminUserId);

    // // Call RequestService to handle processing
    // requestService.processRequest(requestId, status, comment, editorId,
    // adminUserId);

    // return ResponseEntity.ok("Request updated successfully");
    // } catch (Exception e) {
    // e.printStackTrace();
    // return ResponseEntity.status(500).body("Error processing request: " +
    // e.getMessage());
    // }
    // }

    @PostMapping("/process/{requestId}")
    public ResponseEntity<String> processRequest(@PathVariable String requestId,
            @RequestBody Map<String, Object> payload) {
        try {
            String status = (String) payload.get("status");
            String comment = (String) payload.get("comment");
            String adminUserId = (String) payload.get("adminUserId");

            // Updated part: Extract lists
            List<String> assignedEditors = (List<String>) payload.get("assignedEditors");
            List<String> assignedEditorUsernames = (List<String>) payload.get("assignedEditorUsernames");

            // Debugging logs
            System.out.println("Processing requestId: " + requestId);
            System.out.println("Status: " + status);
            System.out.println("Comment: " + comment);
            System.out.println("Editors: " + assignedEditors);
            System.out.println("Usernames: " + assignedEditorUsernames);
            System.out.println("AdminId: " + adminUserId);
            // Call service method
            requestService.processRequest(
                    requestId,
                    status,
                    comment,
                    assignedEditors,
                    // assignedEditorUsernames,
                    adminUserId);

            return ResponseEntity.ok("Request updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing request: " + e.getMessage());
        }
    }

    @PostMapping("/suggest-title")
    public ResponseEntity<List<String>> suggestTitle(@RequestBody Map<String, String> body) {
        try {
            String result = apiService.generateTitle(body); // Pass all form inputs
            List<String> suggestions = Arrays.asList(result.split("\\|\\|\\|"));
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonList("Error generating title: " + e.getMessage()));
        }
    }

}
