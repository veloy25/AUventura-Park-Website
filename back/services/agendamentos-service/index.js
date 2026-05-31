require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, initializeDatabase } = require("../../shared/database");
const { verifyToken } = require("../../shared/auth");
const messageBus = require("../../shared/messagebus");
const axios = require("axios");
const NOTIFICACOES_SERVICE_URL = process.env.NOTIFICACOES_SERVICE_URL || "http://localhost:3007";

const app = express();
const PORT = process.env.SCHEDULING_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

messageBus.subscribe("user:created", "agendamentos-service", (event) => {
  console.log("[Scheduling Service] User created event received:", event.data);
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticação ausente." });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

// ── GET / — listar agendamentos do usuário ────────────────────────────────────
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
    res.status(500).json({ error: "Não foi possível buscar os agendamentos." });
  }
});

// ── POST / — criar agendamento ────────────────────────────────────────────────
app.post("/", authenticate, async (req, res) => {
  const { nomeCachorro, servico, data, horario, observacoes } = req.body;
  const userId = req.user.id;

  if (!nomeCachorro || !servico || !data || !horario) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
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

    messageBus.publish("agendamento:created", appointment, "agendamentos-service");
    axios.post(`${NOTIFICACOES_SERVICE_URL}/interno/criar`, {
      user_id: userId,
      titulo: "Agendamento confirmado!",
      mensagem: `Seu agendamento de ${servico.trim()} para ${nomeCachorro.trim()} no dia ${data} às ${horario.trim()} foi confirmado.`,
      tipo: "agendamento"
    }).catch(err => console.error("[Agendamentos] Erro ao notificar:", err.message));
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error("POST / error:", error);
    res.status(500).json({ error: "Não foi possível criar o agendamento." });
  }
});

// ── GET /horarios-ocupados — rota pública para o TimePicker ───────────────────
app.get("/horarios-ocupados", async (req, res) => {
  const { data, servico } = req.query;

  if (!data || !servico) {
    return res.status(400).json({ error: "data e servico são obrigatórios." });
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
    res.status(500).json({ error: "Não foi possível buscar os horários ocupados." });
  }
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Scheduling Service] listening on port ${PORT}`);
});