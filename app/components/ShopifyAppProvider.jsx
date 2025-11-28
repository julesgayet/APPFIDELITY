import React from "react";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

export default function ShopifyAppProvider({ apiKey, children }) {
  const [isEmbedded, setIsEmbedded] = React.useState(false);

  React.useEffect(() => {
    // Detect if the parent Shopify admin injected the global 'Shopify'
    setIsEmbedded(typeof window !== "undefined" && !!window.Shopify);
  }, []);

  // Render AppProvider with isEmbedded=false on the server (initial render)
  // and update on the client if the global exists. This avoids errors when
  // the App Bridge script tag is not present on the page.
  return (
    <AppProvider isEmbeddedApp={isEmbedded} apiKey={apiKey}>
      {children}
    </AppProvider>
  );
}
