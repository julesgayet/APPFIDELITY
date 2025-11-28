// On attend que la page et Preact soient chargés
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("fidelity-widget-root");
  if (!rootElement) return;

  const customerId = rootElement.dataset.customerId;
  // Si le client n'est pas connecté, on n'affiche rien
  if (!customerId) return;

  function FidelityApp() {
    const [isOpen, setIsOpen] = preact.hooks.useState(false);
    const [data, setData] = preact.hooks.useState({ points: 0, history: [] });
    const [loading, setLoading] = preact.hooks.useState(true);

    preact.hooks.useEffect(() => {
      fetch("/apps/fidelity/api/fidelity/customer")
        .then((res) => res.json())
        .then((info) => {
          setData(info);
          setLoading(false);
        })
        .catch((err) => console.error("Erreur fidelity:", err));
    }, []);

    const styles = {
      launcher:
        "position: fixed; bottom: 20px; right: 20px; padding: 15px; background: #4f46e5; color: white; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999;",
      panel:
        "position: fixed; bottom: 80px; right: 20px; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 9999; display: flex; flex-direction: column; overflow: hidden;",
      header: "background: #4f46e5; color: white; padding: 20px;",
      content: "padding: 20px; overflow-y: auto; flex: 1;",
      pointBig: "font-size: 32px; font-weight: bold;",
      historyItem:
        "padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;",
    };

    return html`
      <div>
        <button style="${styles.launcher}" onClick=${() => setIsOpen(!isOpen)}>
          🎁
        </button>

        ${isOpen &&
        html`
          <div style="${styles.panel}">
            <div style="${styles.header}">
              <h3>Mes Points</h3>
              <div style="${styles.pointBig}">
                ${loading ? "..." : data.points} pts
              </div>
            </div>

            <div style="${styles.content}">
              <h4>Historique</h4>
              ${data.history.length === 0
                ? html`<p>Aucune activité récente</p>`
                : ""}
              ${data.history.map(
                (activity) => html`
                  <div style="${styles.historyItem}">
                    <span>${activity.desc || activity.type}</span>
                    <span
                      style="color: ${activity.points > 0 ? "green" : "red"}"
                    >
                      ${activity.points > 0 ? "+" : ""}${activity.points}
                    </span>
                  </div>
                `,
              )}

              <hr
                style="margin: 20px 0; border: 0; border-top: 1px solid #eee;"
              />

              <button
                style="width: 100%; padding: 10px; background: #eee; border: none; border-radius: 6px; cursor: pointer;"
              >
                Échanger mes points (Bientôt)
              </button>
            </div>
          </div>
        `}
      </div>
    `;
  }

  window.preactRender(html`<${FidelityApp} />`, rootElement);
});
