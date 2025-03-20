package com.backend.practiceproedit.model;

public class Editor extends User {
    public Editor(String userId, String name, String email, String password) {
        super(userId, name, email, password, "editor");
    }
}
