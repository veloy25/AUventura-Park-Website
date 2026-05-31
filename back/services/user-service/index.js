require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const { pool, initializeDatabase } = require("../../shared/database");
const { generateToken } = require("../../shared/auth");
const messageBus = require("../../shared/messagebus");
const axios = require("axios");
const NOTIFICACOES_SERVICE_URL = process.env.NOTIFICACOES_SERVICE_URL || "http://localhost:3007";

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;

app.use(express.json());

// Initialize database
initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

// Subscribe to testimonials created events
messageBus.subscribe("testimonial:created", "user-service", (event) => {
  console.log("[User Service] New testimonial received:", event.data);
  // You can add additional processing here if needed
});

// Routes

/**
 * POST /signup - Create a new user account
 */
app.post("/signup", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Este e-mail já está em uso." });
    }

    const passwordHash = bcrypt.hashSync(senha, 10);
    const [result] = await pool.query(
      "INSERT INTO users (nome, email, password_hash) VALUES (?, ?, ?)",
      [nome.trim(), normalizedEmail, passwordHash]
    );

    // Publish user created event
    messageBus.publish("user:created", { id: result.insertId, nome: nome.trim(), email: normalizedEmail }, "user-service");

    axios.post(`${NOTIFICACOES_SERVICE_URL}/interno/criar`, {
      user_id: result.insertId,
      titulo: "Bem-vindo à AUventura Park! 🐾",
      mensagem: `Olá, ${nome}! Sua conta foi criada com sucesso. Agende seu primeiro serviço!`,
      tipo: "geral"
    }).catch(err => console.error("[User] Erro ao notificar:", err.message));

    res.status(201).json({ id: result.insertId, nome: nome.trim(), email: normalizedEmail });
  } catch (error) {
    console.error("POST /signup error:", error);
    res.status(500).json({ error: "Não foi possível criar a conta." });
  }
});

/**
 * POST /login - Authenticate user and return JWT token
 */
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [rows] = await pool.query("SELECT id, nome, email, password_hash FROM users WHERE email = ?", [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const user = rows[0];
    const isPasswordValid = bcrypt.compareSync(senha, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const token = generateToken({ id: user.id, nome: user.nome, email: user.email });

    // Publish user logged in event
    messageBus.publish("user:logged-in", { id: user.id, email: user.email }, "user-service");

    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (error) {
    console.error("POST /login error:", error);
    res.status(500).json({ error: "Não foi possível fazer login." });
  }
});

/**
 * GET /me - Get current user profile (requires valid token in header)
 */
app.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticaçao ausente." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { verifyToken } = require("../../shared/auth");
    const user = verifyToken(token);
    const [rows] = await pool.query("SELECT id, nome, email FROM users WHERE id = ?", [user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.json({ user: rows[0] });
  } catch (error) {
    console.error("GET /me error:", error);
    res.status(401).json({ error: "Token invalido ou expirado." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[User Service] listening on port ${PORT}`);
});

module.exports = app;
