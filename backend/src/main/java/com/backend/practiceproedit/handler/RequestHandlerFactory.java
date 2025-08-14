
package com.backend.practiceproedit.handler;

import com.backend.practiceproedit.service.NotificationService;

public class RequestHandlerFactory {

    private final NotificationService notificationService;

    public RequestHandlerFactory(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public RequestHandler getHandler(String status) {
        if ("Accepted".equalsIgnoreCase(status)) {
            return new AcceptRequestHandler(notificationService);
        } else if ("Rejected".equalsIgnoreCase(status)) {
            return new RejectRequestHandler(notificationService);
        }
        return null;
    }
}
