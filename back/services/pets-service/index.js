require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, initializeDatabase } = require("../../shared/database");
const { verifyToken } = require("../../shared/auth");
const messageBus = require("../../shared/messagebus");

const app = express();
const PORT = process.env.PETS_SERVICE_PORT || 3004;

app.use(cors());
app.use(express.json());

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
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

// GET / — lista os pets do usuário autenticado
app.get("/", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, nome, idade, peso, raca, vacinas, criado_em FROM pets WHERE user_id = ? ORDER BY criado_em ASC",
      [userId]
    );
    // Converte vacinas de string CSV para array
    const pets = rows.map((p) => ({
      ...p,
      vacinas: p.vacinas ? p.vacinas.split(",").filter(Boolean) : [],
    }));
    res.json(pets);
  } catch (error) {
    console.error("GET / error:", error);
    res.status(500).json({ error: "Não foi possível buscar os pets." });
  }
});

// POST / — cadastra um novo pet
app.post("/", authenticate, async (req, res) => {
  const { nome, idade, peso, raca, vacinas } = req.body;
  const userId = req.user.id;

  if (!nome || !idade || !peso || !raca) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  const vacinasStr = Array.isArray(vacinas) ? vacinas.join(",") : (vacinas || "");

  try {
    const [result] = await pool.query(
      "INSERT INTO pets (user_id, nome, idade, peso, raca, vacinas) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, nome.trim(), parseInt(idade), parseFloat(peso), raca.trim(), vacinasStr]
    );

    const pet = {
      id: result.insertId,
      user_id: userId,
      nome: nome.trim(),
      idade: parseInt(idade),
      peso: parseFloat(peso),
      raca: raca.trim(),
      vacinas: Array.isArray(vacinas) ? vacinas : [],
      criado_em: new Date().toISOString(),
    };

    messageBus.publish("pet:created", pet, "pets-service");

    res.status(201).json(pet);
  } catch (error) {
    console.error("POST / error:", error);
    res.status(500).json({ error: "Não foi possível cadastrar o pet." });
  }
});

// DELETE /:id — remove um pet do usuário
app.delete("/:id", authenticate, async (req, res) => {
  const userId = req.user.id;
  const petId = req.params.id;

  try {
    const [result] = await pool.query(
      "DELETE FROM pets WHERE id = ? AND user_id = ?",
      [petId, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pet não encontrado." });
    }
    res.json({ message: "Pet removido com sucesso." });
  } catch (error) {
    console.error("DELETE /:id error:", error);
    res.status(500).json({ error: "Não foi possível remover o pet." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Pets Service] listening on port ${PORT}`);
});