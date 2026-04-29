import { useEffect, useMemo, useState } from "react";
import ProducerReproductionModule from "../components/ProducerReproductionModule";
import { completeTask, getTasksByProducer } from "../services/task";
import { getProducerByEmail, linkProducerToUser } from "../services/producer";
import { getPropertiesByProducer } from "../services/property";
import {
  createOccurrence,
  getOccurrencesByProducer,
} from "../services/occurrence";
import {
  formatDateBR,
  getOccurrenceStatusBadgeClass,
  getTaskStatusBadgeClass,
  occurrenceStatusLabel,
  taskStatusLabel,
} from "../utils/formatters";

const initialOccurrenceForm = {
  propertyId: "",
  title: "",
  description: "",
  date: "",
};

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-lg font-medium text-zinc-800 break-words">{value}</p>
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

function SectionCard({ title, onRefresh, children }) {
  return (
    <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-8">
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

function ProducerDashboard({ userData, onLogout }) {
  const [producerRecord, setProducerRecord] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [occurrences, setOccurrences] = useState([]);

  const [reproductionStats, setReproductionStats] = useState({
    animals: 0,
    activeAnimals: 0,
    females: 0,
    males: 0,
  });

  const [occurrenceForm, setOccurrenceForm] = useState(initialOccurrenceForm);

  const [loadingProducer, setLoadingProducer] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingOccurrences, setLoadingOccurrences] = useState(true);

  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [savingOccurrence, setSavingOccurrence] = useState(false);

  const [taskMessage, setTaskMessage] = useState("");
  const [occurrenceMessage, setOccurrenceMessage] = useState("");

  const [taskSearch, setTaskSearch] = useState("");
  const [taskPropertyFilter, setTaskPropertyFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");

  const [occurrenceSearch, setOccurrenceSearch] = useState("");
  const [occurrencePropertyFilter, setOccurrencePropertyFilter] = useState("");
  const [occurrenceStatusFilter, setOccurrenceStatusFilter] = useState("");

  const profileId = userData?.id;

  function handleOccurrenceChange(e) {
    const { name, value } = e.target;
    setOccurrenceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetOccurrenceForm() {
    setOccurrenceForm(initialOccurrenceForm);
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

  async function loadProducerAndData() {
    if (!userData?.email || !profileId) return;

    setLoadingProducer(true);
    setLoadingTasks(true);
    setLoadingProperties(true);
    setLoadingOccurrences(true);
    setTaskMessage("");
    setOccurrenceMessage("");

    try {
      const producer = await getProducerByEmail(userData.email);

      if (!producer) {
        setProducerRecord(null);
        setTasks([]);
        setProperties([]);
        setOccurrences([]);
        setTaskMessage(
          "Seu usuário existe, mas ainda não foi vinculado a um produtor cadastrado pelo veterinário."
        );
        return;
      }

      setProducerRecord(producer);

      if (producer.linkedUserUid !== profileId) {
        await linkProducerToUser(producer.id, profileId);
      }

      const [producerTasks, producerProperties, producerOccurrences] =
        await Promise.all([
          getTasksByProducer(producer.id),
          getPropertiesByProducer(producer.id),
          getOccurrencesByProducer(producer.id),
        ]);

      setTasks(producerTasks);
      setProperties(producerProperties);
      setOccurrences(producerOccurrences);
    } catch (error) {
      console.error("Erro ao carregar painel do produtor:", error);
      setTaskMessage(error.message || "Não foi possível carregar as tarefas.");
      setOccurrenceMessage(
        error.message || "Não foi possível carregar as ocorrências."
      );
    } finally {
      setLoadingProducer(false);
      setLoadingTasks(false);
      setLoadingProperties(false);
      setLoadingOccurrences(false);
    }
  }

  useEffect(() => {
    loadProducerAndData();
  }, [profileId, userData?.email]);

  async function handleCompleteTask(taskId) {
    if (!profileId) return;

    setUpdatingTaskId(taskId);
    setTaskMessage("");
    setOccurrenceMessage("");

    try {
      await completeTask(taskId, profileId);
      setTaskMessage("Tarefa marcada como concluída.");
      await loadProducerAndData();
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
      setTaskMessage(error.message || "Não foi possível concluir a tarefa.");
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleOccurrenceSubmit(e) {
    e.preventDefault();

    if (!producerRecord) {
      setOccurrenceMessage("Produtor ainda não vinculado.");
      return;
    }

    setSavingOccurrence(true);
    setOccurrenceMessage("");
    setTaskMessage("");

    try {
      const selectedProperty = properties.find(
        (property) => property.id === occurrenceForm.propertyId
      );

      if (!selectedProperty) {
        setOccurrenceMessage("Selecione uma propriedade válida.");
        return;
      }

      await createOccurrence({
        title: occurrenceForm.title,
        description: occurrenceForm.description,
        date: occurrenceForm.date,
        status: "aberta",
        propertyId: selectedProperty.id,
        producerId: producerRecord.id,
        veterinarioId: selectedProperty.veterinarioId,
        createdByUserUid: profileId,
      });

      resetOccurrenceForm();
      setOccurrenceMessage("Ocorrência registrada com sucesso.");
      await loadProducerAndData();
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error);
      setOccurrenceMessage(
        error.message || "Não foi possível registrar a ocorrência."
      );
    } finally {
      setSavingOccurrence(false);
    }
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
    const order = { aberta: 0, em_analise: 1, resolvida: 2 };

    if (order[a.status] === order[b.status]) {
      return (a.date || "").localeCompare(b.date || "");
    }

    return (order[a.status] ?? 99) - (order[b.status] ?? 99);
  });

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
        ? [task.title, task.description, task.propertyName, task.status]
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

  const pendingTasksCount = tasks.filter(
    (task) => task.status === "pendente"
  ).length;

  const completedTasksCount = tasks.filter(
    (task) => task.status === "concluida"
  ).length;

  const openOccurrencesCount = occurrences.filter(
    (item) => item.status === "aberta"
  ).length;

  const resolvedOccurrencesCount = occurrences.filter(
    (item) => item.status === "resolvida"
  ).length;

  return (
    <div className="min-h-screen bg-zinc-100 px-3 py-4 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
        <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-8">
          <h1 className="text-2xl font-bold text-zinc-800 sm:text-3xl">
            Painel do Produtor
          </h1>

          <p className="mt-3 text-zinc-600">
            Bem-vindo, <span className="font-semibold">{userData.name}</span>.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard label="Tipo de conta" value="Produtor Rural" />
            <InfoCard label="E-mail" value={userData.email} />
          </div>

          <div className="mt-4 rounded-xl border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">Produtor vinculado</p>
            <p className="text-lg font-medium text-zinc-800">
              {loadingProducer
                ? "Carregando..."
                : producerRecord?.name || "Ainda não vinculado"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="Tarefas pendentes" value={pendingTasksCount} />
          <SummaryCard label="Tarefas concluídas" value={completedTasksCount} />
          <SummaryCard label="Ocorrências abertas" value={openOccurrencesCount} />
          <SummaryCard
            label="Ocorrências resolvidas"
            value={resolvedOccurrencesCount}
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

        <SectionCard title="Registrar ocorrência">
          <form onSubmit={handleOccurrenceSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Propriedade
              </label>
              <select
                name="propertyId"
                value={occurrenceForm.propertyId}
                onChange={handleOccurrenceChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 bg-white"
                required
                disabled={!producerRecord}
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
                Título da ocorrência
              </label>
              <input
                type="text"
                name="title"
                value={occurrenceForm.title}
                onChange={handleOccurrenceChange}
                placeholder="Ex.: Bezerra com febre"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                required
                disabled={!producerRecord}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={occurrenceForm.description}
                onChange={handleOccurrenceChange}
                placeholder="Descreva a ocorrência observada no campo"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800 min-h-[110px]"
                required
                disabled={!producerRecord}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Data
              </label>
              <input
                type="date"
                name="date"
                value={occurrenceForm.date}
                onChange={handleOccurrenceChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                required
                disabled={!producerRecord}
              />
            </div>

            <button
              type="submit"
              disabled={
                savingOccurrence || !producerRecord || properties.length === 0
              }
              className="w-full rounded-lg bg-zinc-900 py-3 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-60"
            >
              {savingOccurrence ? "Salvando..." : "Registrar ocorrência"}
            </button>
          </form>

          {producerRecord && properties.length === 0 && (
            <MessageText
              message="Você ainda não possui propriedades vinculadas. Peça ao veterinário para cadastrar uma propriedade no seu nome."
              type="warning"
            />
          )}

          <MessageText
            message={occurrenceMessage}
            type={
              occurrenceMessage.toLowerCase().includes("sucesso")
                ? "success"
                : occurrenceMessage
                ? "error"
                : "default"
            }
          />
        </SectionCard>

        <SectionCard
          title="Minhas tarefas sanitárias"
          onRefresh={loadProducerAndData}
        >
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
            <p className="text-zinc-500">Carregando tarefas...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-zinc-500">Nenhuma tarefa sanitária encontrada.</p>
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

                  {task.status !== "concluida" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={updatingTaskId === task.id}
                      className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition disabled:opacity-60 sm:w-auto"
                    >
                      {updatingTaskId === task.id
                        ? "Concluindo..."
                        : "Marcar como concluída"}
                    </button>
                  )}

                  {task.status === "concluida" && (
                    <p className="mt-4 text-sm font-medium text-green-700">
                      Tarefa concluída
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <MessageText message={taskMessage} />
        </SectionCard>

        <ProducerReproductionModule
          producerId={producerRecord?.id}
          properties={properties}
          onStatsChange={setReproductionStats}
        />

        <SectionCard title="Minhas ocorrências" onRefresh={loadProducerAndData}>
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
            <p className="text-zinc-500">Carregando ocorrências...</p>
          ) : filteredOccurrences.length === 0 ? (
            <p className="text-zinc-500">Nenhuma ocorrência registrada ainda.</p>
          ) : (
            <div className="space-y-4">
              {filteredOccurrences.map((occurrence) => (
                <div
                  key={occurrence.id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <p className="text-lg font-semibold text-zinc-800">
                    {occurrence.title}
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    Propriedade: {occurrence.propertyName}
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

                  {occurrence.vetResponse && (
                    <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-sm font-medium text-zinc-700">
                        Resposta do veterinário
                      </p>
                      <p className="mt-1 text-sm text-zinc-700">
                        {occurrence.vetResponse}
                      </p>
                    </div>
                  )}
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

export default ProducerDashboard;