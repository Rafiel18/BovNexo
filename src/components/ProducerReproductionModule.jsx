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

function ProducerReproductionModule({ producerId, properties, onStatsChange }) {
  const [animals, setAnimals] = useState([]);
  const [records, setRecords] = useState([]);

  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);

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

    onStatsChange({
      animals: animals.length,
      activeAnimals: animals.filter((animal) => animal.status === "ativo")
        .length,
      females: animals.filter((animal) => animal.sex === "femea").length,
      males: animals.filter((animal) => animal.sex === "macho").length,
    });
  }, [animals, onStatsChange]);

  async function loadAnimals() {
    if (!producerId) return;

    setLoadingAnimals(true);
    setAnimalMessage("");

    try {
      const data = await getAnimalsByProducer(producerId);
      setAnimals(data);
    } catch (error) {
      console.error("Erro ao carregar animais do produtor:", error);
      setAnimalMessage(error.message || "Não foi possível carregar os animais.");
    } finally {
      setLoadingAnimals(false);
    }
  }

  async function loadRecords() {
    if (!producerId) return;

    setLoadingRecords(true);
    setRecordMessage("");

    try {
      const data = await getReproductionRecordsByProducer(producerId);
      setRecords(data);
    } catch (error) {
      console.error("Erro ao carregar histórico reprodutivo:", error);
      setRecordMessage(
        error.message || "Não foi possível carregar o histórico reprodutivo."
      );
    } finally {
      setLoadingRecords(false);
    }
  }

  async function loadReproductionData() {
    await Promise.all([loadAnimals(), loadRecords()]);
  }

  useEffect(() => {
    if (!producerId) {
      setAnimals([]);
      setRecords([]);
      setLoadingAnimals(false);
      setLoadingRecords(false);
      return;
    }

    loadReproductionData();
  }, [producerId]);

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
      <SectionCard title="Meus animais" onRefresh={loadAnimals}>
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

      <SectionCard title="Histórico reprodutivo" onRefresh={loadRecords}>
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