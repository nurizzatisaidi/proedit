import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import './styles/register.css';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [message, setMessage] = useState('');
    const [showTermsPopup, setShowTermsPopup] = useState(false);

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
                    <label htmlFor="acceptTerms" className="terms-label">
                        I agree to the <span className="terms-link" onClick={() => setShowTermsPopup(true)}>terms and conditions</span>.
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

            {/* View Request Popup */}
            {showTermsPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Terms and Conditions</h2>
                        <div className="terms-text">
                            <ol>
                                <li>By using this platform, you agree to comply with our policies and guidelines.</li>
                                <li>All videos submitted must be appropriate and must not violate any copyright or intellectual property laws.</li>
                                <li>You must be the rightful owner of the content or have the necessary rights to submit it for editing.</li>
                                <li>Editors reserve the right to decline requests that are unclear, inappropriate, or do not meet quality standards.</li>
                                <li>It is your responsibility to upload clear, high-quality raw video files to ensure optimal editing results.</li>
                                <li>Inaccurate or incomplete submissions may be delayed or rejected.</li>
                                <li>We are not liable for any misuse or misinterpretation of edited content after delivery.</li>


                            </ol>
                        </div>
                        <div className="popup-buttons">
                            <button className="close-btn" onClick={() => setShowTermsPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>


    );

}

export default Register;
