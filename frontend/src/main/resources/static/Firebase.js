// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB8GRmkxDH8uhiB2XOl5EEfwLphuTW9cUQ",
    authDomain: "proedit-399a8.firebaseapp.com",
    databaseURL: "https://proedit-399a8-default-rtdb.firebaseio.com",
    projectId: "proedit-399a8",
    storageBucket: "proedit-399a8.firebasestorage.app",
    messagingSenderId: "529372719598",
    appId: "1:529372719598:web:fddbc7e3e10dd768fd86ff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Function to handle Google sign-in
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export default app;
