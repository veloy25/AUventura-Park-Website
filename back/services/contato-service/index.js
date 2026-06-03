require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { pool, initializeDatabase } = require("../../shared/database");

const app = express();
const PORT = process.env.CONTACT_SERVICE_PORT || 3006;
const BARRAMENTO_URL = process.env.BARRAMENTO_URL || "http://localhost:10000";

app.use(express.json());

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

// Recebe eventos do barramento
app.post("/eventos", (req, res) => {
  const { tipo, dados } = req.body;
  console.log(`[Contato Service] Evento recebido: ${tipo}`, dados);
  res.status(200).json({ message: "Evento processado." });
});

// POST / - Enviar mensagem de contato
app.post("/", async (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body;

  if (!nome || !email || !assunto || !mensagem) {
    return res.status(400).json({ error: "Nome, e-mail, assunto e mensagem sao obrigatorios." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO contatos (nome, email, telefone, assunto, mensagem) VALUES (?, ?, ?, ?, ?)`,
      [nome, email, telefone || "", assunto, mensagem]
    );

    const contato = {
      id: result.insertId, nome, email, telefone: telefone || "",
      assunto, mensagem, status: "novo", criado_em: new Date().toISOString(),
    };

    // Publica evento no barramento
    axios.post(`${BARRAMENTO_URL}/eventos`, {
      tipo: "contato:criado",
      dados: contato
    }).catch(err => console.error("[Contato] Erro ao publicar no barramento:", err.message));

    res.status(201).json(contato);
  } catch (error) {
    console.error("POST /contatos error:", error);
    res.status(500).json({ error: "Nao foi possivel salvar a mensagem de contato." });
  }
});

// GET / - Listar todas as mensagens
app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contatos ORDER BY criado_em DESC");
    res.json(rows);
  } catch (error) {
    console.error("GET /contatos error:", error);
    res.status(500).json({ error: "Nao foi possivel buscar as mensagens de contato." });
  }
});

// GET /:id - Buscar mensagem por ID
app.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contatos WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Mensagem nao encontrada." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("GET /contatos/:id error:", error);
    res.status(500).json({ error: "Nao foi possivel buscar a mensagem." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota nao encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Contato Service] listening on port ${PORT}`);
});

module.exports = app;
