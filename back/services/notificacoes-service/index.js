require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, initializeDatabase } = require("../../shared/database");
const { verifyToken } = require("../../shared/auth");
const messageBus = require("../../shared/messagebus");

const app = express();
const PORT = process.env.NOTIFICACOES_SERVICE_PORT || 3007;

app.use(cors());
app.use(express.json());

initializeDatabase().catch((err) => {
  console.error("Falha ao inicializar banco:", err);
  process.exit(1);
});

// Escuta eventos do MessageBus e cria notificações automaticamente
messageBus.subscribe("agendamento:created", "notificacoes-service", async (event) => {
  const { user_id, nomeCachorro, servico, data, horario } = event.data;
  try {
    await pool.query(
      `INSERT INTO notificacoes (user_id, titulo, mensagem, tipo)
       VALUES (?, ?, ?, ?)`,
      [
        user_id,
        "Agendamento confirmado!",
        `Seu agendamento de ${servico} para ${nomeCachorro} no dia ${data} às ${horario} foi confirmado.`,
        "agendamento",
      ]
    );
    console.log("[Notificações] Notificação de agendamento criada para user_id:", user_id);
  } catch (err) {
    console.error("[Notificações] Erro ao criar notificação:", err);
  }
});

messageBus.subscribe("user:created", "notificacoes-service", async (event) => {
  const { id, nome } = event.data;
  try {
    await pool.query(
      `INSERT INTO notificacoes (user_id, titulo, mensagem, tipo)
       VALUES (?, ?, ?, ?)`,
      [
        id,
        "Bem-vindo à AUventura Park! 🐾",
        `Olá, ${nome}! Sua conta foi criada com sucesso. Agende seu primeiro serviço!`,
        "geral",
      ]
    );
  } catch (err) {
    console.error("[Notificações] Erro ao criar notificação de boas-vindas:", err);
  }
});

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token ausente." });
  try {
    req.user = verifyToken(authHeader.split(" ")[1]);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

// GET / — todas as notificações do usuário
app.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notificacoes WHERE user_id = ? ORDER BY criado_em DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Não foi possível buscar as notificações." });
  }
});

// GET /nao-lidas — contagem/lista das não lidas
app.get("/nao-lidas", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notificacoes WHERE user_id = ? AND lida = 0 ORDER BY criado_em DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Não foi possível buscar notificações não lidas." });
  }
});

// PATCH /:id/lida — marca como lida
app.patch("/:id/lida", authenticate, async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE notificacoes SET lida = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Notificação não encontrada." });
    res.json({ message: "Marcada como lida." });
  } catch (err) {
    res.status(500).json({ error: "Não foi possível atualizar a notificação." });
  }
});

// DELETE /:id — exclui notificação
app.delete("/:id", authenticate, async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM notificacoes WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Notificação não encontrada." });
    res.json({ message: "Notificação excluída." });
  } catch (err) {
    res.status(500).json({ error: "Não foi possível excluir a notificação." });
  }
});

app.post("/interno/criar", async (req, res) => {
  const { user_id, titulo, mensagem, tipo } = req.body;
  if (!user_id || !titulo || !mensagem)
    return res.status(400).json({ error: "Dados incompletos." });
  try {
    await pool.query(
      "INSERT INTO notificacoes (user_id, titulo, mensagem, tipo) VALUES (?, ?, ?, ?)",
      [user_id, titulo, mensagem, tipo || "geral"]
    );
    res.status(201).json({ message: "Notificação criada." });
  } catch (err) {
    console.error("[Notificações] Erro ao criar:", err);
    res.status(500).json({ error: "Erro ao criar notificação." });
  }
});

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));

app.listen(PORT, () => {
  console.log(`[Notificações Service] listening on port ${PORT}`);
});

