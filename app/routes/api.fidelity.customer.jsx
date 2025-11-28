import { authenticate } from "../shopify.server";
import db from "../db.server";

// GET request pour récupérer les infos du client
export const loader = async ({ request }) => {
  // authenticate.public gère la sécurité via App Proxy
  const { session } = await authenticate.public.appProxy(request);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // On récupère l'ID du client connecté via Shopify
  const customerId = session.id;
  if (!customerId)
    return Response.json({ error: "Not logged in" }, { status: 401 });

  // Récupérer le client en DB
  const customer = await db.customer.findFirst({
    where: {
      shopifyCustomerId: customerId,
      shopDomain: session.shop,
    },
    include: { activities: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  // Si pas de client trouvé, on renvoie des valeurs par défaut (0 points)
  if (!customer) {
    return Response.json({ points: 0, history: [] });
  }

  return Response.json({
    points: customer.pointsBalance,
    totalSpent: customer.totalSpent,
    history: customer.activities,
  });
};
