require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, initializeDatabase } = require("../../shared/database");
const { verifyToken } = require("../../shared/auth");
const messageBus = require("../../shared/messagebus");

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
    return res.status(401).json({ error: "Token de autenticaçao ausente." });
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalido ou expirado." });
  }
};

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

    res.status(201).json(appointment);
  } catch (error) {
    console.error("POST / error:", error);
    res.status(500).json({ error: "Não foi possível criar o agendamento." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Scheduling Service] listening on port ${PORT}`);
});
