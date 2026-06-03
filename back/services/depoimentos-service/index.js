require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { pool, initializeDatabase } = require("../../shared/database");

const app = express();
const PORT = process.env.TESTIMONIALS_SERVICE_PORT || 3002;
const BARRAMENTO_URL = process.env.BARRAMENTO_URL || "http://localhost:10000";

app.use(express.json());

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

// Recebe eventos do barramento
app.post("/eventos", (req, res) => {
  const { tipo, dados } = req.body;
  console.log(`[Depoimentos Service] Evento recebido: ${tipo}`, dados);
  res.status(200).json({ message: "Evento processado." });
});

// GET / - Todos os depoimentos
app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM depoimentos ORDER BY criado_em DESC");
    res.json(rows);
  } catch (error) {
    console.error("GET / error:", error);
    res.status(500).json({ error: "Nao foi possivel buscar depoimentos." });
  }
});

// POST / - Criar depoimento
app.post("/", async (req, res) => {
  console.log("POST / received:", req.body);
  const { nomeCachorro, nomeTutor, raca, comentario } = req.body;

  if (!nomeCachorro || !nomeTutor || !raca || !comentario) {
    return res.status(400).json({ error: "Todos os campos sao obrigatorios." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO depoimentos (nomeCachorro, nomeTutor, raca, comentario) VALUES (?, ?, ?, ?)",
      [nomeCachorro, nomeTutor, raca, comentario]
    );

    const testimonial = {
      id: result.insertId, nomeCachorro, nomeTutor, raca, comentario,
      criado_em: new Date().toISOString(),
    };

    // Publica evento no barramento
    axios.post(`${BARRAMENTO_URL}/eventos`, {
      tipo: "testimonial:created",
      dados: testimonial
    }).catch(err => console.error("[Depoimentos] Erro ao publicar no barramento:", err.message));

    res.status(201).json(testimonial);
  } catch (error) {
    console.error("POST / error:", error);
    res.status(500).json({ error: "Nao foi possivel salvar o depoimento." });
  }
});

// GET /:id - Buscar depoimento por ID
app.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM depoimentos WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Depoimento nao encontrado." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("GET /:id error:", error);
    res.status(500).json({ error: "Nao foi possivel buscar o depoimento." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota nao encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Testimonials Service] listening on port ${PORT}`);
});

module.exports = app;
