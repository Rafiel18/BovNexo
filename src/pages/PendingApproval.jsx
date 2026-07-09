function PendingApproval({ userData, onLogout }) {
  const isRejected = userData.approvalStatus === "rejected";

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <span className="text-2xl">{isRejected ? "🚫" : "⏳"}</span>
        </div>

        <h1 className="text-xl font-bold text-zinc-800">
          {isRejected ? "Cadastro não aprovado" : "Aguardando validação"}
        </h1>

        <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
          {isRejected
            ? "Seu cadastro como veterinário não foi validado. Se você acredita que isso é um engano, entre em contato com o suporte."
            : "Seu CRMV está sendo conferido pela nossa equipe. Assim que a validação for concluída, você terá acesso completo ao painel do veterinário."}
        </p>

        <div className="mt-5 rounded-xl border border-zinc-200 p-4 text-left">
          <p className="text-xs text-zinc-500">Nome</p>
          <p className="text-sm font-medium text-zinc-800">{userData.name}</p>
          <p className="mt-2 text-xs text-zinc-500">CRMV</p>
          <p className="text-sm font-medium text-zinc-800">{userData.crmv || "Não informado"}</p>
        </div>

        <button
          onClick={onLogout}
          className="mt-6 w-full rounded-lg border border-zinc-300 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default PendingApproval;
