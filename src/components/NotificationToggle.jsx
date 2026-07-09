import { useEffect, useState } from "react";
import {
  getNotificationPermission,
  isPushSupported,
  isSubscribedToPush,
  subscribeToPush,
  unsubscribeFromPush,
} from "../services/pushNotifications";

function NotificationToggle({ userId, className = "", variant = "sidebar" }) {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPushSupported()) {
      setSupported(false);
      return;
    }
    isSubscribedToPush().then(setSubscribed);
  }, []);

  async function handleToggle() {
    setError("");
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        await subscribeToPush(userId);
        setSubscribed(true);
      }
    } catch (err) {
      console.error("Erro ao alterar notificações:", err);
      if (getNotificationPermission() === "denied") {
        setError(
          "Notificações bloqueadas no navegador. Ative nas configurações do dispositivo."
        );
      } else {
        setError(err.message || "Não foi possível alterar as notificações.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  if (variant === "block") {
    return (
      <div className={className}>
        <button
          onClick={handleToggle}
          disabled={loading}
          className="w-full rounded-lg border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading
            ? "Aguarde..."
            : subscribed
            ? "Notificações ativadas ✓"
            : "Ativar notificações"}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleToggle}
        disabled={loading}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition disabled:opacity-60"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        <span className="flex-1 text-left">
          {loading
            ? "Aguarde..."
            : subscribed
            ? "Notificações ativadas"
            : "Ativar notificações"}
        </span>
        {subscribed && (
          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
        )}
      </button>
      {error && (
        <p className="mt-1 px-3 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

export default NotificationToggle;
