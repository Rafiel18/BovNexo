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
      <p className="break-words text-lg font-medium text-zinc-800">{value}</p>
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

function PriorityCard({ label, value, tone = "neutral" }) {
  const hasItems = value > 0;

  const toneClasses = hasItems
    ? tone === "warning"
      ? "border-amber-300 bg-amber-50"
      : "border-red-300 bg-red-50"
    : "border-zinc-200 bg-white";

  const valueClasses = hasItems
    ? tone === "warning"
      ? "text-amber-700"
      : "text-red-700"
    : "text-zinc-800";

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-sm font-medium text-zinc-600">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${valueClasses}`}>{value}</p>
      {hasItems && (
        <p className="mt-1 text-xs text-zinc-500">Precisa da sua atenção</p>
      )}
    </div>
  );
}

function SectionCard({ title, onRefresh, children }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-8">
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

  const [activeSection, setActiveSection] = useState("visao-geral");

  const navItems = [
    {
      id: "visao-geral",
      label: "Visão Geral",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      id: "tarefas",
      label: "Tarefas",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      badge: pendingTasksCount,
    },
    {
      id: "ocorrencias",
      label: "Ocorrências",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      badge: openOccurrencesCount,
    },
    {
      id: "reproducao",
      label: "Reprodução",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
      badge: reproductionStats.calvingAlerts || 0,
    },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-100">
      {/* Sidebar - visível apenas em desktop (lg+) */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-zinc-200 lg:shadow-sm">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-100">
          <span className="text-lg font-bold text-zinc-900">BovNexo</span>
          <span className="text-xs text-zinc-400 font-medium">Produtor</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-100 space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-zinc-500 truncate">{userData.name}</p>
            <p className="text-xs text-zinc-400 truncate">{userData.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 lg:ml-60 pb-28 lg:pb-0">
        <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-6 sm:py-8 space-y-5 sm:space-y-6">

          {/* SEÇÃO: Visão Geral */}
          {activeSection === "visao-geral" && (
            <>
              <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-8">
                <h1 className="text-2xl font-bold text-zinc-800 sm:text-3xl">Painel do Produtor</h1>
                <p className="mt-3 text-zinc-600">
                  Bem-vindo, <span className="font-semibold">{userData.name}</span>.
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <InfoCard label="Tipo de conta" value="Produtor Rural" />
                  <InfoCard label="E-mail" value={userData.email} />
                </div>
                <div className="mt-4 rounded-xl border border-zinc-200 p-4">
                  <p className="text-sm text-zinc-500">Produtor vinculado</p>
                  <p className="break-words text-lg font-medium text-zinc-800">
                    {loadingProducer ? "Carregando..." : producerRecord?.name || "Ainda não vinculado"}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Precisa de atenção</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setActiveSection("tarefas")} className="text-left">
                    <PriorityCard label="Tarefas pendentes" value={pendingTasksCount} tone="warning" />
                  </button>
                  <button onClick={() => setActiveSection("ocorrencias")} className="text-left">
                    <PriorityCard label="Ocorrências abertas" value={openOccurrencesCount} tone="danger" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Visão geral</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                  <SummaryCard label="Tarefas concluídas" value={completedTasksCount} />
                  <SummaryCard label="Ocorrências resolvidas" value={resolvedOccurrencesCount} />
                  <SummaryCard label="Animais cadastrados" value={reproductionStats.animals} />
                  <SummaryCard label="Animais ativos" value={reproductionStats.activeAnimals} />
                  <SummaryCard label="Fêmeas" value={reproductionStats.females} />
                  <SummaryCard label="Machos" value={reproductionStats.males} />
                </div>
              </div>

              <div className="lg:hidden">
                <button onClick={onLogout} className="w-full rounded-lg border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition">
                  Sair
                </button>
              </div>
            </>
          )}

          {/* SEÇÃO: Tarefas */}
          {activeSection === "tarefas" && (
            <SectionCard title="Minhas tarefas sanitárias" onRefresh={loadProducerAndData}>
              <div className="mb-5 grid gap-3 sm:mb-6 md:grid-cols-2 lg:grid-cols-4">
                <input type="text" value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} placeholder="Buscar tarefa" className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800" />
                <select value={taskPropertyFilter} onChange={(e) => setTaskPropertyFilter(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-800">
                  <option value="">Todas as propriedades</option>
                  {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
                </select>
                <select value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-800">
                  <option value="">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="concluida">Concluída</option>
                </select>
                <button type="button" onClick={clearTaskFilters} className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100">Limpar filtros</button>
              </div>
              {loadingTasks ? <p className="text-zinc-500">Carregando tarefas...</p> : filteredTasks.length === 0 ? <p className="text-zinc-500">Nenhuma tarefa sanitária encontrada.</p> : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-zinc-200 p-4">
                      <p className="break-words text-lg font-semibold text-zinc-800">{task.title}</p>
                      <p className="mt-1 text-sm text-zinc-600">Propriedade: {task.propertyName}</p>
                      <p className="mt-1 text-sm text-zinc-600">Data: {formatDateBR(task.date)}</p>
                      <div className="mt-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTaskStatusBadgeClass(task.status)}`}>{taskStatusLabel(task.status)}</span>
                      </div>
                      <p className="mt-3 break-words text-sm text-zinc-700">{task.description}</p>
                      {task.status !== "concluida" && (
                        <button onClick={() => handleCompleteTask(task.id)} disabled={updatingTaskId === task.id} className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 sm:w-auto">
                          {updatingTaskId === task.id ? "Concluindo..." : "Marcar como concluída"}
                        </button>
                      )}
                      {task.status === "concluida" && <p className="mt-4 text-sm font-medium text-green-700">Tarefa concluída</p>}
                    </div>
                  ))}
                </div>
              )}
              <MessageText message={taskMessage} />
            </SectionCard>
          )}

          {/* SEÇÃO: Ocorrências */}
          {activeSection === "ocorrencias" && (
            <>
              <SectionCard title="Registrar ocorrência">
                <form onSubmit={handleOccurrenceSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Propriedade</label>
                    <select name="propertyId" value={occurrenceForm.propertyId} onChange={handleOccurrenceChange} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-800" required disabled={!producerRecord}>
                      <option value="">Selecione uma propriedade</option>
                      {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Título da ocorrência</label>
                    <input type="text" name="title" value={occurrenceForm.title} onChange={handleOccurrenceChange} placeholder="Ex.: Bezerra com febre" className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800" required disabled={!producerRecord} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Descrição</label>
                    <textarea name="description" value={occurrenceForm.description} onChange={handleOccurrenceChange} placeholder="Descreva a ocorrência observada no campo" className="min-h-[140px] w-full resize-y rounded-lg border border-zinc-300 px-3 py-3 text-base leading-relaxed outline-none focus:border-zinc-800 sm:min-h-[110px] sm:py-2" required disabled={!producerRecord} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Data</label>
                    <input type="date" name="date" value={occurrenceForm.date} onChange={handleOccurrenceChange} className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800" required disabled={!producerRecord} />
                  </div>
                  <button type="submit" disabled={savingOccurrence || !producerRecord || properties.length === 0} className="w-full rounded-lg bg-zinc-900 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60">
                    {savingOccurrence ? "Salvando..." : "Registrar ocorrência"}
                  </button>
                </form>
                {producerRecord && properties.length === 0 && <MessageText message="Você ainda não possui propriedades vinculadas. Peça ao veterinário para cadastrar uma propriedade no seu nome." type="warning" />}
                <MessageText message={occurrenceMessage} type={occurrenceMessage.toLowerCase().includes("sucesso") ? "success" : occurrenceMessage ? "error" : "default"} />
              </SectionCard>

              <SectionCard title="Minhas ocorrências" onRefresh={loadProducerAndData}>
                <div className="mb-5 grid gap-3 sm:mb-6 md:grid-cols-2 lg:grid-cols-4">
                  <input type="text" value={occurrenceSearch} onChange={(e) => setOccurrenceSearch(e.target.value)} placeholder="Buscar ocorrência" className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800" />
                  <select value={occurrencePropertyFilter} onChange={(e) => setOccurrencePropertyFilter(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-800">
                    <option value="">Todas as propriedades</option>
                    {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
                  </select>
                  <select value={occurrenceStatusFilter} onChange={(e) => setOccurrenceStatusFilter(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-800">
                    <option value="">Todos os status</option>
                    <option value="aberta">Aberta</option>
                    <option value="em_analise">Em análise</option>
                    <option value="resolvida">Resolvida</option>
                  </select>
                  <button type="button" onClick={clearOccurrenceFilters} className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100">Limpar filtros</button>
                </div>
                {loadingOccurrences ? <p className="text-zinc-500">Carregando ocorrências...</p> : filteredOccurrences.length === 0 ? <p className="text-zinc-500">Nenhuma ocorrência registrada ainda.</p> : (
                  <div className="space-y-4">
                    {filteredOccurrences.map((occurrence) => (
                      <div key={occurrence.id} className="rounded-xl border border-zinc-200 p-4">
                        <p className="break-words text-lg font-semibold text-zinc-800">{occurrence.title}</p>
                        <p className="mt-1 text-sm text-zinc-600">Propriedade: {occurrence.propertyName}</p>
                        <p className="mt-1 text-sm text-zinc-600">Data: {formatDateBR(occurrence.date)}</p>
                        <div className="mt-3">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getOccurrenceStatusBadgeClass(occurrence.status)}`}>{occurrenceStatusLabel(occurrence.status)}</span>
                        </div>
                        <p className="mt-3 break-words text-sm text-zinc-700">{occurrence.description}</p>
                        {occurrence.vetResponse && (
                          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                            <p className="text-sm font-medium text-zinc-700">Resposta do veterinário</p>
                            <p className="mt-1 break-words text-sm leading-relaxed text-zinc-700">{occurrence.vetResponse}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <MessageText message={occurrenceMessage} />
              </SectionCard>
            </>
          )}

          {/* SEÇÃO: Reprodução */}
          {activeSection === "reproducao" && (
            <ProducerReproductionModule
              producerId={producerRecord?.id}
              properties={properties}
              onStatsChange={setReproductionStats}
            />
          )}

        </div>
      </main>

      {/* Bottom Nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-zinc-200 z-50 safe-area-bottom">
        <div className="flex items-stretch">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition ${
                  isActive ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                {item.badge > 0 && (
                  <span className="absolute top-1.5 right-[calc(50%-14px)] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
                <span className={isActive ? "text-zinc-900" : "text-zinc-400"}>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-zinc-900" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default ProducerDashboard;
