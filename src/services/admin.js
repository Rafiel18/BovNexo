import { supabase } from "../lib/supabaseClient";

export const ADMIN_EMAIL = "rafaelroliveira37@gmail.com";

export function isAdmin(userData) {
  return userData?.email?.toLowerCase() === ADMIN_EMAIL;
}

export async function getPendingVets() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "veterinario")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar veterinários pendentes:", error);
    throw error;
  }

  return (data || []).map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    crmv: profile.crmv,
    createdAt: profile.created_at,
  }));
}

export async function getAllVets() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "veterinario")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar veterinários:", error);
    throw error;
  }

  return (data || []).map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    crmv: profile.crmv,
    approvalStatus: profile.approval_status,
    createdAt: profile.created_at,
  }));
}

export async function approveVet(vetId) {
  const { error } = await supabase
    .from("profiles")
    .update({ approval_status: "approved" })
    .eq("id", vetId);

  if (error) {
    console.error("Erro ao aprovar veterinário:", error);
    throw error;
  }
}

export async function rejectVet(vetId) {
  const { error } = await supabase
    .from("profiles")
    .update({ approval_status: "rejected" })
    .eq("id", vetId);

  if (error) {
    console.error("Erro ao rejeitar veterinário:", error);
    throw error;
  }
}
