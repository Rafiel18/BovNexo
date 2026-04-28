import { supabase } from "../lib/supabaseClient";

function mapProperty(item) {
  return {
    id: item.id,
    name: item.name,
    city: item.city,
    producerId: item.producer_id,
    producerName: item.producers?.name || item.producerName || "Não vinculado",
    veterinarioId: item.veterinario_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export async function createProperty({
  name,
  city,
  producerId,
  veterinarioId,
}) {
  const payload = {
    name: name.trim(),
    city: city.trim(),
    producer_id: producerId,
    veterinario_id: veterinarioId,
  };

  const { data, error } = await supabase
    .from("properties")
    .insert(payload)
    .select(
      `
      id,
      name,
      city,
      producer_id,
      veterinario_id,
      created_at,
      updated_at,
      producers (
        id,
        name
      )
    `
    )
    .single();

  if (error) {
    console.error("Erro Supabase ao criar propriedade:", error);
    throw error;
  }

  return mapProperty(data);
}

export async function updateProperty(propertyId, data) {
  const payload = {
    name: data.name.trim(),
    city: data.city.trim(),
    producer_id: data.producerId,
    veterinario_id: data.veterinarioId,
  };

  const { error } = await supabase
    .from("properties")
    .update(payload)
    .eq("id", propertyId);

  if (error) {
    console.error("Erro Supabase ao atualizar propriedade:", error);
    throw error;
  }
}

export async function getPropertiesByVet(veterinarioId) {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      name,
      city,
      producer_id,
      veterinario_id,
      created_at,
      updated_at,
      producers (
        id,
        name
      )
    `
    )
    .eq("veterinario_id", veterinarioId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar propriedades do vet:", error);
    throw error;
  }

  return (data || []).map(mapProperty);
}

export async function getPropertiesByProducer(producerId) {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      name,
      city,
      producer_id,
      veterinario_id,
      created_at,
      updated_at,
      producers (
        id,
        name
      )
    `
    )
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar propriedades do produtor:", error);
    throw error;
  }

  return (data || []).map(mapProperty);
}