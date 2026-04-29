import { useEffect, useMemo, useState } from "react";
import ReproductionModule from "../components/ReproductionModule";

import {
  createProperty,
  getPropertiesByVet,
  updateProperty,
} from "../services/property";

import {
  createProducer,
  getProducersByVet,
  updateProducer,
} from "../services/producer";

import { createTask, getTasksByVet } from "../services/task";

import {
  getOccurrencesByVet,
  updateOccurrenceResponse,
  updateOccurrenceStatus,
} from "../services/occurrence";

import {
  formatDateBR,
  getOccurrenceStatusBadgeClass,
  getTaskStatusBadgeClass,
  occurrenceStatusLabel,
  taskStatusLabel,
} from "../utils/formatters";

const occurrenceStatusOptions = [
  { value: "aberta", label: "Aberta" },
  { value: "em_analise", label: "Em análise" },
  { value: "resolvida", label: "Resolvida" },
];

const initialPropertyForm = {
  name: "",
  city: "",
  producerId: "",
};

const initialProducerForm = {
  name: "",
  email: "",
  phone: "",
};

const initialTaskForm = {
  propertyId: "",
  title: "",
  description: "",
  date: "",
};

function InfoCard({ label, value, valueClassName = "text-zinc-800" }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`text-lg font-medium ${valueClassName}`}>{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-800">{value}</p>
    </div>
  );
}

function SectionCard({ title, onRefresh, children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white shadow-lg p-5 sm:p-8 ${className}`}>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold text-zinc-800 sm:text-2xl">
          {title}
        </h2>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:w-auto"
          >
            Atualizar
          </button>
        )}
      </div>

      <div className="mt-5 sm:mt-6">{children}</div>
    </div>
  );
}

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

function EmptyState({ text }) {
  return <p className="text-zinc-500">{text}</p>;
}

function VetDashboard({ userData, authUser, onLogout }) {
  const [propertyForm, setPropertyForm] = useState(initialPropertyForm);
  const [producerForm, setProducerForm] = useState(initialProducerForm);
  const [taskForm, setTaskForm] = useState(initialTaskForm);

  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [editingProducerId, setEditingProducerId] = useState(null);

  const [properties, setProperties] = useState([]);
  const [producers, setProducers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [occurrences, setOccurrences] = useState([]);

  const [reproductionStats, setReproductionStats] = useState({
    animals: 0,
    activeAnimals: 0,
    females: 0,
    males: 0,
  });

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingProducers, setLoadingProducers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingOccurrences, setLoadingOccurrences] = useState(true);

  const [savingProperty, setSavingProperty] = useState(false);
  const [savingProducer, setSavingProducer] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [updatingOccurrenceId, setUpdatingOccurrenceId] = useState(null);
  const [savingResponseId, setSavingResponseId] = useState(null);

  const [propertyMessage, setPropertyMessage] = useState("");
  const [producerMessage, setProducerMessage] = useState("");
  const [taskMessage, setTaskMessage] = useState("");
  const [occurrenceMessage, setOccurrenceMessage] = useState("");

  const [occurrenceResponses, setOccurrenceResponses] = useState({});

  const [producerSearch, setProducerSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");

  const [taskSearch, setTaskSearch] = useState("");
  const [taskPropertyFilter, setTaskPropertyFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");

  const [occurrenceSearch, setOccurrenceSearch] = useState("");
  const [occurrencePropertyFilter, setOccurrencePropertyFilter] = useState("");
  const [occurrenceStatusFilter, setOccurrenceStatusFilter] = useState("");

  const vetUid = authUser?.id;

  const dashboardCards = useMemo(
    () => [
      {
        label: "Tipo de conta",
        value: "Veterinário",
        valueClassName: "text-zinc-800",
      },
      {
        label: "Status da validação",
        value:
          userData.approvalStatus === "pending"
            ? "Aguardando validação"
            : userData.approvalStatus || "Não definido",
        valueClassName:
          userData.approvalStatus === "pending"
            ? "text-amber-600"
            : userData.approvalStatus === "approved"
            ? "text-green-700"
            : "text-zinc-800",
      },
      {
        label: "E-mail",
        value: userData.email,
        valueClassName: "text-zinc-800",
      },
      {
        label: "CRMV",
        value: userData.crmv || "Não informado",
        valueClassName: "text-zinc-800",
      },
    ],
    [userData]
  );

  function handlePropertyChange(e) {
    const { name, value } = e.target;
    setPropertyForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleProducerChange(e) {
    const { name, value } = e.target;
    setProducerForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTaskChange(e) {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetPropertyForm() {
    setPropertyForm(initialPropertyForm);
    setEditingPropertyId(null);
  }

  function resetProducerForm() {
    setProducerForm(initialProducerForm);
    setEditingProducerId(null);
  }

  function resetTaskForm() {
    setTaskForm(initialTaskForm);
  }

  function clearTaskFilters() {
    setTaskSearch("");
    setTaskPropertyFilter("");
    setTaskStatusFilter("");
  }

  function clearOccurrenceFilters() {
    setOccurrenceSearch("");
    setOccurrencePropertyFilter("");
    setOccurrenceStatusFilter("");
  }

  function getOccurrenceStatusButtonClass(currentStatus, buttonStatus) {
    const isActive = currentStatus === buttonStatus;

    return `rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-60 ${
      isActive
        ? "border border-zinc-900 bg-zinc-900 text-white"
        : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
    }`;
  }

  function handleOccurrenceResponseChange(occurrenceId, value) {
    setOccurrenceResponses((prev) => ({
      ...prev,
      [occurrenceId]: value,
    }));
  }

  async function loadProperties() {
    if (!vetUid) return;

    setLoadingProperties(true);

    try {
      const data = await getPropertiesByVet(vetUid);
      setProperties(data);
    } catch (error) {
      console.error("Erro ao carregar propriedades:", error);
      setPropertyMessage(
        error.message || "Não foi possível carregar as propriedades."
      );
    } finally {
      setLoadingProperties(false);
    }
  }

  async function loadProducers() {
    if (!vetUid) return;

    setLoadingProducers(true);

    try {
      const data = await getProducersByVet(vetUid);
      setProducers(data);
    } catch (error) {
      console.error("Erro ao carregar produtores:", error);
      setProducerMessage(
        error.message || "Não foi possível carregar os produtores."
      );
    } finally {
      setLoadingProducers(false);
    }
  }

  async function loadTasks() {
    if (!vetUid) return;

    setLoadingTasks(true);

    try {
      const data = await getTasksByVet(vetUid);
      setTasks(data);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setTaskMessage(error.message || "Não foi possível carregar as tarefas.");
    } finally {
      setLoadingTasks(false);
    }
  }

  async function loadOccurrences() {
    if (!vetUid) return;

    setLoadingOccurrences(true);

    try {
      const data = await getOccurrencesByVet(vetUid);
      setOccurrences(data);

      const mappedResponses = {};
      data.forEach((occurrence) => {
        mappedResponses[occurrence.id] = occurrence.vetResponse || "";
      });

      setOccurrenceResponses(mappedResponses);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
      setOccurrenceMessage(
        error.message || "Não foi possível carregar as ocorrências."
      );
    } finally {
      setLoadingOccurrences(false);
    }
  }

  useEffect(() => {
    if (!vetUid) return;

    loadProperties();
    loadProducers();
    loadTasks();
    loadOccurrences();
  }, [vetUid]);

  async function handlePropertySubmit(e) {
    e.preventDefault();

    setSavingProperty(true);
    setPropertyMessage("");
    setProducerMessage("");
    setTaskMessage("");
    setOccurrenceMessage("");

    try {
      const selectedProducer = producers.find(
        (producer) => producer.id === propertyForm.producerId
      );

      if (!selectedProducer) {
        setPropertyMessage("Selecione um produtor válido.");
        return;
      }

      const payload = {
        name: propertyForm.name,
        city: propertyForm.city,
        producerId: selectedProducer.id,
        veterinarioId: vetUid,
      };

      if (editingPropertyId) {
        await updateProperty(editingPropertyId, payload);
        setPropertyMessage("Propriedade atualizada com sucesso.");
      } else {
        await createProperty(payload);
        setPropertyMessage("Propriedade cadastrada com sucesso.");
      }

      resetPropertyForm();
      await loadProperties();
    } catch (error) {
      console.error("Erro ao salvar propriedade:", error);
      setPropertyMessage(error.message || "Erro ao salvar propriedade.");
    } finally {
      setSavingProperty(false);
    }
  }

  async function handleProducerSubmit(e) {
    e.preventDefault();

    setSavingProducer(true);
    setProducerMessage("");
    setPropertyMessage("");
    setTaskMessage("");
    setOccurrenceMessage("");

    try {
      const payload = {
        name: producerForm.name,
        email: producerForm.email,
        phone: producerForm.phone,
        veterinarioId: vetUid,
      };

      if (editingProducerId) {
        await updateProducer(editingProducerId, payload);
        setProducerMessage("Produtor atualizado com sucesso.");
      } else {
        await createProducer(payload);
        setProducerMessage("Produtor cadastrado com sucesso.");
      }

      resetProducerForm();
      await loadProducers();
      await loadProperties();
    } catch (error) {
      console.error("Erro ao salvar produtor:", error);
      setProducerMessage(error.message || "Erro ao salvar produtor.");
    } finally {
      setSavingProducer(false);
    }
  }

  async function handleTaskSubmit(e) {
    e.preventDefault();

    setSavingTask(true);
    setTaskMessage("");
    setProducerMessage("");
    setPropertyMessage("");
    setOccurrenceMessage("");

    try {
      const selectedProperty = properties.find(
        (property) => property.id === taskForm.propertyId
      );

      if (!selectedProperty) {
        setTaskMessage("Selecione uma propriedade válida.");
        return;
      }

      await createTask({
        title: taskForm.title,
        description: taskForm.description,
        date: taskForm.date,
        status: "pendente",
        propertyId: selectedProperty.id,
        producerId: selectedProperty.producerId || "",
        veterinarioId: vetUid,
      });

      resetTaskForm();
      setTaskMessage("Tarefa sanitária cadastrada com sucesso.");
      await loadTasks();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      setTaskMessage(error.message || "Erro ao salvar tarefa.");
    } finally {
      setSavingTask(false);
    }
  }

  async function handleOccurrenceStatusChange(occurrenceId, newStatus) {
    if (!vetUid) return;

    setUpdatingOccurrenceId(occurrenceId);
    setOccurrenceMessage("");

    try {
      await updateOccurrenceStatus(occurrenceId, newStatus, vetUid);
      setOccurrenceMessage("Status da ocorrência atualizado com sucesso.");
      await loadOccurrences();
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error);
      setOccurrenceMessage(
        error.message || "Não foi possível atualizar a ocorrência."
      );
    } finally {
      setUpdatingOccurrenceId(null);
    }
  }

  async function handleSaveOccurrenceResponse(occurrenceId) {
    if (!vetUid) return;

    const responseText = occurrenceResponses[occurrenceId] || "";

    setSavingResponseId(occurrenceId);
    setOccurrenceMessage("");

    try {
      await updateOccurrenceResponse(occurrenceId, responseText, vetUid);
      setOccurrenceMessage("Resposta da ocorrência salva com sucesso.");
      await loadOccurrences();
    } catch (error) {
      console.error("Erro ao salvar resposta da ocorrência:", error);
      setOccurrenceMessage(
        error.message || "Não foi possível salvar a resposta."
      );
    } finally {
      setSavingResponseId(null);
    }
  }

  function handleEditProperty(property) {
    setEditingPropertyId(property.id);
    setPropertyForm({
      name: property.name || "",
      city: property.city || "",
      producerId: property.producerId || "",
    });
    setPropertyMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditProducer(producer) {
    setEditingProducerId(producer.id);
    setProducerForm({
      name: producer.name || "",
      email: producer.email || "",
      phone: producer.phone || "",
    });
    setProducerMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === b.status) {
      return (a.date || "").localeCompare(b.date || "");
    }

    if (a.status === "pendente") return -1;
    if (b.status === "pendente") return 1;

    return 0;
  });

  const sortedOccurrences = [...occurrences].sort((a, b) => {
    const order = {
      aberta: 0,
      em_analise: 1,
      resolvida: 2,
    };

    if (order[a.status] === order[b.status]) {
      return (a.date || "").localeCompare(b.date || "");
    }

    return (order[a.status] ?? 99) - (order[b.status] ?? 99);
  });

  const filteredProducers = useMemo(() => {
    const search = producerSearch.trim().toLowerCase();

    return producers.filter((producer) => {
      return search
        ? [producer.name, producer.email, producer.phone]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search))
        : true;
    });
  }, [producers, producerSearch]);

  const filteredProperties = useMemo(() => {
    const search = propertySearch.trim().toLowerCase();

    return properties.filter((property) => {
      return search
        ? [property.name, property.city, property.producerName]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search))
        : true;
    });
  }, [properties, propertySearch]);

  const filteredTasks = useMemo(() => {
    const search = taskSearch.trim().toLowerCase();

    return sortedTasks.filter((task) => {
      const matchesProperty = taskPropertyFilter
        ? task.propertyId === taskPropertyFilter
        : true;

      const matchesStatus = taskStatusFilter
        ? task.status === taskStatusFilter
        : true;

      const matchesSearch = search
        ? [
            task.title,
            task.description,
            task.propertyName,
            task.producerName,
            task.status,
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search))
        : true;

      return matchesProperty && matchesStatus && matchesSearch;
    });
  }, [sortedTasks, taskSearch, taskPropertyFilter, taskStatusFilter]);

  const filteredOccurrences = useMemo(() => {
    const search = occurrenceSearch.trim().toLowerCase();

    return sortedOccurrences.filter((occurrence) => {
      const matchesProperty = occurrencePropertyFilter
        ? occurrence.propertyId === occurrencePropertyFilter
        : true;

      const matchesStatus = occurrenceStatusFilter
        ? occurrence.status === occurrenceStatusFilter
        : true;

      const matchesSearch = search
        ? [
            occurrence.title,
            occurrence.description,
            occurrence.propertyName,
            occurrence.producerName,
            occurrence.status,
            occurrence.vetResponse,
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search))
        : true;

      return matchesProperty && matchesStatus && matchesSearch;
    });
  }, [
    sortedOccurrences,
    occurrenceSearch,
    occurrencePropertyFilter,
    occurrenceStatusFilter,
  ]);

  const totalProducers = producers.length;
  const totalProperties = properties.length;

  const pendingTasksCount = tasks.filter(
    (task) => task.status === "pendente"
  ).length;

  const openOccurrencesCount = occurrences.filter(
    (item) => item.status === "aberta"
  ).length;

  return (
    <div className="min-h-screen bg-zinc-100 px-3 py-4 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
        <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-8">
          <h1 className="text-2xl font-bold text-zinc-800 sm:text-3xl">
            Painel do Veterinário
          </h1>

          <p className="mt-3 text-zinc-600">
            Bem-vindo, <span className="font-semibold">{userData.name}</span>.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {dashboardCards.map((card) => (
              <InfoCard
                key={card.label}
                label={card.label}
                value={card.value}
                valueClassName={card.valueClassName}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="Produtores" value={totalProducers} />
          <SummaryCard label="Propriedades" value={totalProperties} />
          <SummaryCard label="Tarefas pendentes" value={pendingTasksCount} />
          <SummaryCard
            label="Ocorrências abertas"
            value={openOccurrencesCount}
          />
          <SummaryCard
            label="Animais cadastrados"
            value={reproductionStats.animals}
          />
          <SummaryCard
            label="Animais ativos"
            value={reproductionStats.activeAnimals}
          />
          <SummaryCard label="Fêmeas" value={reproductionStats.females} />
          <SummaryCard label="Machos" value={reproductionStats.males} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-800 sm:text-2xl">
              {editingProducerId ? "Editar produtor" : "Cadastrar produtor"}
            </h2>

            <form onSubmit={handleProducerSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={producerForm.name}
                  onChange={handleProducerChange}
                  placeholder="Ex.: João Ferreira"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={producerForm.email}
                  onChange={handleProducerChange}
                  placeholder="Ex.: joao@email.com"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={producerForm.phone}
                  onChange={handleProducerChange}
                  placeholder="Ex.: (31) 99999-0000"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={savingProducer}
                  className="flex-1 rounded-lg bg-zinc-900 py-3 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-60"
                >
                  {savingProducer
                    ? "Salvando..."
                    : editingProducerId
                    ? "Atualizar produtor"
                    : "Salvar produtor"}
                </button>

                {editingProducerId && (
                  <button
                    type="button"
                    onClick={resetProducerForm}
                    className="rounded-lg border border-zinc-300 px-4 py-3 font-medium text-zinc-700 hover:bg-zinc-100 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <MessageText
              message={producerMessage}
              type={
                producerMessage.toLowerCase().includes("sucesso")
                  ? "success"
                  : producerMessage
                  ? "error"
                  : "default"
              }
            />
          </div>

          <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-800 sm:text-2xl">
              {editingPropertyId
                ? "Editar propriedade"
                : "Cadastrar propriedade"}
            </h2>

            <form onSubmit={handlePropertySubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Nome da propriedade
                </label>
                <input
                  type="text"
                  name="name"
                  value={propertyForm.name}
                  onChange={handlePropertyChange}
                  placeholder="Ex.: Fazenda Boa Esperança"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={propertyForm.city}
                  onChange={handlePropertyChange}
                  placeholder="Ex.: Contagem"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Produtor responsável
                </label>
                <select
                  name="producerId"
                  value={propertyForm.producerId}
                  onChange={handlePropertyChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                  required
                >
                  <option value="">Selecione um produtor</option>
                  {producers.map((producer) => (
                    <option key={producer.id} value={producer.id}>
                      {producer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={savingProperty || producers.length === 0}
                  className="flex-1 rounded-lg bg-zinc-900 py-3 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-60"
                >
                  {savingProperty
                    ? "Salvando..."
                    : editingPropertyId
                    ? "Atualizar propriedade"
                    : "Salvar propriedade"}
                </button>

                {editingPropertyId && (
                  <button
                    type="button"
                    onClick={resetPropertyForm}
                    className="rounded-lg border border-zinc-300 px-4 py-3 font-medium text-zinc-700 hover:bg-zinc-100 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {producers.length === 0 && (
              <MessageText
                message="Cadastre pelo menos um produtor antes de cadastrar uma propriedade."
                type="warning"
              />
            )}

            <MessageText
              message={propertyMessage}
              type={
                propertyMessage.toLowerCase().includes("sucesso")
                  ? "success"
                  : propertyMessage
                  ? "error"
                  : "default"
              }
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-8">
          <h2 className="text-xl font-bold text-zinc-800 sm:text-2xl">
            Cadastrar tarefa sanitária
          </h2>

          <form onSubmit={handleTaskSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Propriedade
              </label>
              <select
                name="propertyId"
                value={taskForm.propertyId}
                onChange={handleTaskChange}
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
                Título da tarefa
              </label>
              <input
                type="text"
                name="title"
                value={taskForm.title}
                onChange={handleTaskChange}
                placeholder="Ex.: Aplicar vacina clostridial"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={taskForm.description}
                onChange={handleTaskChange}
                placeholder="Descreva a orientação sanitária"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 min-h-[110px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Data
              </label>
              <input
                type="date"
                name="date"
                value={taskForm.date}
                onChange={handleTaskChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingTask || properties.length === 0}
              className="w-full rounded-lg bg-zinc-900 py-3 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-60"
            >
              {savingTask ? "Salvando..." : "Salvar tarefa"}
            </button>
          </form>

          {properties.length === 0 && (
            <MessageText
              message="Cadastre pelo menos uma propriedade antes de criar tarefas sanitárias."
              type="warning"
            />
          )}

          <MessageText
            message={taskMessage}
            type={
              taskMessage.toLowerCase().includes("sucesso")
                ? "success"
                : taskMessage
                ? "error"
                : "default"
            }
          />
        </div>

        <ReproductionModule
          properties={properties}
          vetUid={vetUid}
          onStatsChange={setReproductionStats}
        />

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <SectionCard title="Meus produtores" onRefresh={loadProducers}>
            <div className="mb-5 sm:mb-6">
              <input
                type="text"
                value={producerSearch}
                onChange={(e) => setProducerSearch(e.target.value)}
                placeholder="Buscar produtor por nome, e-mail ou telefone"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
              />
            </div>

            {loadingProducers ? (
              <EmptyState text="Carregando produtores..." />
            ) : filteredProducers.length === 0 ? (
              <EmptyState text="Nenhum produtor cadastrado ainda." />
            ) : (
              <div className="space-y-4">
                {filteredProducers.map((producer) => (
                  <div
                    key={producer.id}
                    className="rounded-xl border border-zinc-200 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                      <div>
                        <p className="text-lg font-semibold text-zinc-800">
                          {producer.name}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600">
                          E-mail: {producer.email}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600">
                          Telefone: {producer.phone}
                        </p>
                      </div>

                      <button
                        onClick={() => handleEditProducer(producer)}
                        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition sm:w-auto"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Minhas propriedades" onRefresh={loadProperties}>
            <div className="mb-5 sm:mb-6">
              <input
                type="text"
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                placeholder="Buscar propriedade por nome, cidade ou produtor"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
              />
            </div>

            {loadingProperties ? (
              <EmptyState text="Carregando propriedades..." />
            ) : filteredProperties.length === 0 ? (
              <EmptyState text="Nenhuma propriedade cadastrada ainda." />
            ) : (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="rounded-xl border border-zinc-200 p-4"
                  >
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                      <div>
                        <p className="text-lg font-semibold text-zinc-800">
                          {property.name}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600">
                          Cidade: {property.city}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600">
                          Produtor: {property.producerName || "Não vinculado"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleEditProperty(property)}
                        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition sm:w-auto"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Tarefas sanitárias" onRefresh={loadTasks}>
          <div className="mb-5 grid gap-3 sm:mb-6 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Buscar tarefa"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
            />

            <select
              value={taskPropertyFilter}
              onChange={(e) => setTaskPropertyFilter(e.target.value)}
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
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="concluida">Concluída</option>
            </select>

            <button
              type="button"
              onClick={clearTaskFilters}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100 transition"
            >
              Limpar filtros
            </button>
          </div>

          {loadingTasks ? (
            <EmptyState text="Carregando tarefas..." />
          ) : filteredTasks.length === 0 ? (
            <EmptyState text="Nenhuma tarefa cadastrada ainda." />
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <p className="text-lg font-semibold text-zinc-800">
                    {task.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Propriedade: {task.propertyName}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Produtor: {task.producerName}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Data: {formatDateBR(task.date)}
                  </p>

                  <div className="mt-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTaskStatusBadgeClass(
                        task.status
                      )}`}
                    >
                      {taskStatusLabel(task.status)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-700">
                    {task.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          <MessageText message={taskMessage} />
        </SectionCard>

        <SectionCard title="Ocorrências recebidas" onRefresh={loadOccurrences}>
          <div className="mb-5 grid gap-3 sm:mb-6 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={occurrenceSearch}
              onChange={(e) => setOccurrenceSearch(e.target.value)}
              placeholder="Buscar ocorrência"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
            />

            <select
              value={occurrencePropertyFilter}
              onChange={(e) => setOccurrencePropertyFilter(e.target.value)}
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
              value={occurrenceStatusFilter}
              onChange={(e) => setOccurrenceStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
            >
              <option value="">Todos os status</option>
              <option value="aberta">Aberta</option>
              <option value="em_analise">Em análise</option>
              <option value="resolvida">Resolvida</option>
            </select>

            <button
              type="button"
              onClick={clearOccurrenceFilters}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100 transition"
            >
              Limpar filtros
            </button>
          </div>

          {loadingOccurrences ? (
            <EmptyState text="Carregando ocorrências..." />
          ) : filteredOccurrences.length === 0 ? (
            <EmptyState text="Nenhuma ocorrência recebida ainda." />
          ) : (
            <div className="space-y-4">
              {filteredOccurrences.map((occurrence) => (
                <div
                  key={occurrence.id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                    <div className="w-full flex-1">
                      <p className="text-lg font-semibold text-zinc-800">
                        {occurrence.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Propriedade: {occurrence.propertyName}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Produtor: {occurrence.producerName}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Data: {formatDateBR(occurrence.date)}
                      </p>

                      <div className="mt-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getOccurrenceStatusBadgeClass(
                            occurrence.status
                          )}`}
                        >
                          {occurrenceStatusLabel(occurrence.status)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-zinc-700">
                        {occurrence.description}
                      </p>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                          Resposta / orientação do veterinário
                        </label>

                        <textarea
                          value={occurrenceResponses[occurrence.id] || ""}
                          onChange={(e) =>
                            handleOccurrenceResponseChange(
                              occurrence.id,
                              e.target.value
                            )
                          }
                          placeholder="Ex.: Isolar o animal, aferir temperatura 2x ao dia e iniciar protocolo conforme avaliação clínica."
                          className="w-full min-h-[160px] resize-y rounded-lg border border-zinc-300 px-3 py-3 text-base leading-relaxed outline-none focus:border-zinc-800 sm:min-h-[130px] lg:min-h-[150px]"
                        />

                        <button
                          onClick={() =>
                            handleSaveOccurrenceResponse(occurrence.id)
                          }
                          disabled={savingResponseId === occurrence.id}
                          className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition disabled:opacity-60 sm:w-auto"
                        >
                          {savingResponseId === occurrence.id
                            ? "Salvando resposta..."
                            : "Salvar resposta"}
                        </button>
                      </div>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:w-[180px] lg:flex-col">
                      {occurrenceStatusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleOccurrenceStatusChange(
                              occurrence.id,
                              option.value
                            )
                          }
                          disabled={updatingOccurrenceId === occurrence.id}
                          className={getOccurrenceStatusButtonClass(
                            occurrence.status,
                            option.value
                          )}
                        >
                          {updatingOccurrenceId === occurrence.id
                            ? "Atualizando..."
                            : option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <MessageText message={occurrenceMessage} />
        </SectionCard>

        <button
          onClick={onLogout}
          className="w-full rounded-lg bg-zinc-900 py-3 text-white font-medium hover:bg-zinc-800 transition"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default VetDashboard;