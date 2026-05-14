require("dotenv").config();
const express = require("express");
const { pool, initializeDatabase } = require("../../shared/database");

const app = express();
const PORT = process.env.CONTACT_SERVICE_PORT || 3006;

app.use(express.json());

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

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

    res.status(201).json({
      id: result.insertId,
      nome,
      email,
      telefone: telefone || "",
      assunto,
      mensagem,
      status: "novo",
      criado_em: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /contatos error:", error);
    res.status(500).json({
      error: "Não foi possível salvar a mensagem de contato.",
    });
  }
});

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

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Contato Service] listening on port ${PORT}`);
});

module.exports = app;