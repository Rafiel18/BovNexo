import { supabase } from "../lib/supabaseClient";

function mapReproductionRecord(item) {
  return {
    id: item.id,
    animalId: item.animal_id,
    animalIdentification: item.animals?.identification || "-",
    animalName: item.animals?.name || "",
    eventType: item.event_type,
    eventDate: item.event_date,
    method: item.method,
    bullOrSemen: item.bull_or_semen || "",
    diagnosisResult: item.diagnosis_result,
    expectedCalvingDate: item.expected_calving_date,
    notes: item.notes || "",
    propertyId: item.property_id,
    propertyName: item.properties?.name || "-",
    producerId: item.producer_id,
    producerName: item.producers?.name || "-",
    veterinarioId: item.veterinario_id,
    createdByUserUid: item.created_by_user_uid,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

const reproductionSelect = `
  id,
  animal_id,
  event_type,
  event_date,
  method,
  bull_or_semen,
  diagnosis_result,
  expected_calving_date,
  notes,
  property_id,
  producer_id,
  veterinario_id,
  created_by_user_uid,
  created_at,
  updated_at,
  animals (
    id,
    identification,
    name
  ),
  properties (
    id,
    name
  ),
  producers (
    id,
    name
  )
`;

export async function createReproductionRecord({
  animalId,
  eventType,
  eventDate,
  method = "nao_aplicavel",
  bullOrSemen,
  diagnosisResult = "nao_aplicavel",
  expectedCalvingDate,
  notes,
  propertyId,
  producerId,
  veterinarioId,
  createdByUserUid,
}) {
  const payload = {
    animal_id: animalId,
    event_type: eventType,
    event_date: eventDate,
    method,
    bull_or_semen: bullOrSemen?.trim() || null,
    diagnosis_result: diagnosisResult,
    expected_calving_date: expectedCalvingDate || null,
    notes: notes?.trim() || null,
    property_id: propertyId,
    producer_id: producerId,
    veterinario_id: veterinarioId,
    created_by_user_uid: createdByUserUid,
  };

  const { data, error } = await supabase
    .from("reproduction_records")
    .insert(payload)
    .select(reproductionSelect)
    .single();

  if (error) {
    console.error("Erro Supabase ao criar registro reprodutivo:", error);
    throw error;
  }

  return mapReproductionRecord(data);
}

export async function getReproductionRecordsByVet(veterinarioId) {
  const { data, error } = await supabase
    .from("reproduction_records")
    .select(reproductionSelect)
    .eq("veterinario_id", veterinarioId)
    .order("event_date", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar registros do vet:", error);
    throw error;
  }

  return (data || []).map(mapReproductionRecord);
}

export async function getReproductionRecordsByProducer(producerId) {
  const { data, error } = await supabase
    .from("reproduction_records")
    .select(reproductionSelect)
    .eq("producer_id", producerId)
    .order("event_date", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar registros do produtor:", error);
    throw error;
  }

  return (data || []).map(mapReproductionRecord);
}

export async function getReproductionRecordsByAnimal(animalId) {
  const { data, error } = await supabase
    .from("reproduction_records")
    .select(reproductionSelect)
    .eq("animal_id", animalId)
    .order("event_date", { ascending: false });

  if (error) {
    console.error("Erro Supabase ao buscar histórico do animal:", error);
    throw error;
  }

  return (data || []).map(mapReproductionRecord);
}