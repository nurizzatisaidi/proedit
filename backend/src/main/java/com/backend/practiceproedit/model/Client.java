package com.backend.practiceproedit.model;

public class Client extends User {
    public Client(String userId, String name, String email, String password) {
        super(userId, name, email, password, "client");
    }
}
