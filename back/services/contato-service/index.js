require("dotenv").config();
const express = require("express");
const { pool, initializeDatabase } = require("../../shared/database");
const messageBus = require("../../shared/messagebus");

const app = express();
const PORT = process.env.CONTACT_SERVICE_PORT || 3006;

app.use(express.json());

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

// POST / — Enviar mensagem de contato
app.post("/", async (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body;

  if (!nome || !email || !assunto || !mensagem) {
    return res.status(400).json({
      error: "Nome, e-mail, assunto e mensagem são obrigatórios.",
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO contatos 
        (nome, email, telefone, assunto, mensagem) 
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, telefone || "", assunto, mensagem]
    );

    const contato = {
      id: result.insertId,
      nome,
      email,
      telefone: telefone || "",
      assunto,
      mensagem,
      status: "novo",
      criado_em: new Date().toISOString(),
    };

    messageBus.publish("contato:criado", contato, "contato-service");

    res.status(201).json(contato);
  } catch (error) {
    console.error("POST /contatos error:", error);
    res.status(500).json({
      error: "Não foi possível salvar a mensagem de contato.",
    });
  }
});

// GET / — Listar todas as mensagens
app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM contatos ORDER BY criado_em DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("GET /contatos error:", error);
    res.status(500).json({
      error: "Não foi possível buscar as mensagens de contato.",
    });
  }
});

// GET /:id — Buscar mensagem por ID
app.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM contatos WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Mensagem não encontrada." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("GET /contatos/:id error:", error);
    res.status(500).json({
      error: "Não foi possível buscar a mensagem.",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Contato Service] listening on port ${PORT}`);
});

module.exports = app;