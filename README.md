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
