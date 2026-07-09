import { useEffect, useState } from "react";
import { approveVet, getAllVets, rejectVet } from "../services/admin";
import { formatDateBR } from "../utils/formatters";

function AdminDashboard({ userData, onLogout, onSwitchView }) {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    loadVets();
  }, []);

  async function loadVets() {
    setLoading(true);
    try {
      const data = await getAllVets();
      setVets(data);
    } catch (error) {
      console.error("Erro ao carregar veterinários:", error);
      setMessage("Não foi possível carregar a lista de veterinários.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(vetId) {
    setUpdatingId(vetId);
    setMessage("");
    try {
      await approveVet(vetId);
      await loadVets();
      setMessage("Veterinário aprovado com sucesso.");
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      setMessage("Não foi possível aprovar o veterinário.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReject(vetId) {
    setUpdatingId(vetId);
    setMessage("");
    try {
      await rejectVet(vetId);
      await loadVets();
      setMessage("Cadastro rejeitado.");
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      setMessage("Não foi possível rejeitar o veterinário.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredVets = vets.filter((vet) => {
    if (filter === "all") return true;
    return vet.approvalStatus === filter;
  });

  const pendingCount = vets.filter((v) => v.approvalStatus === "pending").length;

  function statusBadge(status) {
    if (status === "approved")
      return <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Aprovado</span>;
    if (status === "rejected")
      return <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Rejeitado</span>;
    return <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Pendente</span>;
  }

  return (
    <div className="min-h-screen bg-zinc-100 px-3 py-4 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
        <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800 sm:text-3xl">Administração</h1>
              <p className="mt-2 text-zinc-600">
                Bem-vindo, <span className="font-semibold">{userData.name}</span>.
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="flex-shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700">
                {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {onSwitchView && (
            <button
              onClick={onSwitchView}
              className="mt-4 w-full rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:w-auto sm:px-4"
            >
              Ver meu painel normal
            </button>
          )}
        </div>

        <div className="rounded-2xl bg-white shadow-lg p-5 sm:p-8">
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("pending")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === "pending" ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"}`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === "approved" ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"}`}
            >
              Aprovados
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === "rejected" ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"}`}
            >
              Rejeitados
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === "all" ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"}`}
            >
              Todos
            </button>
          </div>

          {loading ? (
            <p className="text-zinc-500">Carregando veterinários...</p>
          ) : filteredVets.length === 0 ? (
            <p className="text-zinc-500">Nenhum veterinário encontrado nesse filtro.</p>
          ) : (
            <div className="space-y-4">
              {filteredVets.map((vet) => (
                <div key={vet.id} className="rounded-xl border border-zinc-200 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold text-zinc-800">{vet.name}</p>
                      <p className="mt-1 text-sm text-zinc-600">E-mail: {vet.email}</p>
                      <p className="mt-1 text-sm text-zinc-600">CRMV: {vet.crmv || "Não informado"}</p>
                      <p className="mt-1 text-sm text-zinc-600">Cadastrado em: {formatDateBR(vet.createdAt?.slice(0, 10))}</p>
                      <div className="mt-3">{statusBadge(vet.approvalStatus)}</div>
                    </div>

                    {vet.approvalStatus === "pending" && (
                      <div className="flex gap-2 lg:flex-col lg:w-[160px]">
                        <button
                          onClick={() => handleApprove(vet.id)}
                          disabled={updatingId === vet.id}
                          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
                        >
                          {updatingId === vet.id ? "..." : "Aprovar"}
                        </button>
                        <button
                          onClick={() => handleReject(vet.id)}
                          disabled={updatingId === vet.id}
                          className="flex-1 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          {updatingId === vet.id ? "..." : "Rejeitar"}
                        </button>
                      </div>
                    )}

                    {vet.approvalStatus === "rejected" && (
                      <button
                        onClick={() => handleApprove(vet.id)}
                        disabled={updatingId === vet.id}
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 lg:w-[160px]"
                      >
                        {updatingId === vet.id ? "..." : "Reconsiderar"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {message && <p className="mt-4 text-sm text-zinc-600">{message}</p>}
        </div>

        <button
          onClick={onLogout}
          className="w-full rounded-lg border border-zinc-300 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
