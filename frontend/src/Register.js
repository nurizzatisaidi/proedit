import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

        if (!acceptTerms) {
            setMessage("You must accept the terms and conditions to register.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                }),
            });

            const data = await response.text();

            if (response.ok) {
                navigate('/'); // Redirect on success
            } else {
                setMessage(data);
            }
        } catch (error) {
            console.error("Error registering user:", error);
            setMessage("Error registering user.");
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
                    className="submitReg-btn"
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
