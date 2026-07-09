import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

// Precache dos assets gerados pelo build (injetado pelo vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);

// Dados do Supabase nunca são cacheados — sempre busca da rede
registerRoute(
  ({ url }) => url.hostname.endsWith("supabase.co"),
  new NetworkOnly()
);

// Recebe o evento de push enviado pelo backend (Edge Function) e exibe a notificação
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "BovNexo", body: event.data.text() };
  }

  const title = payload.title || "BovNexo";
  const options = {
    body: payload.body || "",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    data: {
      url: payload.url || "/",
    },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Ao clicar na notificação, abre (ou foca) o app na URL indicada
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
