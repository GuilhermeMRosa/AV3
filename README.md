# Aerocode — Sistema de Gestão de Produção de Aeronaves

Projeto acadêmico desenvolvido para a AV3 da disciplina de **Programação Orientada a Objetos** — Fatec SJC, 3° semestre de ADS.


---

## 1. Sobre o Projeto

O **Aerocode** é um sistema web de gestão da produção de aeronaves para uma empresa fictícia cujos clientes são Boeing, Airbus, Embraer, Comac e Bombardier.

O sistema permite gerenciar o ciclo completo de produção de uma aeronave: cadastro da aeronave, controle de peças, execução sequencial de etapas de produção, registro de testes e geração de relatório final de entrega.

### Funcionalidades principais

- Autenticação de usuários com três níveis de permissão: **Administrador**, **Engenheiro** e **Operador**
- CRUD completo de aeronaves, peças, etapas, testes e funcionários
- Controle de sequência obrigatória das etapas de produção
- Associação de funcionários a etapas sem duplicidade
- Progressão unidirecional do status de peças (`EM_PRODUCAO → EM_TRANSPORTE → PRONTA`)
- Validação de testes: o relatório final só pode ser gerado se o último teste de cada tipo estiver aprovado
- Geração de relatório final em banco de dados e exportação em arquivo `.txt`
- Operadores visualizam apenas os projetos a que estão vinculados

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 + Tailwind CSS 4 |
| Backend | Node.js 24 + TypeScript + Express 5 |
| ORM | Prisma 6 |
| Banco de dados | MySQL |
| Autenticação | JWT (jsonwebtoken) |
| Validação | Zod 4 |

---

## 2. Pré-requisitos

Certifique-se de ter instalado na máquina:

| Software | Versão utilizada no projeto |
|---|---|
| [Node.js](https://nodejs.org) | 24.x ou superior |
| npm | 11.x ou superior (instalado junto com o Node.js) |
| [MySQL](https://dev.mysql.com/downloads/) | 8.0 ou superior |

> O MySQL deve estar em execução antes de rodar o projeto. Crie o banco de dados `aerocode` antes de rodar as migrations.

---

## 3. Configuração do Ambiente

Crie um arquivo `.env` dentro da pasta `backend/` com o seguinte conteúdo:

```env
DATABASE_URL="mysql://root:fatec@localhost:3306/aerocode"
JWT_SECRET="aerocode-secret-key-2026"
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão com o MySQL. Substitua `root` e `fatec` pelo usuário e senha do seu MySQL caso sejam diferentes. `aerocode` é o nome do banco que será utilizado. |
| `JWT_SECRET` | Chave secreta usada para assinar e verificar os tokens JWT de autenticação. Em produção, use um valor longo e aleatório. |

---

## 4. Como Executar o Projeto

### 4.1 Clonar o repositório

```bash
git clone https://github.com/GuilhermeMRosa/AV3.git
cd AV3/aerocode
```

### 4.2 Criar o banco de dados

No MySQL Workbench ou em qualquer cliente MySQL, execute:

```sql
CREATE DATABASE aerocode;
```

### 4.3 Instalar dependências

Instale as dependências da raiz (contém o `concurrently`), do backend e do frontend:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 4.4 Configurar o arquivo `.env`

Crie o arquivo `backend/.env` conforme descrito na seção 3.

### 4.5 Rodar as migrations e gerar o client do Prisma

```bash
npm --prefix backend run db:migrate
npm --prefix backend run db:generate
```

### 4.6 Popular o banco com o usuário administrador inicial

```bash
npm --prefix backend run db:seed
```

Isso cria o usuário padrão para o primeiro acesso:

| Campo | Valor |
|---|---|
| Usuário | `admin` |
| Senha | `admin123` |

> **Importante:** altere a senha do administrador padrão imediatamente após o primeiro acesso.

### 4.7 Executar o projeto

```bash
npm run dev
```

Este comando inicia o backend e o frontend simultaneamente usando `concurrently`.

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |

---

## 5. Métricas de Qualidade

### Metodologia de coleta

As métricas foram coletadas utilizando a ferramenta **[autocannon](https://github.com/mcollina/autocannon)** em ambiente local (localhost), com o servidor e o cliente rodando na mesma máquina.

| Métrica | Descrição | Fonte |
|---|---|---|
| **Latência** | Tempo desde o envio da requisição até o recebimento do primeiro byte de resposta | `autocannon` — `latency.mean` |
| **Tempo de Resposta** | Tempo total desde o envio até a resposta completa | `autocannon` — `latency.mean` (HTTP/1.1 sem streaming) |
| **Tempo de Processamento** | Tempo real gasto pelo servidor para processar a requisição, medido por um middleware de timing no backend com `process.hrtime.bigint()`. O valor é exposto via header `X-Processing-Time` e acumulado em `GET /interno/timing` | Middleware Express no backend |

Os testes foram realizados com **1, 5 e 10 usuários simultâneos**, com duração de **10 segundos** por bateria.

Para reproduzir os testes, com o servidor em execução:

```bash
cd backend
node metricas.js
```

---

### Resultados

#### GET /aeronaves

| Usuários | Latência (ms) | Tempo de Resposta (ms) | Tempo de Processamento (ms) |
|---|---|---|---|
| 1 | | | |
| 5 | | | |
| 10 | | | |

#### GET /etapas

| Usuários | Latência (ms) | Tempo de Resposta (ms) | Tempo de Processamento (ms) |
|---|---|---|---|
| 1 | | | |
| 5 | | | |
| 10 | | | |

#### GET /pecas

| Usuários | Latência (ms) | Tempo de Resposta (ms) | Tempo de Processamento (ms) |
|---|---|---|---|
| 1 | | | |
| 5 | | | |
| 10 | | | |

#### POST /auth/login

| Usuários | Latência (ms) | Tempo de Resposta (ms) | Tempo de Processamento (ms) |
|---|---|---|---|
| 1 | | | |
| 5 | | | |
| 10 | | | |

---

## 6. Compatibilidade

O sistema foi desenvolvido e testado para funcionar nos seguintes ambientes:

| Sistema Operacional | Versão mínima |
|---|---|
| Windows | 10 ou superior |
| Ubuntu | 24.04.03 LTS ou superior |
| Derivados do Ubuntu | (ex: Linux Mint, Pop!\_OS, etc.) |

> Em sistemas Linux, certifique-se de que o serviço do MySQL está ativo antes de executar o projeto:
> ```bash
> sudo systemctl start mysql
> ```
