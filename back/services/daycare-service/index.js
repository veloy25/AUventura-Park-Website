require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, initializeDatabase } = require("../../shared/database");
const { verifyToken } = require("../../shared/auth");
const messageBus = require("../../shared/messagebus");

const app = express();
const PORT = process.env.DAYCARE_SERVICE_PORT || 3005;

// ─── Configurações — para alterar o limite, mude só aqui ─────────────────────
const MAX_PETS_DIA = 10;

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
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function gerarDatasPlano(dataInicio, diasSemana, plano) {
  const meses = { mensal: 1, trimestral: 3, semestral: 6, anual: 12 };
  const totalMeses = meses[plano];
  const inicio = new Date(dataInicio + "T00:00:00");
  const fim = new Date(inicio);
  fim.setMonth(fim.getMonth() + totalMeses);

  const datas = [];
  const cursor = new Date(inicio);
  while (cursor < fim) {
    if (diasSemana.includes(cursor.getDay())) {
      datas.push(cursor.toISOString().split("T")[0]);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return datas;
}

async function contarPetsPorDia(data) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as total FROM daycare_agendamentos
     WHERE JSON_CONTAINS(datas_geradas, ?, '$') AND status != 'cancelado'`,
    [JSON.stringify(data)]
  );
  return parseInt(rows[0].total, 10);
}

async function verificarVagas(datasGeradas) {
  for (const data of datasGeradas) {
    const total = await contarPetsPorDia(data);
    if (total >= MAX_PETS_DIA) {
      return { disponivel: false, dataLotada: data };
    }
  }
  return { disponivel: true };
}

// ── GET /verificar-day-teste/:petId ──────────────────────────────────────────
app.get("/verificar-day-teste/:petId", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id FROM daycare_agendamentos
       WHERE pet_id = ? AND plano = 'dayuse' AND status = 'concluido'
       LIMIT 1`,
      [req.params.petId]
    );
    res.json({ aprovado: rows.length > 0 });
  } catch (error) {
    console.error("GET /verificar-day-teste error:", error);
    res.status(500).json({ error: "Erro ao verificar Day Teste." });
  }
});

// ── GET /vagas?data=YYYY-MM-DD ────────────────────────────────────────────────
app.get("/vagas", authenticate, async (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).json({ error: "Data obrigatória." });
  try {
    const ocupados = await contarPetsPorDia(data);
    res.json({ ocupados, disponivel: ocupados < MAX_PETS_DIA, maximo: MAX_PETS_DIA });
  } catch (error) {
    console.error("GET /vagas error:", error);
    res.status(500).json({ error: "Erro ao verificar vagas." });
  }
});

// ── POST /agendar ─────────────────────────────────────────────────────────────
app.post("/agendar", authenticate, async (req, res) => {
  const { petId, plano, frequencia, diasSemana, dataInicio, dataAvulso, observacoes, valorTotal } = req.body;
  const userId = req.user.id;

  if (!petId || !plano) {
    return res.status(400).json({ error: "petId e plano são obrigatórios." });
  }

  // Garante que valor_total nunca seja null/undefined (evita erro de NOT NULL no banco)
  const valorFinal = (valorTotal != null && !isNaN(Number(valorTotal)))
    ? Number(valorTotal)
    : 0;

  try {
    let datasGeradas = [];
    if (plano === "dayuse") {
      if (!dataAvulso) return res.status(400).json({ error: "Data obrigatória para Day Use." });
      datasGeradas = [dataAvulso];
    } else {
      if (!dataInicio || !diasSemana?.length) {
        return res.status(400).json({ error: "Data de início e dias da semana são obrigatórios." });
      }
      datasGeradas = gerarDatasPlano(dataInicio, diasSemana, plano);
    }

    const vagas = await verificarVagas(datasGeradas);
    if (!vagas.disponivel) {
      const dataFormatada = new Date(vagas.dataLotada + "T00:00:00").toLocaleDateString("pt-BR");
      return res.status(409).json({ error: `Limite de ${MAX_PETS_DIA} pets atingido para o dia ${dataFormatada}.` });
    }

    const [result] = await pool.query(
      `INSERT INTO daycare_agendamentos
        (user_id, pet_id, plano, frequencia, dias_semana, data_inicio, data_avulso, datas_geradas, observacoes, valor_total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [
        userId,
        petId,
        plano,
        frequencia || null,
        JSON.stringify(diasSemana || []),
        dataInicio || null,
        dataAvulso || null,
        JSON.stringify(datasGeradas),
        observacoes || "",
        valorFinal,
      ]
    );

    const agendamento = {
      id: result.insertId,
      userId,
      petId,
      plano,
      frequencia,
      diasSemana,
      dataInicio,
      dataAvulso,
      datasGeradas,
      observacoes,
      valorTotal: valorFinal,
      status: "pendente",
      criado_em: new Date().toISOString(),
    };

    messageBus.publish("daycare:created", agendamento, "daycare-service");

    res.status(201).json(agendamento);
  } catch (error) {
    console.error("POST /agendar error:", error);
    res.status(500).json({ error: "Não foi possível criar o agendamento." });
  }
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Daycare Service] listening on port ${PORT}`);
});