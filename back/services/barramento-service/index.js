require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.BARRAMENTO_PORT || 10000;
const NOTIFICACOES_SERVICE_URL = process.env.NOTIFICACOES_SERVICE_URL || "http://localhost:3007";

const ASSINANTES = {
  "user:created":        [NOTIFICACOES_SERVICE_URL],
  "agendamento:created": [NOTIFICACOES_SERVICE_URL],
  "daycare:created":     [NOTIFICACOES_SERVICE_URL],
};

app.get("/health", (req, res) => {
  res.json({ status: "Barramento is running" });
});

app.post("/eventos", async (req, res) => {
  const evento = req.body;
  console.log(`[Barramento] Evento recebido: ${evento.tipo}`, evento.dados);

  const destinos = ASSINANTES[evento.tipo] || [];

  for (const url of destinos) {
    try {
      await axios.post(`${url}/eventos`, evento);
    } catch (err) {
      console.error(`[Barramento] Erro ao repassar para ${url}:`, err.message);
    }
  }

  res.status(201).json({ message: "Evento publicado." });
});

app.listen(PORT, () => {
  console.log(`[Barramento] Porta ${PORT}`);
});