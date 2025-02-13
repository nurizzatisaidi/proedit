import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { signInWithGoogle } from './firebaseConfig'; // Import the Firebase utility
import './styles/login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialize navigate

    // Existing email/password login handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/login", {
                email,
                password,
            });

            if (response.data === "Admin") {
                navigate("/admin-dashboard"); // Redirect to admin dashboard
            } else if (response.data === "User") {
                navigate("/user-dashboard"); // Redirect to user dashboard
            } else {
                setMessage(response.data || "Login failed.");
            }
        } catch (error) {
            console.error("Login Error:", error.response || error.message);
            setMessage(error.response?.data || "Invalid credentials.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // Sign in with Google using Firebase
            const result = await signInWithGoogle();
            const user = result.user;

            console.log("Google User:", user); // Debug: Print user info

            // Construct user data
            const userData = {
                token: await user.getIdToken(), // Get the Firebase ID token
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoUrl: user.photoURL,
            };

            // Send user data to the backend for Firestore storage
            const response = await axios.post('http://localhost:8080/google-login', userData);

            console.log("Backend response:", response.data);
            setMessage(`Welcome, ${user.displayName}!`);

            // Redirect to dashboard after successful Google login
            navigate('/user-dashboard');
        } catch (error) {
            console.error("Error during Google Login:", error);
            setMessage("Error logging in with Google.");
        }
    };



    const handleReadMore = () => {
        window.open('https://eflix.com.my/', '_blank'); // Opens the website in a new tab
    };

    return (
        <div className="login-container">
            <div className="left-section">
                <img src="/Proedit_Logo.png" alt="eFlix Logo" className="logo-image" style={{ width: '200px', height: 'auto' }} />
                <h2>- ProEdit System -</h2>
                <p>We care, we contribute: Enhancing Learning</p>
                <button className="read-more-btn" onClick={handleReadMore}>
                    Read More
                </button>
            </div>
            <div className="right-section">
                <h3>Hello There!</h3>
                <p>Welcome Back</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <FaEnvelope className="icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">Login</button>
                </form>
                <p className="forgot-password">
                    <a href="/forgot-password">Forgot Password</a>
                </p>
                <p className="or-separator">OR</p>
                <button className="google-login-btn" onClick={handleGoogleLogin}>
                    Login with Google
                </button>
                <p className="register-prompt">
                    Don't have an account? <a href="/register">Register</a>
                </p>
                <p>{message}</p> {/* Display success or error message */}
            </div>
        </div>
    );
}

export default Login;
