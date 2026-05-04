require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const DEPOIMENTOS_SERVICE_URL = process.env.DEPOIMENTOS_SERVICE_URL || "http://localhost:3002";
const SCHEDULING_SERVICE_URL = process.env.SCHEDULING_SERVICE_URL || "http://localhost:3003";

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "API Gateway is running" });
});

// User Service Routes

/**
 * POST /api/signup - Create a new user account
 * Forwards request to User Service
 */
app.post("/api/signup", async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/signup`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "User service error" };
    res.status(status).json(data);
  }
});

/**
 * POST /api/login - Authenticate user and return JWT token
 * Forwards request to User Service
 */
app.post("/api/login", async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "User service error" };
    res.status(status).json(data);
  }
});

/**
 * GET /api/me - Get current user profile
 * Forwards request to User Service
 */
app.get("/api/me", async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/me`, {
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "User service error" };
    res.status(status).json(data);
  }
});

// Testimonials Service Routes

/**
 * GET /api/depoimentos - Get all testimonials
 * Forwards request to Depoimentos Service
 */
app.get("/api/depoimentos", async (req, res) => {
  try {
    const response = await axios.get(`${DEPOIMENTOS_SERVICE_URL}/`);
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Depoimentos service error" };
    res.status(status).json(data);
  }
});

/**
 * POST /api/depoimentos - Create a new testimonial
 * Forwards request to Depoimentos Service
 */
app.post("/api/depoimentos", async (req, res) => {
  try {
    const response = await axios.post(`${DEPOIMENTOS_SERVICE_URL}/`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Depoimentos service error" };
    res.status(status).json(data);
  }
});

/**
 * GET /api/depoimentos/:id - Get a specific testimonial
 * Forwards request to Depoimentos Service
 */
app.get("/api/depoimentos/:id", async (req, res) => {
  try {
    const response = await axios.get(`${DEPOIMENTOS_SERVICE_URL}/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Depoimentos service error" };
    res.status(status).json(data);
  }
});

/**
 * GET /api/agendamentos - Get current user appointments
 * Forwards request to Scheduling Service
 */
app.get("/api/agendamentos", async (req, res) => {
  try {
    const response = await axios.get(`${SCHEDULING_SERVICE_URL}/`, {
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Scheduling service error" };
    res.status(status).json(data);
  }
});

/**
 * POST /api/agendamentos - Create a new appointment
 * Forwards request to Scheduling Service
 */
app.post("/api/agendamentos", async (req, res) => {
  try {
    const response = await axios.post(`${SCHEDULING_SERVICE_URL}/`, req.body, {
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Scheduling service error" };
    res.status(status).json(data);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[API Gateway] listening on port ${PORT}`);
  console.log(`  User Service: ${USER_SERVICE_URL}`);
  console.log(`  Depoimentos Service: ${DEPOIMENTOS_SERVICE_URL}`);
  console.log(`  Scheduling Service: ${SCHEDULING_SERVICE_URL}`);
});

module.exports = app;
