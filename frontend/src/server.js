const express = require("express");
const adminRoutes = require("./adminRoutes");
const app = express();

// Add middleware for parsing JSON
app.use(express.json());

// Register admin routes
app.use("/admin", adminRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
