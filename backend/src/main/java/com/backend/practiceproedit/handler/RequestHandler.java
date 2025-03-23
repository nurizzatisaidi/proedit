package com.backend.practiceproedit.handler;

import com.backend.practiceproedit.model.Request;
import com.google.cloud.firestore.Firestore;

public interface RequestHandler {
    void handleRequest(Firestore db, Request request) throws Exception;
}
