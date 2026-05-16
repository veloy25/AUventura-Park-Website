# AUventura Park

![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen) ![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-8.0.1-cyan) ![MySQL](https://img.shields.io/badge/MySQL-8-blue) ![License](https://img.shields.io/badge/License-ISC-lightgrey)

## 🚀 Visão geral

O **AUventura Park** é uma plataforma digital desenvolvida para modernizar a gestão e a comunicação da creche para cachorros. O projeto conecta tutores, cuidadores e os serviços internos da creche, criando uma experiência mais segura, transparente e colaborativa.

A aplicação oferece:
- mural de comentários e depoimentos;
- registro de agendamentos e serviços;
- autenticação e controle de usuários;
- comunicação direta entre tutor e equipe.

## 📌 Estrutura do projeto

- `back/`: backend em Node.js e Express, com microsserviços e conexão MySQL.
- `front/`: frontend em React + Vite para interface com usuários.
- `back/docker-compose.yml`: definição dos serviços e dependências para ambiente local.

## ✨ Funcionalidades principais

- Painel de depoimentos para tutores deixarem feedback
- Agendamentos e histórico de serviços
- Sistema de autenticação e gerenciamento de usuários
- Arquitetura modular com microsserviços

## 🛠️ Tecnologias utilizadas

- Frontend: React, Vite, Bootstrap
- Backend: Node.js, Express, Axios, JSON Web Tokens, bcryptjs
- Banco de dados: MySQL
- Ferramentas: nodemon, dotenv, ESLint

## ✅ Como executar

### 1. Pré-requisitos

- Node.js instalado
- MySQL configurado
- Git (opcional)

### 2. Executando o backend

```bash
cd back
npm install
npm run start
```

### 3. Executando o frontend

```bash
cd front
npm install
npm run dev
```

### 4. Executando com Docker Compose

Caso queira rodar todos os serviços juntos, utilize o arquivo `back/docker-compose.yml`.

```bash
cd back
docker compose up
```

> O backend utiliza `dotenv` para variáveis de ambiente. Configure seu `.env` com as credenciais do banco e as chaves necessárias antes de iniciar.

## 📁 Estrutura de pastas

```
back/
  ├─ docker-compose.yml
  ├─ index.js
  ├─ package.json
  ├─ schema.sql
  ├─ microsservicos/
  │   ├─ reviews.js
  │   └─ user.js
  └─ services/
      ├─ agendamentos-service/
      ├─ api-gateway/
      ├─ depoimentos-service/
      └─ user-service/
front/
  ├─ package.json
  ├─ vite.config.js
  └─ src/
      ├─ App.jsx
      ├─ main.jsx
      ├─ components/
      └─ pages/
```

## 👥 Equipe

- Fernando Godoi Grinevicius // 22.00832-2
- Gabriel Barrochelo // 22.10193-4
- Igor Gava Rubinato // 22.00094-0
- Jonas Fernando da Silva Eboli Machado // 22.00910-8
- Matheus Antonio da Luz Cardoso // 22.01059-9
- Vinícius Eloy Araujo // 22.01026-2

## 💡 Sugestões de melhoria

- adicionar controles visuais para status de agendamento
- incluir upload de imagens para depoimentos
- implementar notificações em tempo real
- criar testes automatizados para backend e frontend

## 📄 Licença

Este projeto está licenciado sob a licença ISC.
