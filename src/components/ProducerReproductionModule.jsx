import { useEffect, useMemo, useState } from "react";
import { getAnimalsByProducer } from "../services/animal";
import { getReproductionRecordsByProducer } from "../services/reproduction";
import { formatDateBR } from "../utils/formatters";

const eventTypeLabels = {
  cio: "Cio",
  cobertura: "Cobertura",
  inseminacao: "Inseminação",
  diagnostico_gestacao: "Diagnóstico de gestação",
  parto: "Parto",
  aborto: "Aborto",
  observacao: "Observação",
};

const methodLabels = {
  monta_natural: "Monta natural",
  inseminacao_artificial: "Inseminação artificial",
  iatf: "IATF",
  nao_aplicavel: "Não aplicável",
};

const diagnosisLabels = {
  prenhe: "Prenhe",
  vazia: "Vazia",
  inconclusivo: "Inconclusivo",
  nao_aplicavel: "Não aplicável",
};

function SectionCard({ title, onRefresh, children }) {
  return (
    <div className="rounded-2xl bg-white shadow-lg p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-800">{title}</h2>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition"
          >
            Atualizar
          </button>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-zinc-500">{text}</p>;
}

function MessageText({ message, type = "default" }) {
  if (!message) return null;

  const typeClasses = {
    default: "text-zinc-600",
    error: "text-red-700",
    warning: "text-amber-700",
  };

  return (
    <p className={`mt-4 text-sm ${typeClasses[type] || typeClasses.default}`}>
      {message}
    </p>
  );
}

function CalvingAlerts({ records }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alerts = records
    .filter((r) => r.expectedCalvingDate)
    .map((r) => {
      const calving = new Date(r.expectedCalvingDate + "T00:00:00");
      const diffDays = Math.round((calving - today) / (1000 * 60 * 60 * 24));
      return { ...r, diffDays, calving };
    })
    .filter((r) => r.diffDays <= 30)
    .sort((a, b) => a.diffDays - b.diffDays);

  if (alerts.length === 0) return null;

  function urgencyConfig(diffDays) {
    if (diffDays < 0)
      return {
        label: `Atrasado ${Math.abs(diffDays)}d`,
        bg: "bg-red-50 border-red-300",
        badge: "bg-red-100 text-red-700",
        dot: "bg-red-500",
      };
    if (diffDays === 0)
      return {
        label: "Hoje",
        bg: "bg-red-50 border-red-300",
        badge: "bg-red-100 text-red-700",
        dot: "bg-red-500",
      };
    if (diffDays <= 7)
      return {
        label: `em ${diffDays}d`,
        bg: "bg-amber-50 border-amber-300",
        badge: "bg-amber-100 text-amber-700",
        dot: "bg-amber-500",
      };
    return {
      label: `em ${diffDays}d`,
      bg: "bg-blue-50 border-blue-200",
      badge: "bg-blue-100 text-blue-700",
      dot: "bg-blue-400",
    };
  }

  return (
    <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🐄</span>
        <h2 className="text-base font-bold text-zinc-800">
          Previsões de parto próximas
        </h2>
        <span className="ml-auto text-xs font-semibold bg-zinc-900 text-white px-2 py-0.5 rounded-full">
          {alerts.length}
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((r) => {
          const cfg = urgencyConfig(r.diffDays);
          return (
            <div
              key={r.id}
              className={`flex items-center gap-3 rounded-xl border p-3 ${cfg.bg}`}
            >
              <span className={`h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 truncate">
                  {r.animalIdentification}
                  {r.animalName ? ` — ${r.animalName}` : ""}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {r.propertyName} · Parto previsto:{" "}
                  {r.calving.toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProducerReproductionModule({
  producerId,
  properties,
  animals,
  records,
  loadingAnimals,
  loadingRecords,
  onAnimalsChange,
  onRecordsChange,
  onStatsChange,
}) {
  const [animalMessage, setAnimalMessage] = useState("");
  const [recordMessage, setRecordMessage] = useState("");

  const [animalSearch, setAnimalSearch] = useState("");
  const [animalPropertyFilter, setAnimalPropertyFilter] = useState("");
  const [animalStatusFilter, setAnimalStatusFilter] = useState("");

  const [recordSearch, setRecordSearch] = useState("");
  const [recordPropertyFilter, setRecordPropertyFilter] = useState("");
  const [recordEventFilter, setRecordEventFilter] = useState("");

  useEffect(() => {
    if (!onStatsChange) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const calvingAlerts = records.filter((r) => {
      if (!r.expectedCalvingDate) return false;
      const calving = new Date(r.expectedCalvingDate + "T00:00:00");
      const diffDays = Math.round((calving - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;

    onStatsChange({
      animals: animals.length,
      activeAnimals: animals.filter((animal) => animal.status === "ativo").length,
      females: animals.filter((animal) => animal.sex === "femea").length,
      males: animals.filter((animal) => animal.sex === "macho").length,
      calvingAlerts,
    });
  }, [animals, records, onStatsChange]);

  async function refreshAnimals() {
    if (!producerId) return;
    try {
      const data = await getAnimalsByProducer(producerId);
      onAnimalsChange(data);
    } catch (error) {
      console.error("Erro ao atualizar animais:", error);
    }
  }

  async function refreshRecords() {
    if (!producerId) return;
    try {
      const data = await getReproductionRecordsByProducer(producerId);
      onRecordsChange(data);
    } catch (error) {
      console.error("Erro ao atualizar histórico:", error);
    }
  }

  function clearAnimalFilters() {
    setAnimalSearch("");
    setAnimalPropertyFilter("");
    setAnimalStatusFilter("");
  }

  function clearRecordFilters() {
    setRecordSearch("");
    setRecordPropertyFilter("");
    setRecordEventFilter("");
  }

  const filteredAnimals = useMemo(() => {
    const search = animalSearch.trim().toLowerCase();

    return animals.filter((animal) => {
      const matchesProperty = animalPropertyFilter
        ? animal.propertyId === animalPropertyFilter
        : true;

      const matchesStatus = animalStatusFilter
        ? animal.status === animalStatusFilter
        : true;

      const matchesSearch = search
        ? [
            animal.identification,
            animal.name,
            animal.breed,
            animal.category,
            animal.status,
            animal.propertyName,
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search))
        : true;

      return matchesProperty && matchesStatus && matchesSearch;
    });
  }, [animals, animalSearch, animalPropertyFilter, animalStatusFilter]);

  const filteredRecords = useMemo(() => {
    const search = recordSearch.trim().toLowerCase();

    return records.filter((record) => {
      const matchesProperty = recordPropertyFilter
        ? record.propertyId === recordPropertyFilter
        : true;

      const matchesEvent = recordEventFilter
        ? record.eventType === recordEventFilter
        : true;

      const matchesSearch = search
        ? [
            record.animalIdentification,
            record.animalName,
            eventTypeLabels[record.eventType],
            record.propertyName,
            record.notes,
            record.bullOrSemen,
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search))
        : true;

      return matchesProperty && matchesEvent && matchesSearch;
    });
  }, [records, recordSearch, recordPropertyFilter, recordEventFilter]);

  if (!producerId) {
    return (
      <SectionCard title="Reprodução">
        <MessageText
          message="Seu usuário ainda não foi vinculado a um produtor cadastrado pelo veterinário."
          type="warning"
        />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <CalvingAlerts records={records} />
      <SectionCard title="Meus animais" onRefresh={refreshAnimals}>
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <input
            type="text"
            value={animalSearch}
            onChange={(e) => setAnimalSearch(e.target.value)}
            placeholder="Buscar animal"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
          />

          <select
            value={animalPropertyFilter}
            onChange={(e) => setAnimalPropertyFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
          >
            <option value="">Todas as propriedades</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          <select
            value={animalStatusFilter}
            onChange={(e) => setAnimalStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="vendido">Vendido</option>
            <option value="morto">Morto</option>
            <option value="descartado">Descartado</option>
          </select>

          <button
            type="button"
            onClick={clearAnimalFilters}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100 transition"
          >
            Limpar filtros
          </button>
        </div>

        {loadingAnimals ? (
          <EmptyState text="Carregando animais..." />
        ) : filteredAnimals.length === 0 ? (
          <EmptyState text="Nenhum animal cadastrado para suas propriedades." />
        ) : (
          <div className="space-y-4">
            {filteredAnimals.map((animal) => (
              <div
                key={animal.id}
                className="rounded-xl border border-zinc-200 p-4"
              >
                <p className="text-lg font-semibold text-zinc-800">
                  {animal.identification}
                  {animal.name ? ` - ${animal.name}` : ""}
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  Propriedade: {animal.propertyName}
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  Categoria: {animal.category} | Sexo: {animal.sex} | Status:{" "}
                  {animal.status}
                </p>

                {animal.breed && (
                  <p className="mt-1 text-sm text-zinc-600">
                    Raça: {animal.breed}
                  </p>
                )}

                {animal.birthDate && (
                  <p className="mt-1 text-sm text-zinc-600">
                    Nascimento: {formatDateBR(animal.birthDate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <MessageText message={animalMessage} type="error" />
      </SectionCard>

      <SectionCard title="Histórico reprodutivo" onRefresh={refreshRecords}>
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <input
            type="text"
            value={recordSearch}
            onChange={(e) => setRecordSearch(e.target.value)}
            placeholder="Buscar registro"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
          />

          <select
            value={recordPropertyFilter}
            onChange={(e) => setRecordPropertyFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
          >
            <option value="">Todas as propriedades</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          <select
            value={recordEventFilter}
            onChange={(e) => setRecordEventFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
          >
            <option value="">Todos os eventos</option>
            <option value="cio">Cio</option>
            <option value="cobertura">Cobertura</option>
            <option value="inseminacao">Inseminação</option>
            <option value="diagnostico_gestacao">Diagnóstico</option>
            <option value="parto">Parto</option>
            <option value="aborto">Aborto</option>
            <option value="observacao">Observação</option>
          </select>

          <button
            type="button"
            onClick={clearRecordFilters}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100 transition"
          >
            Limpar filtros
          </button>
        </div>

        {loadingRecords ? (
          <EmptyState text="Carregando histórico..." />
        ) : filteredRecords.length === 0 ? (
          <EmptyState text="Nenhum registro reprodutivo disponível ainda." />
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-zinc-200 p-4"
              >
                <p className="text-lg font-semibold text-zinc-800">
                  {eventTypeLabels[record.eventType] || record.eventType}
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  Animal: {record.animalIdentification}
                  {record.animalName ? ` - ${record.animalName}` : ""}
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  Propriedade: {record.propertyName}
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  Data: {formatDateBR(record.eventDate)}
                </p>

                {record.method !== "nao_aplicavel" && (
                  <p className="mt-1 text-sm text-zinc-600">
                    Método: {methodLabels[record.method] || record.method}
                  </p>
                )}

                {record.bullOrSemen && (
                  <p className="mt-1 text-sm text-zinc-600">
                    Touro/sêmen: {record.bullOrSemen}
                  </p>
                )}

                {record.diagnosisResult !== "nao_aplicavel" && (
                  <p className="mt-1 text-sm text-zinc-600">
                    Diagnóstico:{" "}
                    {diagnosisLabels[record.diagnosisResult] ||
                      record.diagnosisResult}
                  </p>
                )}

                {record.expectedCalvingDate && (
                  <p className="mt-1 text-sm text-zinc-600">
                    Previsão de parto: {formatDateBR(record.expectedCalvingDate)}
                  </p>
                )}

                {record.notes && (
                  <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-sm text-zinc-700">{record.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <MessageText message={recordMessage} type="error" />
      </SectionCard>
    </div>
  );
}

export default ProducerReproductionModule;