import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/WorkInProgressPage.css"; // Create this CSS file to style the layout

const WorkInProgressPage = ({ imageSrc }) => {
    const navigate = useNavigate();

    return (
        <div className="not-ready-container">
            <img
                src={imageSrc || "/WorkInProgress.png"} // fallback image
                alt="Page not ready"
                className="not-ready-image"
            />
            <h2>This page is not ready yet</h2>
            <button className="back-button" onClick={() => navigate(-1)}>
                ⬅ Go Back
            </button>
        </div>
    );
};

export default WorkInProgressPage;
