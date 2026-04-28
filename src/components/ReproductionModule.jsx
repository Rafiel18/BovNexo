import { useEffect, useMemo, useState } from "react";
import { createAnimal, getAnimalsByVet } from "../services/animal";
import {
  createReproductionRecord,
  getReproductionRecordsByVet,
} from "../services/reproduction";
import { formatDateBR } from "../utils/formatters";

const initialAnimalForm = {
  identification: "",
  name: "",
  breed: "",
  sex: "femea",
  category: "matriz",
  status: "ativo",
  birthDate: "",
  propertyId: "",
};

const initialRecordForm = {
  animalId: "",
  eventType: "cio",
  eventDate: "",
  method: "nao_aplicavel",
  bullOrSemen: "",
  diagnosisResult: "nao_aplicavel",
  expectedCalvingDate: "",
  notes: "",
};

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

function MessageText({ message, type = "default" }) {
  if (!message) return null;

  const typeClasses = {
    default: "text-zinc-600",
    success: "text-green-700",
    error: "text-red-700",
    warning: "text-amber-700",
  };

  return (
    <p className={`mt-4 text-sm ${typeClasses[type] || typeClasses.default}`}>
      {message}
    </p>
  );
}

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

function ReproductionModule({ properties, vetUid, onStatsChange }) {
  const [animalForm, setAnimalForm] = useState(initialAnimalForm);
  const [recordForm, setRecordForm] = useState(initialRecordForm);

  const [animals, setAnimals] = useState([]);
  const [records, setRecords] = useState([]);

  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const [savingAnimal, setSavingAnimal] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  const [animalMessage, setAnimalMessage] = useState("");
  const [recordMessage, setRecordMessage] = useState("");

  const [animalSearch, setAnimalSearch] = useState("");
  const [animalPropertyFilter, setAnimalPropertyFilter] = useState("");
  const [animalStatusFilter, setAnimalStatusFilter] = useState("");

  const [recordSearch, setRecordSearch] = useState("");
  const [recordEventFilter, setRecordEventFilter] = useState("");
  const [recordPropertyFilter, setRecordPropertyFilter] = useState("");

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

  function handleAnimalChange(e) {
    const { name, value } = e.target;
    setAnimalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRecordChange(e) {
    const { name, value } = e.target;

    setRecordForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "eventType") {
        if (value === "cobertura") {
          next.method = "monta_natural";
          next.diagnosisResult = "nao_aplicavel";
        }

        if (value === "inseminacao") {
          next.method = "inseminacao_artificial";
          next.diagnosisResult = "nao_aplicavel";
        }

        if (value === "diagnostico_gestacao") {
          next.method = "nao_aplicavel";
          next.diagnosisResult = "prenhe";
        }

        if (
          value === "cio" ||
          value === "parto" ||
          value === "aborto" ||
          value === "observacao"
        ) {
          next.method = "nao_aplicavel";
          next.diagnosisResult = "nao_aplicavel";
          next.bullOrSemen = "";
          next.expectedCalvingDate = "";
        }
      }

      return next;
    });
  }

  function resetAnimalForm() {
    setAnimalForm(initialAnimalForm);
  }

  function resetRecordForm() {
    setRecordForm(initialRecordForm);
  }

  function clearAnimalFilters() {
    setAnimalSearch("");
    setAnimalPropertyFilter("");
    setAnimalStatusFilter("");
  }

  function clearRecordFilters() {
    setRecordSearch("");
    setRecordEventFilter("");
    setRecordPropertyFilter("");
  }

  async function loadAnimals() {
    if (!vetUid) return;

    setLoadingAnimals(true);

    try {
      const data = await getAnimalsByVet(vetUid);
      setAnimals(data);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
      setAnimalMessage(error.message || "Não foi possível carregar os animais.");
    } finally {
      setLoadingAnimals(false);
    }
  }

  async function loadRecords() {
    if (!vetUid) return;

    setLoadingRecords(true);

    try {
      const data = await getReproductionRecordsByVet(vetUid);
      setRecords(data);
    } catch (error) {
      console.error("Erro ao carregar registros reprodutivos:", error);
      setRecordMessage(
        error.message || "Não foi possível carregar os registros reprodutivos."
      );
    } finally {
      setLoadingRecords(false);
    }
  }

  async function loadReproductionData() {
    await Promise.all([loadAnimals(), loadRecords()]);
  }

  useEffect(() => {
    loadReproductionData();
  }, [vetUid]);

  async function handleAnimalSubmit(e) {
    e.preventDefault();

    if (!vetUid) return;

    setSavingAnimal(true);
    setAnimalMessage("");
    setRecordMessage("");

    try {
      const selectedProperty = properties.find(
        (property) => property.id === animalForm.propertyId
      );

      if (!selectedProperty) {
        setAnimalMessage("Selecione uma propriedade válida.");
        return;
      }

      await createAnimal({
        identification: animalForm.identification,
        name: animalForm.name,
        breed: animalForm.breed,
        sex: animalForm.sex,
        category: animalForm.category,
        status: animalForm.status,
        birthDate: animalForm.birthDate,
        propertyId: selectedProperty.id,
        producerId: selectedProperty.producerId,
        veterinarioId: vetUid,
      });

      resetAnimalForm();
      setAnimalMessage("Animal cadastrado com sucesso.");
      await loadAnimals();
    } catch (error) {
      console.error("Erro ao salvar animal:", error);
      setAnimalMessage(error.message || "Erro ao salvar animal.");
    } finally {
      setSavingAnimal(false);
    }
  }

  async function handleRecordSubmit(e) {
    e.preventDefault();

    if (!vetUid) return;

    setSavingRecord(true);
    setRecordMessage("");
    setAnimalMessage("");

    try {
      const selectedAnimal = animals.find(
        (animal) => animal.id === recordForm.animalId
      );

      if (!selectedAnimal) {
        setRecordMessage("Selecione um animal válido.");
        return;
      }

      await createReproductionRecord({
        animalId: selectedAnimal.id,
        eventType: recordForm.eventType,
        eventDate: recordForm.eventDate,
        method: recordForm.method,
        bullOrSemen: recordForm.bullOrSemen,
        diagnosisResult: recordForm.diagnosisResult,
        expectedCalvingDate: recordForm.expectedCalvingDate,
        notes: recordForm.notes,
        propertyId: selectedAnimal.propertyId,
        producerId: selectedAnimal.producerId,
        veterinarioId: vetUid,
        createdByUserUid: vetUid,
      });

      resetRecordForm();
      setRecordMessage("Registro reprodutivo salvo com sucesso.");
      await loadRecords();
    } catch (error) {
      console.error("Erro ao salvar registro reprodutivo:", error);
      setRecordMessage(error.message || "Erro ao salvar registro reprodutivo.");
    } finally {
      setSavingRecord(false);
    }
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
            animal.producerName,
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
      const matchesEvent = recordEventFilter
        ? record.eventType === recordEventFilter
        : true;

      const matchesProperty = recordPropertyFilter
        ? record.propertyId === recordPropertyFilter
        : true;

      const matchesSearch = search
        ? [
            record.animalIdentification,
            record.animalName,
            eventTypeLabels[record.eventType],
            record.propertyName,
            record.producerName,
            record.notes,
            record.bullOrSemen,
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search))
        : true;

      return matchesEvent && matchesProperty && matchesSearch;
    });
  }, [records, recordSearch, recordEventFilter, recordPropertyFilter]);

  const selectedEventType = recordForm.eventType;

  const shouldShowMethod =
    selectedEventType === "cobertura" || selectedEventType === "inseminacao";

  const shouldShowDiagnosis = selectedEventType === "diagnostico_gestacao";

  const shouldShowExpectedCalving =
    selectedEventType === "diagnostico_gestacao" ||
    selectedEventType === "inseminacao" ||
    selectedEventType === "cobertura";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Cadastrar animal / matriz">
          <form onSubmit={handleAnimalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Propriedade
              </label>
              <select
                name="propertyId"
                value={animalForm.propertyId}
                onChange={handleAnimalChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                required
              >
                <option value="">Selecione uma propriedade</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Identificação
              </label>
              <input
                type="text"
                name="identification"
                value={animalForm.identification}
                onChange={handleAnimalChange}
                placeholder="Ex.: Brinco 023, Matriz 12"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Nome/apelido
                </label>
                <input
                  type="text"
                  name="name"
                  value={animalForm.name}
                  onChange={handleAnimalChange}
                  placeholder="Opcional"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Raça
                </label>
                <input
                  type="text"
                  name="breed"
                  value={animalForm.breed}
                  onChange={handleAnimalChange}
                  placeholder="Ex.: Nelore, Girolando"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Sexo
                </label>
                <select
                  name="sex"
                  value={animalForm.sex}
                  onChange={handleAnimalChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                >
                  <option value="femea">Fêmea</option>
                  <option value="macho">Macho</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Categoria
                </label>
                <select
                  name="category"
                  value={animalForm.category}
                  onChange={handleAnimalChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                >
                  <option value="matriz">Matriz</option>
                  <option value="novilha">Novilha</option>
                  <option value="vaca">Vaca</option>
                  <option value="touro">Touro</option>
                  <option value="bezerra">Bezerra</option>
                  <option value="bezerro">Bezerro</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={animalForm.status}
                  onChange={handleAnimalChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                >
                  <option value="ativo">Ativo</option>
                  <option value="vendido">Vendido</option>
                  <option value="morto">Morto</option>
                  <option value="descartado">Descartado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Data de nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                value={animalForm.birthDate}
                onChange={handleAnimalChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
              />
            </div>

            <button
              type="submit"
              disabled={savingAnimal || properties.length === 0}
              className="w-full rounded-lg bg-zinc-900 py-3 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-60"
            >
              {savingAnimal ? "Salvando..." : "Salvar animal"}
            </button>
          </form>

          {properties.length === 0 && (
            <MessageText
              message="Cadastre uma propriedade antes de cadastrar animais."
              type="warning"
            />
          )}

          <MessageText
            message={animalMessage}
            type={
              animalMessage.toLowerCase().includes("sucesso")
                ? "success"
                : animalMessage
                ? "error"
                : "default"
            }
          />
        </SectionCard>

        <SectionCard title="Registrar evento reprodutivo">
          <form onSubmit={handleRecordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Animal
              </label>
              <select
                name="animalId"
                value={recordForm.animalId}
                onChange={handleRecordChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                required
              >
                <option value="">Selecione um animal</option>
                {animals.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.identification}
                    {animal.name ? ` - ${animal.name}` : ""} |{" "}
                    {animal.propertyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Tipo de evento
                </label>
                <select
                  name="eventType"
                  value={recordForm.eventType}
                  onChange={handleRecordChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                >
                  <option value="cio">Cio</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="inseminacao">Inseminação</option>
                  <option value="diagnostico_gestacao">
                    Diagnóstico de gestação
                  </option>
                  <option value="parto">Parto</option>
                  <option value="aborto">Aborto</option>
                  <option value="observacao">Observação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Data do evento
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={recordForm.eventDate}
                  onChange={handleRecordChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                  required
                />
              </div>
            </div>

            {shouldShowMethod && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Método
                </label>
                <select
                  name="method"
                  value={recordForm.method}
                  onChange={handleRecordChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                >
                  <option value="monta_natural">Monta natural</option>
                  <option value="inseminacao_artificial">
                    Inseminação artificial
                  </option>
                  <option value="iatf">IATF</option>
                  <option value="nao_aplicavel">Não aplicável</option>
                </select>
              </div>
            )}

            {shouldShowMethod && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Touro / sêmen
                </label>
                <input
                  type="text"
                  name="bullOrSemen"
                  value={recordForm.bullOrSemen}
                  onChange={handleRecordChange}
                  placeholder="Ex.: Touro 07, sêmen Nelore X"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                />
              </div>
            )}

            {shouldShowDiagnosis && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Resultado do diagnóstico
                </label>
                <select
                  name="diagnosisResult"
                  value={recordForm.diagnosisResult}
                  onChange={handleRecordChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                >
                  <option value="prenhe">Prenhe</option>
                  <option value="vazia">Vazia</option>
                  <option value="inconclusivo">Inconclusivo</option>
                  <option value="nao_aplicavel">Não aplicável</option>
                </select>
              </div>
            )}

            {shouldShowExpectedCalving && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Previsão de parto
                </label>
                <input
                  type="date"
                  name="expectedCalvingDate"
                  value={recordForm.expectedCalvingDate}
                  onChange={handleRecordChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Observações
              </label>
              <textarea
                name="notes"
                value={recordForm.notes}
                onChange={handleRecordChange}
                placeholder="Detalhes clínicos, manejo, observações do campo..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 min-h-[100px]"
              />
            </div>

            <button
              type="submit"
              disabled={savingRecord || animals.length === 0}
              className="w-full rounded-lg bg-zinc-900 py-3 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-60"
            >
              {savingRecord ? "Salvando..." : "Salvar evento"}
            </button>
          </form>

          {animals.length === 0 && (
            <MessageText
              message="Cadastre pelo menos um animal antes de registrar eventos reprodutivos."
              type="warning"
            />
          )}

          <MessageText
            message={recordMessage}
            type={
              recordMessage.toLowerCase().includes("sucesso")
                ? "success"
                : recordMessage
                ? "error"
                : "default"
            }
          />
        </SectionCard>
      </div>

      <SectionCard title="Animais cadastrados" onRefresh={loadAnimals}>
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
          <EmptyState text="Nenhum animal cadastrado ainda." />
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
                  Produtor: {animal.producerName}
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
          <EmptyState text="Nenhum registro reprodutivo cadastrado ainda." />
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
      </SectionCard>
    </div>
  );
}

export default ReproductionModule;