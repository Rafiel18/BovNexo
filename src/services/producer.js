import { supabase } from "../lib/supabaseClient";

export async function createProducer({
  name,
  email,
  phone,
  veterinarioId,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("producers")
    .insert({
      name,
      email: normalizedEmail,
      phone,
      veterinario_id: veterinarioId,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro Supabase ao criar produtor:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    veterinarioId: data.veterinario_id,
    linkedUserUid: data.linked_user_uid,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProducer(producerId, data) {
  const normalizedEmail = data.email.trim().toLowerCase();

  const payload = {
    name: data.name,
    email: normalizedEmail,
    phone: data.phone,
    veterinario_id: data.veterinarioId,
  };

  const { error } = await supabase
    .from("producers")
    .update(payload)
    .eq("id", producerId);

  if (error) {
    console.error("Erro Supabase ao atualizar produtor:", error);
    throw error;
  }
}

export async function getProducersByVet(veterinarioId) {
  const { data, error } = await supabase
    .from("producers")
    .select("*")
    .eq("veterinario_id", veterinarioId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar produtores do vet:", error);
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    veterinarioId: item.veterinario_id,
    linkedUserUid: item.linked_user_uid,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

export async function getProducerByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("producers")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("Erro Supabase ao buscar produtor por email:", error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    veterinarioId: data.veterinario_id,
    linkedUserUid: data.linked_user_uid,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function linkProducerToUser(producerId, userUid) {
  const { error } = await supabase
    .from("producers")
    .update({
      linked_user_uid: userUid,
    })
    .eq("id", producerId);

  if (error) {
    console.error("Erro Supabase ao vincular produtor ao usuário:", error);
    throw error;
  }
}