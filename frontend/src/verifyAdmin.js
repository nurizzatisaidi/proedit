const admin = require("firebase-admin");

const verifyAdmin = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1]; // Extract the token

    if (!idToken) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Check for admin role
        if (decodedToken.role === "admin") {
            next(); // User is an admin, proceed to the route
        } else {
            return res.status(403).json({ message: "Forbidden: Admin access only" });
        }
    } catch (error) {
        console.error("Error verifying admin token:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = verifyAdmin;
