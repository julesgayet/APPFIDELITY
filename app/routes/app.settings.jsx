import {
  useLoaderData,
  Form,
  useActionData,
  useNavigation,
} from "react-router";
import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  BlockStack,
  Text,
  Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// 1. CHARGEMENT DES DONNÉES (Backend)
// Cette fonction s'exécute sur le serveur avant d'afficher la page
export const loader = async ({ request }) => {
  // Vérifie que l'utilisateur est bien un admin connecté
  const { session } = await authenticate.admin(request);

  // Chercher ou créer les settings par défaut pour ce shop
  const settings = await db.shopSettings.upsert({
    where: { shopDomain: session.shop },
    update: {},
    create: { shopDomain: session.shop, pointsPerEuro: 10 },
  });

  return { settings };
};

// 2. SAUVEGARDE DES DONNÉES (Backend)
// Cette fonction s'exécute quand le formulaire est soumis (POST)
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const pointsPerEuro = parseInt(formData.get("pointsPerEuro"));
  const tiersEnabled = formData.get("tiersEnabled") === "on";

  await db.shopSettings.update({
    where: { shopDomain: session.shop },
    data: { pointsPerEuro, tiersEnabled },
  });

  return { status: "success" };
};

// 3. INTERFACE UTILISATEUR (Frontend Admin)
// C'est ce que voit le marchand
export default function SettingsPage() {
  const { settings } = useLoaderData(); // Récupère les données du loader
  const actionData = useActionData(); // Récupère le résultat de l'action (sauvegarde)
  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

  return (
    <Page title="Configuration Fidélité">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingMd">
                Règles de gain
              </Text>

              <Form method="post">
                <BlockStack gap="400">
                  <TextField
                    label="Points gagnés par Euro dépensé"
                    type="number"
                    name="pointsPerEuro"
                    defaultValue={settings.pointsPerEuro}
                    helpText="Exemple: 10 points pour 1€"
                    autoComplete="off"
                  />

                  {/* Checkbox simple pour l'exemple */}
                  <label
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="tiersEnabled"
                      defaultChecked={settings.tiersEnabled}
                    />
                    Activer les niveaux (Bronze/Argent/Or)
                  </label>

                  <Box paddingBlockStart="400">
                    <Button submit variant="primary" loading={isSaving}>
                      Sauvegarder
                    </Button>
                  </Box>

                  {actionData?.status === "success" && (
                    <Text as="span" tone="success">
                      Configuration sauvegardée !
                    </Text>
                  )}
                </BlockStack>
              </Form>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
