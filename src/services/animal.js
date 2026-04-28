import { supabase } from "../lib/supabaseClient";

function mapAnimal(item) {
  return {
    id: item.id,
    identification: item.identification,
    name: item.name || "",
    breed: item.breed || "",
    sex: item.sex,
    category: item.category,
    status: item.status,
    birthDate: item.birth_date,
    propertyId: item.property_id,
    propertyName: item.properties?.name || "-",
    producerId: item.producer_id,
    producerName: item.producers?.name || "-",
    veterinarioId: item.veterinario_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

const animalSelect = `
  id,
  identification,
  name,
  breed,
  sex,
  category,
  status,
  birth_date,
  property_id,
  producer_id,
  veterinario_id,
  created_at,
  updated_at,
  properties (
    id,
    name
  ),
  producers (
    id,
    name
  )
`;

export async function createAnimal({
  identification,
  name,
  breed,
  sex = "femea",
  category = "matriz",
  status = "ativo",
  birthDate,
  propertyId,
  producerId,
  veterinarioId,
}) {
  const payload = {
    identification: identification.trim(),
    name: name?.trim() || null,
    breed: breed?.trim() || null,
    sex,
    category,
    status,
    birth_date: birthDate || null,
    property_id: propertyId,
    producer_id: producerId,
    veterinario_id: veterinarioId,
  };

  const { data, error } = await supabase
    .from("animals")
    .insert(payload)
    .select(animalSelect)
    .single();

  if (error) {
    console.error("Erro Supabase ao criar animal:", error);
    throw error;
  }

  return mapAnimal(data);
}

export async function updateAnimal(animalId, data) {
  const payload = {
    identification: data.identification.trim(),
    name: data.name?.trim() || null,
    breed: data.breed?.trim() || null,
    sex: data.sex,
    category: data.category,
    status: data.status,
    birth_date: data.birthDate || null,
    property_id: data.propertyId,
    producer_id: data.producerId,
    veterinario_id: data.veterinarioId,
  };

  const { error } = await supabase
    .from("animals")
    .update(payload)
    .eq("id", animalId);

  if (error) {
    console.error("Erro Supabase ao atualizar animal:", error);
    throw error;
  }
}

export async function getAnimalsByVet(veterinarioId) {
  const { data, error } = await supabase
    .from("animals")
    .select(animalSelect)
    .eq("veterinario_id", veterinarioId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar animais do vet:", error);
    throw error;
  }

  return (data || []).map(mapAnimal);
}

export async function getAnimalsByProducer(producerId) {
  const { data, error } = await supabase
    .from("animals")
    .select(animalSelect)
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar animais do produtor:", error);
    throw error;
  }

  return (data || []).map(mapAnimal);
}

export async function getAnimalsByProperty(propertyId) {
  const { data, error } = await supabase
    .from("animals")
    .select(animalSelect)
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar animais da propriedade:", error);
    throw error;
  }

  return (data || []).map(mapAnimal);
}