require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { pool, initializeDatabase } = require("../../shared/database");
const { generateToken } = require("../../shared/auth");

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;
const BARRAMENTO_URL = process.env.BARRAMENTO_URL || "http://localhost:10000";

app.use(express.json());

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

// Recebe eventos do barramento
app.post("/eventos", (req, res) => {
  const { tipo, dados } = req.body;
  console.log(`[User Service] Evento recebido: ${tipo}`, dados);
  // Adicione aqui reacoes a eventos de outros servicos se necessario
  res.status(200).json({ message: "Evento processado." });
});

// POST /signup - Criar nova conta
app.post("/signup", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, e-mail e senha sao obrigatorios." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Este e-mail ja esta em uso." });
    }

    const passwordHash = bcrypt.hashSync(senha, 10);
    const [result] = await pool.query(
      "INSERT INTO users (nome, email, password_hash) VALUES (?, ?, ?)",
      [nome.trim(), normalizedEmail, passwordHash]
    );

    // Publica evento no barramento
    axios.post(`${BARRAMENTO_URL}/eventos`, {
      tipo: "user:created",
      dados: { id: result.insertId, nome: nome.trim(), email: normalizedEmail }
    }).catch(err => console.error("[User] Erro ao publicar no barramento:", err.message));

    res.status(201).json({ id: result.insertId, nome: nome.trim(), email: normalizedEmail });
  } catch (error) {
    console.error("POST /signup error:", error);
    res.status(500).json({ error: "Nao foi possivel criar a conta." });
  }
});

// POST /login - Autenticar usuario
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha sao obrigatorios." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [rows] = await pool.query("SELECT id, nome, email, password_hash FROM users WHERE email = ?", [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha invalidos." });
    }

    const user = rows[0];
    const isPasswordValid = bcrypt.compareSync(senha, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "E-mail ou senha invalidos." });
    }

    const token = generateToken({ id: user.id, nome: user.nome, email: user.email });

    // Publica evento no barramento
    axios.post(`${BARRAMENTO_URL}/eventos`, {
      tipo: "user:logged-in",
      dados: { id: user.id, email: user.email }
    }).catch(err => console.error("[User] Erro ao publicar no barramento:", err.message));

    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (error) {
    console.error("POST /login error:", error);
    res.status(500).json({ error: "Nao foi possivel fazer login." });
  }
});

// GET /me - Perfil do usuario autenticado
app.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticacao ausente." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { verifyToken } = require("../../shared/auth");
    const user = verifyToken(token);
    const [rows] = await pool.query("SELECT id, nome, email FROM users WHERE id = ?", [user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }
    res.json({ user: rows[0] });
  } catch (error) {
    console.error("GET /me error:", error);
    res.status(401).json({ error: "Token invalido ou expirado." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota nao encontrada." });
});

app.listen(PORT, () => {
  console.log(`[User Service] listening on port ${PORT}`);
});

module.exports = app;
