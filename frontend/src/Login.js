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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/login", {
                email,
                password,
            });

            console.log("Login Response:", response.data); // Debugging

            if (response.data.role === "admin") {
                localStorage.setItem("username", response.data.name);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("userId", response.data.userId);
                navigate("/admin-dashboard"); // Redirect to admin dashboard
            } else if (response.data.role === "user") {
                localStorage.setItem("username", response.data.name);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("userId", response.data.userId);
                navigate("/user-dashboard"); // Redirect to user dashboard
            } else if (response.data.role === "editor") {
                localStorage.setItem("username", response.data.name);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("userId", response.data.userId);
                navigate("/editor-dashboard"); // Redirect to editor dashboard
            } else {
                setMessage(response.data.message || "Login failed."); // Show error message
            }
        } catch (error) {
            console.error("Login Error:", error.response || error.message);
            setMessage(error.response?.data.error || "Invalid credentials.");
        }
    };


    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithGoogle();
            const user = result.user;

            console.log("Google User:", user);

            const userData = {
                token: await user.getIdToken(),
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoUrl: user.photoURL,
            };

            const response = await axios.post('http://localhost:8080/google-login', userData);

            console.log("Backend response:", response.data);

            // Store user details
            localStorage.setItem("username", response.data.name);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("userId", response.data.userId);
            localStorage.setItem("profilePic", response.data.photoUrl);

            // Redirect based on role
            if (response.data.role === "admin") {
                navigate("/admin-dashboard");
            } else if (response.data.role === "editor") {
                navigate("/editor-dashboard");
            } else {
                navigate("/user-dashboard"); // default to client
            }

            setMessage(`Welcome, ${response.data.name}!`);
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
                    <button type="submit" className="submitLogin-btn">Login</button>
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
