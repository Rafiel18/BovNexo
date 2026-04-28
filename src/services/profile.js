import { supabase } from "../lib/supabaseClient";

export async function getProfileById(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    crmv: data.crmv,
    approvalStatus: data.approval_status,
    createdAt: data.created_at,
  };
}