// package com.backend.practiceproedit.handler;

// public class RequestHandlerFactory {
//     public static RequestHandler getHandler(String status) {
//         if (status.equalsIgnoreCase("Accepted")) {
//             return new AcceptRequestHandler();
//         } else if (status.equalsIgnoreCase("Rejected")) {
//             return new RejectRequestHandler();
//         }
//         return null; // Return null if the status is unknown
//     }
// }

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
