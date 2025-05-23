// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8GRmkxDH8uhiB2XOl5EEfwLphuTW9cUQ",
  authDomain: "proedit-399a8.firebaseapp.com",
  projectId: "proedit-399a8",
  storageBucket: "proedit-399a8.appspot.com",
  messagingSenderId: "529372719598",
  appId: "1:529372719598:web:fddbc7e3e10dd768fd86ff",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Google Auth Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

// Export signInWithGoogle function and other Firebase utilities
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export { auth, googleProvider, storage };
export default app;
