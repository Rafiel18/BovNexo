````md
# BovNexo

**BovNexo** é uma aplicação web para gestão sanitária, operacional e reprodutiva de propriedades rurais, conectando veterinários e produtores em um fluxo simples, prático e orientado à tomada de decisão.

O projeto nasceu como um MVP voltado para a rotina de campo, com foco em grandes animais, especialmente bovinos.

## Demo

Acesse a versão online:

https://bovnexo.vercel.app/

> A versão atual é uma demo/MVP em desenvolvimento. Use apenas dados fictícios para testes.

---

## Objetivo do projeto

O BovNexo foi criado para facilitar a comunicação entre veterinários e produtores rurais, centralizando informações importantes da propriedade, como:

- produtores vinculados ao veterinário;
- propriedades rurais;
- tarefas sanitárias;
- ocorrências de campo;
- respostas e orientações veterinárias;
- cadastro de animais;
- histórico reprodutivo.

A proposta é ser uma ferramenta simples, direta e útil no dia a dia do campo, evitando planilhas soltas, mensagens perdidas e falta de histórico.

---

## Funcionalidades atuais

### Autenticação

- Cadastro de usuários
- Login
- Separação de perfis:
  - Veterinário
  - Produtor rural

### Painel do veterinário

- Cadastro e edição de produtores
- Cadastro e edição de propriedades
- Criação de tarefas sanitárias
- Visualização de tarefas cadastradas
- Visualização de ocorrências enviadas pelo produtor
- Resposta às ocorrências
- Alteração de status das ocorrências:
  - Aberta
  - Em análise
  - Resolvida
- Cadastro de animais
- Registro de eventos reprodutivos
- Resumo geral com indicadores do painel

### Painel do produtor

- Visualização do vínculo com o produtor cadastrado
- Visualização das propriedades vinculadas
- Visualização de tarefas sanitárias
- Marcação de tarefas como concluídas
- Registro de ocorrências
- Visualização da resposta do veterinário
- Visualização de animais cadastrados
- Visualização do histórico reprodutivo
- Resumo com indicadores de tarefas, ocorrências e rebanho

---

## Módulo de reprodução

O módulo de reprodução permite ao veterinário registrar informações importantes sobre os animais da propriedade.

### Cadastro de animais

Campos disponíveis:

- Identificação
- Nome ou apelido
- Raça
- Sexo
- Categoria
- Status
- Data de nascimento
- Propriedade vinculada

### Eventos reprodutivos

Eventos disponíveis:

- Cio
- Cobertura
- Inseminação
- Diagnóstico de gestação
- Parto
- Aborto
- Observação

O produtor consegue visualizar os animais e o histórico reprodutivo vinculados à sua propriedade.

---

## Tecnologias utilizadas

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS

### Backend e banco de dados

- Supabase
- Supabase Auth
- PostgreSQL
- Row Level Security, RLS

### Deploy

- Vercel

### Versionamento

- Git
- GitHub

---

## Estrutura principal do projeto

```txt
src/
  components/
    ProducerReproductionModule.jsx
    ReproductionModule.jsx

  lib/
    supabaseClient.js

  pages/
    AuthPage.jsx
    ProducerDashboard.jsx
    VetDashboard.jsx

  services/
    animal.js
    occurrence.js
    producer.js
    profile.js
    property.js
    reproduction.js
    supabaseAuth.js
    task.js

  utils/
    formatters.js
````

---

## Variáveis de ambiente

O projeto usa variáveis de ambiente para conectar ao Supabase.

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publishable_do_supabase
```

Existe um arquivo `.env.example` no repositório como modelo.

> Nunca envie o arquivo `.env` real para o GitHub.

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/Rafiel18/BovNexo.git
```

### 2. Acesse a pasta

```bash
cd BovNexo
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure o `.env`

Crie o arquivo `.env` com as variáveis do Supabase.

### 5. Rode o projeto

```bash
npm run dev
```

O projeto será aberto em:

```txt
http://localhost:5173
```

---

## Segurança

O BovNexo utiliza Row Level Security no Supabase para separar os dados entre usuários.

As tabelas principais possuem RLS ativado:

* profiles
* producers
* properties
* tasks
* occurrences
* animals
* reproduction_records

A aplicação foi testada para impedir que:

* um veterinário visualize dados de outro veterinário;
* um produtor visualize dados de outro produtor;
* usuários não autenticados acessem os painéis internos.

A chave usada no frontend é a publishable key do Supabase. Chaves sensíveis como `service_role`, senha do banco e connection string não devem ser usadas no frontend.

---

## Status do projeto

O BovNexo está em fase de MVP funcional.

### Já implementado

* Autenticação com Supabase
* Perfis separados de veterinário e produtor
* Vínculo entre produtor cadastrado e usuário produtor
* Gestão de produtores
* Gestão de propriedades
* Tarefas sanitárias
* Ocorrências com resposta veterinária
* Módulo de reprodução
* Deploy online na Vercel

### Próximos passos

* Melhorar responsividade mobile
* Criar landing page antes do login
* Melhorar experiência visual dos dashboards
* Adicionar busca e filtros mais avançados
* Criar dados fictícios para demonstração
* Adicionar edição de animais
* Adicionar edição de registros reprodutivos
* Criar alertas de previsão de parto
* Criar calendário sanitário e reprodutivo
* Avaliar modo offline para uso em campo

---

## Visão futura

A visão do BovNexo é se tornar uma plataforma simples e robusta para apoiar veterinários, produtores e consultores na gestão de propriedades rurais.

O foco é unir:

* manejo sanitário;
* rotina operacional;
* reprodução;
* acompanhamento veterinário;
* histórico de campo;
* tomada de decisão prática.

A proposta é construir uma ferramenta de linguagem simples, rápida de usar e adequada à realidade do campo.

---

## Autor

Projeto desenvolvido por Rafael Rodrigues.

MVP construído com apoio de ferramentas de inteligência artificial, GitHub, Supabase e Vercel.
