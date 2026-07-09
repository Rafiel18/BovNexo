import { supabase } from "../lib/supabaseClient";

// Dispara uma push notification para um usuário específico via Edge Function.
// Falha silenciosamente (apenas loga) para não travar o fluxo principal
// (ex: se o push falhar, a ocorrência/resposta já foi salva e não deve ser desfeita).
export async function sendPushNotification({ userId, title, body, url }) {
  try {
    const { data, error } = await supabase.functions.invoke("send-push", {
      body: { userId, title, body, url },
    });

    if (error) {
      console.error("Erro ao enviar push notification:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao chamar Edge Function send-push:", error);
    return null;
  }
}
