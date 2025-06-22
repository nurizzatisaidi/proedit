import { useEffect } from "react";

function PaypalScriptLoader({ onScriptLoad }) {
  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      // process.env.REACT_APP_PAYPAL_SCRIPT_URL ||
      "https://www.paypal.com/sdk/js?client-id=AeiFRu0oEAGscyXLn3QLXDFNB1IOC0LJWMhayXv7GrCH1jtsgarVk7Ymop78fBWsj0ZY20UiE4OXpson&currency=MYR";

    script.async = true;

    script.onload = () => {
      console.log("✅ PayPal SDK loaded");
      if (onScriptLoad) onScriptLoad();
    };

    script.onerror = () => {
      console.error("❌ Failed to load PayPal SDK");
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onScriptLoad]);

  return null;
}

export default PaypalScriptLoader;
