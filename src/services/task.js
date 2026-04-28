import { supabase } from "../lib/supabaseClient";

function mapTask(item) {
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
    completedAt: item.completed_at,
    completedByProducerUid: item.completed_by_producer_uid,
    createdAt: item.created_at,
  };
}

export async function createTask({
  title,
  description,
  date,
  status = "pendente",
  propertyId,
  producerId,
  veterinarioId,
}) {
  const payload = {
    title: title.trim(),
    description: description.trim(),
    date,
    status,
    property_id: propertyId,
    producer_id: producerId,
    veterinario_id: veterinarioId,
  };

  const { data, error } = await supabase
    .from("tasks")
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
      completed_at,
      completed_by_producer_uid,
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
    console.error("Erro Supabase ao criar tarefa:", error);
    throw error;
  }

  return mapTask(data);
}

export async function getTasksByVet(veterinarioId) {
  const { data, error } = await supabase
    .from("tasks")
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
      completed_at,
      completed_by_producer_uid,
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
    console.error("Erro Supabase ao buscar tarefas do vet:", error);
    throw error;
  }

  return (data || []).map(mapTask);
}

export async function getTasksByProducer(producerId) {
  const { data, error } = await supabase
    .from("tasks")
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
      completed_at,
      completed_by_producer_uid,
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
    console.error("Erro Supabase ao buscar tarefas do produtor:", error);
    throw error;
  }

  return (data || []).map(mapTask);
}

export async function completeTask(taskId, producerUserUid) {
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "concluida",
      completed_by_producer_uid: producerUserUid,
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    console.error("Erro Supabase ao concluir tarefa:", error);
    throw error;
  }
}