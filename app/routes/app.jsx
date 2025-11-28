import {
  Link,
  Outlet,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import ShopifyAppProvider from "../components/ShopifyAppProvider";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate, SHOPIFY_API_KEY } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return {
    apiKey: SHOPIFY_API_KEY,
  };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <ShopifyAppProvider apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Accueil
        </Link>
        <Link to="/app/settings">Configuration Fidélité</Link>
      </ui-nav-menu>
      <Outlet />
    </ShopifyAppProvider>
  );
}

// --- CORRECTIF MANUEL (Au lieu d'utiliser boundary.error) ---
export function ErrorBoundary() {
  const error = useRouteError();

  // Affichage basique de l'erreur
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Une erreur est survenue</h1>
      <p>
        {isRouteErrorResponse(error)
          ? `${error.status} ${error.statusText}`
          : error instanceof Error
            ? error.message
            : "Erreur inconnue"}
      </p>
      <Link to="/app"> Retour à l accueil </Link>
    </div>
  );
}

// --- CORRECTIF MANUEL (Au lieu d'utiliser boundary.headers) ---
export const headers = (headersArgs) => {
  // On renvoie simplement les en-têtes par défaut
  return headersArgs.loaderHeaders;
};
