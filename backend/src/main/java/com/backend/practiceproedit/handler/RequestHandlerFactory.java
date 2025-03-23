package com.backend.practiceproedit.handler;

public class RequestHandlerFactory {
    public static RequestHandler getHandler(String status) {
        if (status.equalsIgnoreCase("Accepted")) {
            return new AcceptRequestHandler();
        } else if (status.equalsIgnoreCase("Rejected")) {
            return new RejectRequestHandler();
        }
        return null; // Return null if the status is unknown
    }
}
