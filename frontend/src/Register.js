import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs'; // Add bcryptjs for hashing
import './styles/register.css';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate checkbox
        if (!acceptTerms) {
            setMessage("You must accept the terms and conditions to register.");
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            // Register user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Hash the password using bcrypt
            const hashedPassword = bcrypt.hashSync(password, 10); // Synchronous hashing for simplicity

            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                userId: user.uid,
                name,
                email,
                password: hashedPassword, // Store the hashed password
                role: "user", // Default role
            });

            // Redirect to UserDashboard
            navigate('/user-dashboard');
        } catch (error) {
            console.error("Error registering user:", error);
            setMessage(error.message || 'Error registering user.');
        }
    };

    const redirectToLogin = () => {
        navigate('/'); // Redirect to the login page
    };

    return (
        <div className="register-container">
            <h3>Register</h3><br></br>
            <p>Please enter your username, email, and password</p>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
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
                <div className="input-container">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Re-enter Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="accept-terms">
                    <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                    />
                    <label htmlFor="acceptTerms">
                        I agree to the terms and conditions.
                    </label>
                </div>
                <button
                    type="submit"
                    className="submit-btn"
                >
                    Register
                </button>
            </form>
            {message && <p className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</p>}
            <p className="signin-prompt">
                Already have an account? <span onClick={redirectToLogin} style={{ color: "#6b7eff", cursor: "pointer", textDecoration: "underline" }}>Sign in</span>
            </p>
        </div>
    );
}

export default Register;
