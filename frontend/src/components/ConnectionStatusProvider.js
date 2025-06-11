import React, { useState, useEffect } from "react";

function ConnectionStatusBanner() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return !isOnline ? (
        <div style={{
            position: "fixed",
            top: 0,
            width: "100%",
            backgroundColor: "#ff4d4f",
            color: "#fff",
            textAlign: "center",
            padding: "8px",
            zIndex: 9999
        }}>
            🔌 No internet connection. Some features may not work.
        </div>
    ) : null;
}

export default ConnectionStatusBanner;
