import React from "react";

// Client-only wrapper: dynamically import AppProvider to avoid module evaluation
// that could reference `window.Shopify` during server-side rendering.
export default function ShopifyAppProvider({ apiKey, children }) {
  const [isEmbedded, setIsEmbedded] = React.useState(false);
  const [ClientAppProvider, setClientAppProvider] = React.useState(null);

  React.useEffect(() => {
    // Detect if the parent Shopify admin injected the global 'Shopify'
    setIsEmbedded(typeof window !== "undefined" && !!window.Shopify);

    // Dynamically import the AppProvider on the client only.
    let mounted = true;
    import("@shopify/shopify-app-react-router/react")
      .then((mod) => {
        if (mounted) setClientAppProvider(() => mod.AppProvider);
      })
      .catch((err) => {
        // If import fails, we still render children without AppProvider.
        // eslint-disable-next-line no-console
        console.error("Failed to load Shopify AppProvider:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (ClientAppProvider) {
    const Provider = ClientAppProvider;
    return (
      <Provider isEmbeddedApp={isEmbedded} apiKey={apiKey}>
        {children}
      </Provider>
    );
  }

  // During SSR or while loading, render children directly to avoid errors.
  return <>{children}</>;
}
