import { supabase } from "../lib/supabaseClient";

export async function signUpUser({
  name,
  email,
  password,
  role,
  crmv = "",
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (error) {
    console.error("Erro no signUp:", error);
    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new Error("Usuário não retornado no cadastro.");
  }

  const profilePayload = {
    id: user.id,
    name,
    email: normalizedEmail,
    role,
    crmv: role === "veterinario" ? crmv : null,
    approval_status: role === "veterinario" ? "pending" : null,
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .insert(profilePayload);

  if (profileError) {
    console.error("Erro ao criar perfil:", profileError);
    throw profileError;
  }

  return user;
}

export async function signInUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    console.error("Erro no signIn:", error);
    throw error;
  }

  return data.user;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Erro no signOut:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Erro ao obter usuário atual:", error);
    throw error;
  }

  return user;
}

export function onAuthChange(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}