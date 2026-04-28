export function formatDateBR(dateString) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("pt-BR");
}

export function taskStatusLabel(status) {
  if (status === "pendente") return "Pendente";
  if (status === "concluida") return "Concluída";
  return status;
}

export function occurrenceStatusLabel(status) {
  if (status === "aberta") return "Aberta";
  if (status === "em_analise") return "Em análise";
  if (status === "resolvida") return "Resolvida";
  return status;
}

export function getTaskStatusBadgeClass(status) {
  if (status === "concluida") {
    return "bg-green-100 text-green-800 border border-green-200";
  }

  return "bg-amber-100 text-amber-800 border border-amber-200";
}

export function getOccurrenceStatusBadgeClass(status) {
  if (status === "resolvida") {
    return "bg-green-100 text-green-800 border border-green-200";
  }

  if (status === "em_analise") {
    return "bg-blue-100 text-blue-800 border border-blue-200";
  }

  return "bg-red-100 text-red-800 border border-red-200";
}