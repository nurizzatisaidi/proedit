const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

// Function to register admin
const registerAdmin = async () => {
    const adminEmail = "admin@gmail.com"; // Admin email
    const adminPassword = "Admin@123"; // Admin password

    try {
        // Create the admin user
        const userRecord = await auth.createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: "Administrator",
        });

        // Set custom claims for the admin role
        await auth.setCustomUserClaims(userRecord.uid, { role: "admin" });

        console.log("Admin registered successfully with UID:", userRecord.uid);
    } catch (error) {
        console.error("Error registering admin:", error.message);
    }
};

// Run the function
registerAdmin();
