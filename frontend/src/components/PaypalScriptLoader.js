import { useEffect } from "react";

function PaypalScriptLoader() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = process.env.REACT_APP_PAYPAL_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Clean up on unmount
    };
  }, []);

  return null; // or return your PayPal buttons here
}

export default PaypalScriptLoader;
