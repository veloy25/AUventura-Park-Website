# Guia de Arquitetura de Microsserviços

## Visão Geral

O backend está organizado em uma arquitetura de microsserviços com os seguintes componentes:

- **API Gateway** (Porta 3000) — Ponto de entrada principal, roteia as requisições HTTP para os serviços.
- **User Service** — Autenticação e gerenciamento de usuários.
- **Depoimentos Service** — Gerenciamento de depoimentos e comentários.
- **Agendamentos Service** — Gerenciamento de agendamentos e consultas de serviços.
- **Contato Service** — Processamento do formulário de contato.
- **Daycare Service** — Operações relacionadas à creche.
- **Notificações Service** — Processamento de notificações baseado em eventos.
- **Barramento Service** — Barramento de eventos manual para comunicação entre serviços.
- **Módulos Compartilhados** — Utilitários comuns, como conexão com banco de dados e autenticação.

## Estrutura do Projeto

```text
back/
├── MICROSERVICES.md
├── nodemon.json
├── package.json
├── schema.sql
├── services/
│   ├── api-gateway/
│   ├── agendamentos-service/
│   ├── barramento-service/
│   ├── contato-service/
│   ├── daycare-service/
│   ├── depoimentos-service/
│   ├── notificacoes-service/
│   └── user-service/
└── shared/
```

## Executando Localmente

### Pré-requisitos

- Node.js 18+
- MySQL 8+
- npm

### Configuração

1. Instale as dependências do backend:

```bash
cd back
npm install
```

2. Configure o arquivo `.env` com as credenciais do banco de dados, segredo JWT e portas dos serviços.

3. Inicie todos os microsserviços com um único comando:

```bash
npm run dev
```

O projeto utiliza o pacote `concurrently` para iniciar todos os microsserviços em paralelo a partir de um único script, simplificando o ambiente de desenvolvimento local.

### Inicialização manual (alternativa)

Caso necessário, cada serviço pode ser iniciado individualmente em um terminal separado:

```bash
cd back/services/api-gateway && npm run dev
cd back/services/user-service && npm run dev
cd back/services/depoimentos-service && npm run dev
cd back/services/agendamentos-service && npm run dev
cd back/services/contato-service && npm run dev
cd back/services/daycare-service && npm run dev
cd back/services/notificacoes-service && npm run dev
cd back/services/barramento-service && npm run dev
```

## Responsabilidades de Cada Serviço

### API Gateway
Recebe as requisições dos clientes (frontend) e as encaminha para o microsserviço correspondente via HTTP.

### User Service
Gerencia cadastro, login, autenticação com JWT e operações relacionadas ao usuário.

### Depoimentos Service
Armazena e recupera os depoimentos publicados pelos usuários da plataforma.

### Agendamentos Service
Gerencia a criação e consulta de agendamentos de serviços para os pets.

### Contato Service
Recebe e processa as mensagens enviadas pelo formulário de contato do site.

### Daycare Service
Contém as regras de negócio e operações relacionadas à estadia dos pets na creche.

### Notificações Service
Consome eventos do barramento e processa o envio de notificações aos usuários.

### Barramento Service
Recebe eventos via `POST /eventos` e os encaminha para os serviços assinantes por meio de requisições HTTP. O barramento foi implementado manualmente com Express e Axios, sem o uso de brokers externos como RabbitMQ ou Kafka.

## Barramento de Eventos

O barramento de eventos foi implementado de forma manual no `barramento-service`, seguindo a proposta da disciplina.

Tipos de eventos atualmente suportados:

- `user:created` — publicado quando um novo usuário é criado.
- `agendamento:created` — publicado quando um agendamento é realizado.
- `daycare:created` — publicado quando uma entrada na creche é registrada.

Cada evento é recebido pelo barramento e repassado via HTTP para os serviços assinantes cadastrados.

## Endpoints da API

Todos os acessos do frontend são feitos pelo API Gateway. Exemplos de rotas disponíveis:

### Usuários
- `POST /api/signup` — Cadastro de novo usuário
- `POST /api/login` — Login e geração de token JWT
- `GET /api/me` — Retorna o perfil do usuário autenticado

### Depoimentos
- `GET /api/depoimentos` — Lista todos os depoimentos
- `POST /api/depoimentos` — Cria um novo depoimento
- `GET /api/depoimentos/:id` — Retorna um depoimento específico

### Agendamentos
- `GET /api/agendamentos` — Lista os agendamentos do usuário autenticado
- `POST /api/agendamentos` — Cria um novo agendamento

Rotas adicionais podem existir para contato, daycare, pets e notificações, conforme implementado em cada serviço.

## Variáveis de Ambiente

As variáveis de ambiente devem ser configuradas em um arquivo `.env` na raiz do `back/`. Principais variáveis:

- `PORT` / `*_SERVICE_PORT` — Portas de cada serviço
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — Conexão com MySQL
- `JWT_SECRET` — Chave secreta para geração de tokens
- `JWT_EXPIRATION` — Tempo de expiração do token
- `*_SERVICE_URL` — URLs dos serviços usadas pelo API Gateway
- `BARRAMENTO_PORT` — Porta do barramento de eventos

## Boas Práticas de Desenvolvimento

- Utilize `npm run dev` para desenvolvimento, pois os serviços reiniciam automaticamente via nodemon.
- Mantenha cada serviço responsável por um único domínio do sistema.
- Todo acesso externo deve passar pelo API Gateway.
- Utilize o barramento de eventos para comunicação assíncrona entre serviços.