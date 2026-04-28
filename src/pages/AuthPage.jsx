import { useState } from "react";
import { signInUser, signUpUser } from "../services/supabaseAuth";

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("veterinario");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    crmv: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      password: "",
      crmv: "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        await signUpUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          crmv: role === "veterinario" ? form.crmv : "",
        });

        setMessage(
          role === "veterinario"
            ? "Cadastro realizado. Seu perfil de veterinário está aguardando validação manual do CRMV."
            : "Cadastro realizado com sucesso."
        );

        resetForm();
      } else {
        await signInUser({
          email: form.email,
          password: form.password,
        });

        setMessage("Login realizado com sucesso.");
      }
    } catch (error) {
      console.error("Erro Supabase:", error);
      setMessage(error.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-6">
        <h1 className="text-3xl font-bold text-zinc-800 text-center">
          BovNexo
        </h1>

        <p className="text-sm text-zinc-500 text-center mt-2">
          Plataforma para veterinários e produtores rurais
        </p>

        <div className="mt-6 flex rounded-xl bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-500"
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              mode === "register"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-500"
            }`}
          >
            Cadastrar
          </button>
        </div>

        {mode === "register" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Tipo de conta
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("veterinario")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  role === "veterinario"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700"
                }`}
              >
                Veterinário
              </button>

              <button
                type="button"
                onClick={() => setRole("produtor")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  role === "produtor"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700"
                }`}
              >
                Produtor
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                placeholder="Seu nome"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
              placeholder="seuemail@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
              placeholder="********"
              required
            />
          </div>

          {mode === "register" && role === "veterinario" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                CRMV
              </label>
              <input
                type="text"
                name="crmv"
                value={form.crmv}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-800"
                placeholder="Ex.: CRMV-MG 12345"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 py-3 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-60"
          >
            {loading
              ? "Carregando..."
              : mode === "login"
              ? "Entrar"
              : "Criar conta"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-zinc-600">{message}</p>
        )}
      </div>
    </div>
  );
}

export default AuthPage;