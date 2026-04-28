import { supabase } from "../lib/supabaseClient";

function mapOccurrence(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    date: item.date,
    status: item.status,
    propertyId: item.property_id,
    propertyName: item.properties?.name || item.propertyName || "-",
    producerId: item.producer_id,
    producerName: item.producers?.name || item.producerName || "-",
    veterinarioId: item.veterinario_id,
    createdByUserUid: item.created_by_user_uid,
    vetResponse: item.vet_response || "",
    updatedByVetUid: item.updated_by_vet_uid,
    updatedAt: item.updated_at,
    responseUpdatedAt: item.response_updated_at,
    createdAt: item.created_at,
  };
}

export async function createOccurrence({
  title,
  description,
  date,
  status = "aberta",
  propertyId,
  producerId,
  veterinarioId,
  createdByUserUid,
}) {
  const payload = {
    title: title.trim(),
    description: description.trim(),
    date,
    status,
    property_id: propertyId,
    producer_id: producerId,
    veterinario_id: veterinarioId,
    created_by_user_uid: createdByUserUid,
    vet_response: "",
  };

  const { data, error } = await supabase
    .from("occurrences")
    .insert(payload)
    .select(
      `
      id,
      title,
      description,
      date,
      status,
      property_id,
      producer_id,
      veterinario_id,
      created_by_user_uid,
      vet_response,
      updated_by_vet_uid,
      updated_at,
      response_updated_at,
      created_at,
      properties (
        id,
        name
      ),
      producers (
        id,
        name
      )
    `
    )
    .single();

  if (error) {
    console.error("Erro Supabase ao criar ocorrência:", error);
    throw error;
  }

  return mapOccurrence(data);
}

export async function getOccurrencesByProducer(producerId) {
  const { data, error } = await supabase
    .from("occurrences")
    .select(
      `
      id,
      title,
      description,
      date,
      status,
      property_id,
      producer_id,
      veterinario_id,
      created_by_user_uid,
      vet_response,
      updated_by_vet_uid,
      updated_at,
      response_updated_at,
      created_at,
      properties (
        id,
        name
      ),
      producers (
        id,
        name
      )
    `
    )
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar ocorrências do produtor:", error);
    throw error;
  }

  return (data || []).map(mapOccurrence);
}

export async function getOccurrencesByVet(veterinarioId) {
  const { data, error } = await supabase
    .from("occurrences")
    .select(
      `
      id,
      title,
      description,
      date,
      status,
      property_id,
      producer_id,
      veterinario_id,
      created_by_user_uid,
      vet_response,
      updated_by_vet_uid,
      updated_at,
      response_updated_at,
      created_at,
      properties (
        id,
        name
      ),
      producers (
        id,
        name
      )
    `
    )
    .eq("veterinario_id", veterinarioId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar ocorrências do vet:", error);
    throw error;
  }

  return (data || []).map(mapOccurrence);
}

export async function updateOccurrenceStatus(
  occurrenceId,
  status,
  veterinarianUserUid
) {
  const { error } = await supabase
    .from("occurrences")
    .update({
      status,
      updated_by_vet_uid: veterinarianUserUid,
      updated_at: new Date().toISOString(),
    })
    .eq("id", occurrenceId);

  if (error) {
    console.error("Erro Supabase ao atualizar status da ocorrência:", error);
    throw error;
  }
}

export async function updateOccurrenceResponse(
  occurrenceId,
  vetResponse,
  veterinarianUserUid
) {
  const { error } = await supabase
    .from("occurrences")
    .update({
      vet_response: vetResponse.trim(),
      updated_by_vet_uid: veterinarianUserUid,
      response_updated_at: new Date().toISOString(),
    })
    .eq("id", occurrenceId);

  if (error) {
    console.error("Erro Supabase ao salvar resposta da ocorrência:", error);
    throw error;
  }
}