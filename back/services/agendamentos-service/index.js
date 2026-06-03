require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { pool, initializeDatabase } = require("../../shared/database");
const { verifyToken } = require("../../shared/auth");

const app = express();
const PORT = process.env.SCHEDULING_SERVICE_PORT || 3003;
const BARRAMENTO_URL = process.env.BARRAMENTO_URL || "http://localhost:10000";

app.use(cors());
app.use(express.json());

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticacao ausente." });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalido ou expirado." });
  }
};

// Recebe eventos do barramento
app.post("/eventos", (req, res) => {
  const { tipo, dados } = req.body;
  console.log(`[Agendamentos Service] Evento recebido: ${tipo}`, dados);
  // Adicione aqui reacoes a eventos de outros servicos se necessario
  res.status(200).json({ message: "Evento processado." });
});

// GET / - Listar agendamentos do usuario
app.get("/", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, nomeCachorro, servico, `data`, horario, observacoes, criado_em FROM agendamentos WHERE user_id = ? ORDER BY criado_em DESC",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("GET / error:", error);
    res.status(500).json({ error: "Nao foi possivel buscar os agendamentos." });
  }
});

// POST / - Criar agendamento
app.post("/", authenticate, async (req, res) => {
  const { nomeCachorro, servico, data, horario, observacoes } = req.body;
  const userId = req.user.id;

  if (!nomeCachorro || !servico || !data || !horario) {
    return res.status(400).json({ error: "Todos os campos obrigatorios devem ser preenchidos." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO agendamentos (user_id, nomeCachorro, servico, `data`, horario, observacoes) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, nomeCachorro.trim(), servico.trim(), data, horario.trim(), observacoes || ""]
    );

    const appointment = {
      id: result.insertId,
      user_id: userId,
      nomeCachorro: nomeCachorro.trim(),
      servico: servico.trim(),
      data,
      horario: horario.trim(),
      observacoes: observacoes || "",
      criado_em: new Date().toISOString(),
    };

    // Publica evento no barramento
    axios.post(`${BARRAMENTO_URL}/eventos`, {
      tipo: "agendamento:created",
      dados: appointment
    }).catch(err => console.error("[Agendamentos] Erro ao publicar no barramento:", err.message));

    res.status(201).json(appointment);
  } catch (error) {
    console.error("POST / error:", error);
    res.status(500).json({ error: "Nao foi possivel criar o agendamento." });
  }
});

// GET /horarios-ocupados - Rota publica para o TimePicker
app.get("/horarios-ocupados", async (req, res) => {
  const { data, servico } = req.query;

  if (!data || !servico) {
    return res.status(400).json({ error: "data e servico sao obrigatorios." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT horario FROM agendamentos WHERE `data` = ? AND servico = ?",
      [data, servico]
    );
    const ocupados = rows.map((r) => r.horario);
    res.json(ocupados);
  } catch (error) {
    console.error("GET /horarios-ocupados error:", error);
    res.status(500).json({ error: "Nao foi possivel buscar os horarios ocupados." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota nao encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Scheduling Service] listening on port ${PORT}`);
});
