const express = require("express");
const router = express.Router();
const verifyAdmin = require("./verifyAdmin");

// Example admin-only route
router.get("/admin-dashboard", verifyAdmin, (req, res) => {
    res.json({ message: "Welcome to the admin dashboard!" });
});

// Add more admin-specific routes as needed
router.post("/admin-action", verifyAdmin, (req, res) => {
    res.json({ message: "Admin action performed successfully!" });
});

module.exports = router;
