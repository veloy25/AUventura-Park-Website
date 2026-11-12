require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, initializeDatabase } = require("../../shared/database");
const { authenticate, verifyToken } = require("../../shared/auth");

const app = express();
const PORT = process.env.NOTIFICACOES_SERVICE_PORT || 3007;

// Os eventos trazem os ids; a mensagem ao tutor usa os nomes legíveis.
const NOMES_SERVICO = {
  banho: "Banho",
  tosa: "Tosa",
  banho_tosa: "Banho e Tosa",
  adestramento: "Adestramento",
  daycare: "Daycare",
};
const NOMES_PLANO = {
  dayuse: "Dia Teste / Avulso",
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};
// "2026-11-18" (ou "2026-11-18T00:00:00.000Z") vira "18/11/2026".
const dataBr = (data) => String(data).slice(0, 10).split("-").reverse().join("/");

app.use(cors());
app.use(express.json());

initializeDatabase().catch((err) => {
  console.error("Falha ao inicializar banco:", err);
  process.exit(1);
});

// Recebe eventos do barramento e cria notificacoes automaticamente
app.post("/eventos", async (req, res) => {
  const { tipo, dados } = req.body;
  console.log(`[Notificacoes Service] Evento recebido: ${tipo}`, dados);

  if (tipo === "agendamento:created") {
    const { user_id, nomeCachorro, servico, data, horario } = dados;
    try {
      await pool.query(
        `INSERT INTO notificacoes (user_id, titulo, mensagem, tipo) VALUES (?, ?, ?, ?)`,
        [
          user_id,
          "Agendamento confirmado!",
          `Seu agendamento de ${NOMES_SERVICO[servico] || servico} para ${nomeCachorro} no dia ${dataBr(data)} às ${horario} foi confirmado.`,
          "agendamento",
        ]
      );
      console.log("[Notificacoes] Notificacao de agendamento criada para user_id:", user_id);
    } catch (err) {
      console.error("[Notificacoes] Erro ao criar notificacao:", err);
    }
  }

  if (tipo === "user:created") {
    const { id, nome } = dados;
    try {
      await pool.query(
        `INSERT INTO notificacoes (user_id, titulo, mensagem, tipo) VALUES (?, ?, ?, ?)`,
        [
          id,
          "Bem-vindo a AUventura Park!",
          `Ola, ${nome}! Sua conta foi criada com sucesso. Agende seu primeiro servico!`,
          "geral",
        ]
      );
      console.log("[Notificacoes] Notificacao de boas-vindas criada para user_id:", id);
    } catch (err) {
      console.error("[Notificacoes] Erro ao criar notificacao de boas-vindas:", err);
    }
  }

  if (tipo === "daycare:created") {
    const { userId, plano } = dados;
    try {
      await pool.query(
        `INSERT INTO notificacoes (user_id, titulo, mensagem, tipo) VALUES (?, ?, ?, ?)`,
        [
          userId,
          "Daycare confirmado!",
          `Sua vaga no Daycare foi confirmada! Plano: ${NOMES_PLANO[plano] || plano}.`,
          "daycare",
        ]
      );
      console.log("[Notificacoes] Notificacao de daycare criada para user_id:", userId);
    } catch (err) {
      console.error("[Notificacoes] Erro ao criar notificacao de daycare:", err);
    }
  }

  res.status(200).json({ message: "Evento processado." });
});


// GET / - Todas as notificacoes do usuario
app.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notificacoes WHERE user_id = ? ORDER BY criado_em DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Nao foi possivel buscar as notificacoes." });
  }
});

// GET /nao-lidas - Notificacoes nao lidas
app.get("/nao-lidas", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notificacoes WHERE user_id = ? AND lida = 0 ORDER BY criado_em DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Nao foi possivel buscar notificacoes nao lidas." });
  }
});

// PATCH /:id/lida - Marca como lida
app.patch("/:id/lida", authenticate, async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE notificacoes SET lida = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Notificacao nao encontrada." });
    res.json({ message: "Marcada como lida." });
  } catch (err) {
    res.status(500).json({ error: "Nao foi possivel atualizar a notificacao." });
  }
});

// DELETE /:id - Exclui notificacao
app.delete("/:id", authenticate, async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM notificacoes WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Notificacao nao encontrada." });
    res.json({ message: "Notificacao excluida." });
  } catch (err) {
    res.status(500).json({ error: "Nao foi possivel excluir a notificacao." });
  }
});

app.use((req, res) => res.status(404).json({ error: "Rota nao encontrada." }));

app.listen(PORT, () => {
  console.log(`[Notificacoes Service] listening on port ${PORT}`);
});
