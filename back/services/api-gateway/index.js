require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

const USER_SERVICE_URL        = process.env.USER_SERVICE_URL        || "http://localhost:3001";
const DEPOIMENTOS_SERVICE_URL = process.env.DEPOIMENTOS_SERVICE_URL || "http://localhost:3002";
const SCHEDULING_SERVICE_URL  = process.env.SCHEDULING_SERVICE_URL  || "http://localhost:3003";
const PETS_SERVICE_URL        = process.env.PETS_SERVICE_URL        || "http://localhost:3004";
const CONTACT_SERVICE_URL     = process.env.CONTACT_SERVICE_URL     || "http://localhost:3006";

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "API Gateway is running" });
});

// ── User Service ──────────────────────────────────────────────────────────────
app.post("/api/signup", async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/signup`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "User service error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "User service error" });
  }
});

app.get("/api/me", async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/me`, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "User service error" });
  }
});

// ── Depoimentos Service ───────────────────────────────────────────────────────
app.get("/api/depoimentos", async (req, res) => {
  try {
    const response = await axios.get(`${DEPOIMENTOS_SERVICE_URL}/`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Depoimentos service error" });
  }
});

app.post("/api/depoimentos", async (req, res) => {
  try {
    const response = await axios.post(`${DEPOIMENTOS_SERVICE_URL}/`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Depoimentos service error" });
  }
});

app.get("/api/depoimentos/:id", async (req, res) => {
  try {
    const response = await axios.get(`${DEPOIMENTOS_SERVICE_URL}/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Depoimentos service error" });
  }
});

// ── Agendamentos Service ──────────────────────────────────────────────────────
app.get("/api/agendamentos", async (req, res) => {
  try {
    const response = await axios.get(`${SCHEDULING_SERVICE_URL}/`, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Scheduling service error" });
  }
});

app.post("/api/agendamentos", async (req, res) => {
  try {
    const response = await axios.post(`${SCHEDULING_SERVICE_URL}/`, req.body, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Scheduling service error" });
  }
});

// Rota pública — horários ocupados (sem token)
app.get("/api/agendamentos/horarios-ocupados", async (req, res) => {
  try {
    const { data, servico } = req.query;
    const response = await axios.get(`${SCHEDULING_SERVICE_URL}/horarios-ocupados`, {
      params: { data, servico },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Scheduling service error" });
  }
});

// ── Pets Service ──────────────────────────────────────────────────────────────
app.get("/api/pets", async (req, res) => {
  try {
    const response = await axios.get(`${PETS_SERVICE_URL}/`, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Pets service error" });
  }
});

app.post("/api/pets", async (req, res) => {
  try {
    const response = await axios.post(`${PETS_SERVICE_URL}/`, req.body, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Pets service error" });
  }
});

app.delete("/api/pets/:id", async (req, res) => {
  try {
    const response = await axios.delete(`${PETS_SERVICE_URL}/${req.params.id}`, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Pets service error" });
  }
});

// ── Daycare Service ───────────────────────────────────────────────────────────
const DAYCARE_SERVICE_URL = process.env.DAYCARE_SERVICE_URL || "http://localhost:3005";

app.get("/api/daycare/verificar-day-teste/:petId", async (req, res) => {
  try {
    const response = await axios.get(
      `${DAYCARE_SERVICE_URL}/verificar-day-teste/${req.params.petId}`,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Daycare service error" });
  }
});

app.get("/api/daycare/vagas", async (req, res) => {
  try {
    const response = await axios.get(`${DAYCARE_SERVICE_URL}/vagas`, {
      params: req.query,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Daycare service error" });
  }
});

app.post("/api/daycare/agendar", async (req, res) => {
  try {
    const response = await axios.post(`${DAYCARE_SERVICE_URL}/agendar`, req.body, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Daycare service error" });
  }
});

// ── Contato Service ───────────────────────────────────────────────────────────
app.post("/api/contatos", async (req, res) => {
  try {
    const response = await axios.post(`${CONTACT_SERVICE_URL}/`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: "Contato service error" }
    );
  }
});

app.get("/api/contatos", async (req, res) => {
  try {
    const response = await axios.get(`${CONTACT_SERVICE_URL}/`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: "Contato service error" }
    );
  }
});

const NOTIFICACOES_SERVICE_URL = process.env.NOTIFICACOES_SERVICE_URL || "http://localhost:3007";

app.get("/api/notificacoes", async (req, res) => {
  try {
    const response = await axios.get(`${NOTIFICACOES_SERVICE_URL}/`, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Notificações service error" });
  }
});

app.get("/api/notificacoes/nao-lidas", async (req, res) => {
  try {
    const response = await axios.get(`${NOTIFICACOES_SERVICE_URL}/nao-lidas`, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Notificações service error" });
  }
});

app.patch("/api/notificacoes/:id/lida", async (req, res) => {
  try {
    const response = await axios.patch(`${NOTIFICACOES_SERVICE_URL}/${req.params.id}/lida`, {}, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Notificações service error" });
  }
});

app.delete("/api/notificacoes/:id", async (req, res) => {
  try {
    const response = await axios.delete(`${NOTIFICACOES_SERVICE_URL}/${req.params.id}`, { headers: req.headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Notificações service error" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[API Gateway] listening on port ${PORT}`);
  console.log(`  User Service:        ${USER_SERVICE_URL}`);
  console.log(`  Depoimentos Service: ${DEPOIMENTOS_SERVICE_URL}`);
  console.log(`  Scheduling Service:  ${SCHEDULING_SERVICE_URL}`);
  console.log(`  Pets Service:        ${PETS_SERVICE_URL}`);
  console.log(`  Daycare Service:     ${DAYCARE_SERVICE_URL}`);
  console.log(`  Contato Service:     ${CONTACT_SERVICE_URL}`);
});

module.exports = app;