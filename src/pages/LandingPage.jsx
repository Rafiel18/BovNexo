export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800">
      {/* HERO */}
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
            BovNexo
          </p>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
            Gestão pecuária com inteligência sanitária e reprodutiva.
          </h1>

          <p className="mt-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
            Conecte veterinários e produtores rurais em uma plataforma simples,
            rápida e feita para a rotina do campo.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={onStart}
              className="rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-800"
            >
              Entrar no sistema
            </button>

            <a
              href="https://github.com/Rafiel18/BovNexo"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-zinc-300 bg-white px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Ver projeto no GitHub
            </a>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Tudo centralizado em um só lugar
          </h2>

          <p className="mt-4 text-zinc-600">
            O BovNexo organiza a rotina sanitária, operacional e reprodutiva da
            propriedade.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Reprodução"
            description="Cadastro de animais, eventos reprodutivos e histórico do rebanho."
          />

          <FeatureCard
            title="Tarefas sanitárias"
            description="Controle de manejos, vacinações e atividades de campo."
          />

          <FeatureCard
            title="Ocorrências clínicas"
            description="Registro de problemas observados e respostas veterinárias."
          />

          <FeatureCard
            title="Produtores e propriedades"
            description="Gestão organizada de propriedades e vínculos."
          />

          <FeatureCard
            title="Indicadores"
            description="Resumo rápido do rebanho, tarefas e ocorrências."
          />

          <FeatureCard
            title="Online e responsivo"
            description="Funciona no computador e no celular para rotina de campo."
          />
        </div>
      </section>

      {/* PARA QUEM */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-bold">Para quem é o BovNexo?</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <AudienceCard
              title="Veterinários"
              description="Controle sanitário e acompanhamento técnico das propriedades."
            />

            <AudienceCard
              title="Produtores"
              description="Organização da rotina e comunicação com o veterinário."
            />

            <AudienceCard
              title="Consultores"
              description="Acompanhamento operacional e visão geral das fazendas."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 sm:flex-row">
          <p>© 2026 BovNexo • MVP em desenvolvimento</p>

          <a
            href="https://github.com/Rafiel18/BovNexo"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-zinc-700"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h3 className="text-xl font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function AudienceCard({ title, description }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-6">
      <h3 className="text-xl font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        {description}
      </p>
    </div>
  );
}