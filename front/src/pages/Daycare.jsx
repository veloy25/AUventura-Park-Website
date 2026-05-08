import { useState, useEffect } from "react";
import { apiGetPets, apiCreatePet } from "../services/petsService";
import { apiVerificarVagas, apiCriarAgendamentoDaycare } from "../services/daycareService";
import "../styles/Daycare.css";

// ─── Constantes ───────────────────────────────────────────────────────────────
const RACAS = [
  "Akita","American Bully","Basenji","Beagle","Bichon Frisé","Border Collie",
  "Boston Terrier","Boxer","Buldogue Francês","Buldogue Inglês","Cavalier King Charles",
  "Chihuahua","Chow Chow","Cocker Spaniel","Dachshund","Dálmata","Dobermann",
  "Dogo Argentino","Fila Brasileiro","Golden Retriever","Husky Siberiano",
  "Jack Russell Terrier","Labrador Retriever","Lhasa Apso","Malamute do Alasca",
  "Maltês","Mastiff","Pinscher Miniatura","Pit Bull","Pomerânia","Poodle","Pug",
  "Rottweiler","Samoieda","Schnauzer","Shar Pei","Shih Tzu","Spitz Alemão",
  "Vira-lata","Weimaraner","Yorkshire Terrier",
];

const VACINAS = [
  { id: "antirrabica",      label: "Antirrábica" },
  { id: "polivalente",      label: "Polivalente" },
  { id: "traqueobronquite", label: "Traqueobronquite" },
];

const DIAS_SEMANA = [
  { valor: 1, label: "Seg" },
  { valor: 2, label: "Ter" },
  { valor: 3, label: "Qua" },
  { valor: 4, label: "Qui" },
  { valor: 5, label: "Sex" },
];

const DAYCARE_PLANOS = [
  { id: "dayuse",     label: "Dia Teste / Avulso",  frequencias: null },
  { id: "mensal",     label: "Mensal",               frequencias: ["1x por semana","2x por semana","3x por semana","4x por semana","5x por semana"] },
  { id: "trimestral", label: "Trimestral (3 meses)", frequencias: ["1x por semana","2x por semana","3x por semana","4x por semana","5x por semana"] },
  { id: "semestral",  label: "Semestral (6 meses)",  frequencias: ["1x por semana","2x por semana","3x por semana","4x por semana","5x por semana"] },
  { id: "anual",      label: "Anual (12 meses)",     frequencias: ["1x por semana","2x por semana","3x por semana","4x por semana","5x por semana"] },
];

const TABELA_PRECOS = [
  { plano: "1x por semana", mensal: 465.80,  trimestral: 419.22,  semestral: 395.93,  anual: 372.64  },
  { plano: "2x por semana", mensal: 816.00,  trimestral: 734.40,  semestral: 693.60,  anual: 652.80  },
  { plano: "3x por semana", mensal: 1050.60, trimestral: 945.54,  semestral: 893.01,  anual: 840.48  },
  { plano: "4x por semana", mensal: 1169.60, trimestral: 1052.64, semestral: 994.16,  anual: 935.68  },
  { plano: "5x por semana", mensal: 1394.00, trimestral: 1254.60, semestral: 1184.90, anual: 1115.20 },
  { plano: "Dia Teste / Avulso", mensal: 160.00, trimestral: null, semestral: null,   anual: null    },
];

const PET_VAZIO  = { nome: "", idade: "", peso: "", raca: "", vacinas: [] };
const FORM_VAZIO = { petId: "", plano: "", frequencia: "", diasSemana: [], dataInicio: "", dataAvulso: "", observacoes: "" };

const fmt = (v) => v === null ? "—" : `R$ ${v.toFixed(2).replace(".", ",")}`;

function resolverPreco(planoId, frequencia) {
  if (planoId === "dayuse") return 160;
  const row = TABELA_PRECOS.find((r) => r.plano === frequencia);
  if (!row) return null;
  return { mensal: row.mensal, trimestral: row.trimestral, semestral: row.semestral, anual: row.anual }[planoId] ?? null;
}

// Extrai o número máximo de dias a partir da string de frequência ("3x por semana" → 3)
function extrairMaxDias(frequencia) {
  if (!frequencia) return 0;
  const match = frequencia.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 0;
}


// ─── Modal tabela de preços ───────────────────────────────────────────────────
function ModalTabelaPrecos({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="dc-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dc-modal-box">
        <div className="dc-modal-header">
          <h3 className="dc-modal-title">🏡 Tabela de Preços — Daycare</h3>
          <button className="dc-modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <p className="dc-modal-subtitle">
          Planos mensais por frequência semanal, com descontos progressivos para contratos de maior duração.
        </p>
        <div className="dc-table-wrap">
          <table className="dc-preco-table">
            <thead>
              <tr>
                <th>Plano</th>
                <th>Mensal</th>
                <th>Trimestral <span className="dc-desconto-badge">-10%</span></th>
                <th>Semestral <span className="dc-desconto-badge">-15%</span></th>
                <th>Anual <span className="dc-desconto-badge">-20%</span></th>
              </tr>
            </thead>
            <tbody>
              {TABELA_PRECOS.map((row) => (
                <tr key={row.plano}>
                  <td><strong>{row.plano}</strong></td>
                  <td>{fmt(row.mensal)}</td>
                  <td>{fmt(row.trimestral)}</td>
                  <td>{fmt(row.semestral)}</td>
                  <td>{fmt(row.anual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="dc-btn-primary dc-btn-full" style={{ marginTop: 16 }} onClick={onClose}>
          Entendido!
        </button>
      </div>
    </div>
  );
}


// ─── Toast boas-vindas ────────────────────────────────────────────────────────
function ToastPrecos({ onSim, onNao }) {
  return (
    <div className="dc-toast">
      <span>💰 Deseja ver a tabela de preços do Daycare?</span>
      <div className="dc-toast-btns">
        <button className="dc-toast-sim" onClick={onSim}>Ver preços</button>
        <button className="dc-toast-nao" onClick={onNao}>Agora não</button>
      </div>
    </div>
  );
}


// ─── Página principal do Daycare ──────────────────────────────────────────────
function Daycare({ user, onVoltar, onSuccess }) {
  const [pets, setPets]               = useState([]);
  const [form, setForm]               = useState(FORM_VAZIO);
  const [novoPet, setNovoPet]         = useState(PET_VAZIO);
  const [racaInput, setRacaInput]     = useState("");
  const [racaSugestoes, setRacaSugestoes] = useState([]);
  const [showPetForm, setShowPetForm] = useState(false);
  const [vagasInfo, setVagasInfo]     = useState(null);
  const [loadingVagas, setLoadingVagas] = useState(false);
  const [loadingPet, setLoadingPet]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [errorPet, setErrorPet]       = useState("");
  const [feedbackPet, setFeedbackPet] = useState("");
  const [feedback, setFeedback]       = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [showToast, setShowToast]     = useState(true);

  const planoAtual = DAYCARE_PLANOS.find((p) => p.id === form.plano);
  const valorTotal = resolverPreco(form.plano, form.frequencia);
  const maxDias    = extrairMaxDias(form.frequencia);

  // Carrega pets ao montar
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    apiGetPets(token).then(setPets).catch(() => {});
  }, []);

  // Verifica vagas ao mudar data (Day Use)
  useEffect(() => {
    if (form.plano !== "dayuse" || !form.dataAvulso) { setVagasInfo(null); return; }
    const token = localStorage.getItem("authToken");
    setLoadingVagas(true);
    apiVerificarVagas(token, form.dataAvulso)
      .then(setVagasInfo)
      .catch(() => setVagasInfo(null))
      .finally(() => setLoadingVagas(false));
  }, [form.dataAvulso, form.plano]);

  // ─── Toggle dia com limite de maxDias ────────────────────────────────────────
  const toggleDia = (valor) =>
    setForm((prev) => {
      const jaSelecionado = prev.diasSemana.includes(valor);
      // Desmarcando: sempre permite
      if (jaSelecionado)
        return { ...prev, diasSemana: prev.diasSemana.filter((d) => d !== valor) };
      // Marcando: bloqueia se já atingiu o limite
      if (prev.diasSemana.length >= maxDias) return prev;
      return { ...prev, diasSemana: [...prev.diasSemana, valor] };
    });

  const handleRacaChange = (val) => {
    setRacaInput(val);
    setNovoPet((p) => ({ ...p, raca: val }));
    setRacaSugestoes(
      val.length < 1 ? [] : RACAS.filter((r) => r.toLowerCase().startsWith(val.toLowerCase())).slice(0, 6)
    );
  };

  const selecionarRaca = (raca) => {
    setRacaInput(raca);
    setNovoPet((p) => ({ ...p, raca }));
    setRacaSugestoes([]);
  };

  const toggleVacina = (id) =>
    setNovoPet((p) => ({
      ...p,
      vacinas: p.vacinas.includes(id) ? p.vacinas.filter((v) => v !== id) : [...p.vacinas, id],
    }));

  const handlePetSubmit = async () => {
    setErrorPet(""); setFeedbackPet("");
    const { nome, idade, peso, raca } = novoPet;
    if (!nome || !idade || !peso || !raca) { setErrorPet("Preencha todos os campos do pet."); return; }
    const token = localStorage.getItem("authToken");
    setLoadingPet(true);
    try {
      const criado = await apiCreatePet(token, novoPet);
      setPets((prev) => [...prev, criado]);
      setFeedbackPet(`${nome} cadastrado com sucesso!`);
      setNovoPet(PET_VAZIO); setRacaInput("");
      setTimeout(() => { setShowPetForm(false); setFeedbackPet(""); }, 1800);
    } catch { setErrorPet("Não foi possível cadastrar o pet."); }
    finally { setLoadingPet(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setFeedback("");

    if (!form.petId)  { setError("Selecione o pet."); return; }
    if (!form.plano)  { setError("Selecione um plano."); return; }

    if (form.plano === "dayuse") {
      if (!form.dataAvulso) { setError("Informe a data do dia avulso."); return; }
    } else {
      if (!form.frequencia)  { setError("Selecione a frequência."); return; }
      if (form.diasSemana.length === 0) { setError("Selecione os dias da semana."); return; }
      if (form.diasSemana.length !== maxDias) {
        setError(`Selecione exatamente ${maxDias} dia(s) conforme a frequência escolhida.`);
        return;
      }
      if (!form.dataInicio) { setError("Informe a data de início."); return; }
    }

    if (vagasInfo && !vagasInfo.disponivel) { setError("Não há vagas disponíveis nesta data."); return; }

    const token = localStorage.getItem("authToken");
    setLoading(true);
    try {
      await apiCriarAgendamentoDaycare(token, {
        petId:       form.petId,
        plano:       form.plano,
        frequencia:  form.frequencia || null,
        diasSemana:  form.diasSemana,
        dataInicio:  form.plano !== "dayuse" ? form.dataInicio : null,
        dataAvulso:  form.plano === "dayuse"  ? form.dataAvulso : null,
        observacoes: form.observacoes,
        valorTotal,
      });
      setFeedback("Agendamento de Daycare criado com sucesso! 🎉");
      setTimeout(onSuccess, 2000);
    } catch (err) {
      setError(err.message || "Não foi possível criar o agendamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dc-page">

      {/* Toast */}
      {showToast && (
        <ToastPrecos
          onSim={() => { setShowToast(false); setShowModal(true); }}
          onNao={() => setShowToast(false)}
        />
      )}

      {/* Modal */}
      {showModal && <ModalTabelaPrecos onClose={() => setShowModal(false)} />}

      <button className="dc-back-btn" onClick={onVoltar}>← Voltar ao serviço</button>

      <div className="dc-form-wrap">
        <div className="dc-form-header">
          <span className="dc-badge">Daycare 🏡</span>
          <h2 className="dc-title">Confirmar agendamento de Daycare</h2>
          <p className="dc-subtitle">Olá, <strong>{user?.nome}</strong>! Escolha o plano ideal para o seu pet.</p>
        </div>

        {error    && <p className="dc-msg-error">{error}</p>}
        {feedback && <p className="dc-msg-success">{feedback}</p>}

        <form className="dc-form-card" onSubmit={handleSubmit}>

          {/* ── Pet ── */}
          <div className="dc-field-group">
            <label className="dc-label">Qual pet vai frequentar o Daycare?</label>
            <div className="dc-chip-grid">
              {pets.map((pet) => (
                <button key={pet.id} type="button"
                  className={`dc-chip ${form.petId === pet.id ? "dc-chip-active" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, petId: pet.id }))}>
                  🐶 {pet.nome}
                </button>
              ))}
              <button type="button" className="dc-chip dc-chip-add"
                onClick={() => setShowPetForm(true)}>
                + Cadastrar pet
              </button>
            </div>
          </div>

          {/* ── Cadastro de pet inline ── */}
          {showPetForm && (
            <div className="dc-pet-box">
              <div className="dc-pet-box-header">
                <h4 className="dc-pet-box-title">Cadastrar novo pet</h4>
                <button type="button" className="dc-pet-box-close"
                  onClick={() => { setShowPetForm(false); setErrorPet(""); }}>✕</button>
              </div>
              {errorPet    && <p className="dc-msg-error">{errorPet}</p>}
              {feedbackPet && <p className="dc-msg-success">{feedbackPet}</p>}
              <div className="dc-row-2">
                <div className="dc-field-group">
                  <label className="dc-label">Nome do pet</label>
                  <input className="dc-input" placeholder="Ex: Rex" value={novoPet.nome}
                    onChange={(e) => setNovoPet((p) => ({ ...p, nome: e.target.value }))} />
                </div>
                <div className="dc-field-group">
                  <label className="dc-label">Idade (anos)</label>
                  <input className="dc-input" type="number" min="1" placeholder="Ex: 3" value={novoPet.idade}
                    onChange={(e) => setNovoPet((p) => ({ ...p, idade: e.target.value }))} />
                </div>
              </div>
              <div className="dc-row-2">
                <div className="dc-field-group">
                  <label className="dc-label">Peso (kg)</label>
                  <input className="dc-input" type="number" min="0" step="0.1" placeholder="Ex: 12.5" value={novoPet.peso}
                    onChange={(e) => setNovoPet((p) => ({ ...p, peso: e.target.value }))} />
                </div>
                <div className="dc-field-group" style={{ position: "relative" }}>
                  <label className="dc-label">Raça</label>
                  <input className="dc-input" placeholder="Ex: Golden Retriever" value={racaInput}
                    onChange={(e) => handleRacaChange(e.target.value)} autoComplete="off" />
                  {racaSugestoes.length > 0 && (
                    <ul className="dc-autocomplete">
                      {racaSugestoes.map((r) => (
                        <li key={r} className="dc-autocomplete-item" onMouseDown={() => selecionarRaca(r)}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="dc-field-group">
                <label className="dc-label">Vacinação</label>
                <div className="dc-vacinas-grid">
                  {VACINAS.map((v) => (
                    <label key={v.id} className="dc-vacina-check">
                      <input type="checkbox" checked={novoPet.vacinas.includes(v.id)} onChange={() => toggleVacina(v.id)} />
                      <span>{v.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="button" className="dc-btn-primary dc-btn-full" onClick={handlePetSubmit} disabled={loadingPet}>
                {loadingPet ? "Cadastrando..." : "Cadastrar pet"}
              </button>
            </div>
          )}

          {/* ── Plano ── */}
          <div className="dc-field-group">
            <label className="dc-label">Plano</label>
            <div className="dc-chip-grid">
              {DAYCARE_PLANOS.map((plano) => (
                <button key={plano.id} type="button"
                  className={`dc-chip ${form.plano === plano.id ? "dc-chip-active" : ""}`}
                  onClick={() => setForm((p) => ({
                    ...p,
                    plano: plano.id,
                    frequencia: "",
                    diasSemana: [],
                    dataInicio: "",
                    dataAvulso: "",
                  }))}>
                  {plano.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Day Use: data avulsa ── */}
          {form.plano === "dayuse" && (
            <div className="dc-field-group">
              <label className="dc-label">Data</label>
              <input type="date" className="dc-input" value={form.dataAvulso}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((p) => ({ ...p, dataAvulso: e.target.value }))} required />
              {loadingVagas && <p className="dc-hint">Verificando vagas...</p>}
              {vagasInfo && (
                <p className={`dc-hint ${vagasInfo.disponivel ? "dc-hint-ok" : "dc-hint-err"}`}>
                  {vagasInfo.disponivel
                    ? `✅ ${vagasInfo.maximo - vagasInfo.ocupados} vaga(s) disponível(eis)`
                    : `❌ Lotado — sem vagas nesta data`}
                </p>
              )}
            </div>
          )}

          {/* ── Planos recorrentes ── */}
          {form.plano && form.plano !== "dayuse" && (
            <>
              {/* Frequência — resetar diasSemana ao mudar */}
              <div className="dc-field-group">
                <label className="dc-label">Frequência semanal</label>
                <select className="dc-input" value={form.frequencia}
                  onChange={(e) => setForm((p) => ({ ...p, frequencia: e.target.value, diasSemana: [] }))}
                  required>
                  <option value="">Selecione...</option>
                  {planoAtual?.frequencias?.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Dias da semana — com limite e feedback visual */}
              {form.frequencia && (
                <div className="dc-field-group">
                  <label className="dc-label">
                    Dias da semana
                    <span className="dc-label-hint">
                      — selecione {maxDias} dia{maxDias > 1 ? "s" : ""}
                    </span>
                  </label>
                  <div className="dc-chip-grid">
                    {DIAS_SEMANA.map((dia) => {
                      const selecionado = form.diasSemana.includes(dia.valor);
                      const bloqueado   = !selecionado && form.diasSemana.length >= maxDias;
                      return (
                        <button key={dia.valor} type="button"
                          className={`dc-chip ${selecionado ? "dc-chip-active" : ""} ${bloqueado ? "dc-chip-disabled" : ""}`}
                          onClick={() => toggleDia(dia.valor)}
                          disabled={bloqueado}
                          title={bloqueado ? `Máximo de ${maxDias} dia(s) para esta frequência` : ""}>
                          {dia.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Contador */}
                  <p className={`dc-hint ${form.diasSemana.length === maxDias ? "dc-hint-ok" : ""}`}>
                    {form.diasSemana.length}/{maxDias} dia{maxDias > 1 ? "s" : ""} selecionado{form.diasSemana.length !== 1 ? "s" : ""}
                    {form.diasSemana.length === maxDias ? " ✅" : ""}
                  </p>
                </div>
              )}

              <div className="dc-field-group">
                <label className="dc-label">Data de início</label>
                <input type="date" className="dc-input" value={form.dataInicio}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm((p) => ({ ...p, dataInicio: e.target.value }))} required />
              </div>
            </>
          )}

          {/* ── Resumo de valor ── */}
          {valorTotal !== null && valorTotal !== undefined && (
            <div className="dc-resumo">
              <span>💰 Valor estimado:</span>
              <strong>R$ {valorTotal.toFixed(2).replace(".", ",")}</strong>
            </div>
          )}

          {/* ── Observações ── */}
          <div className="dc-field-group">
            <label className="dc-label">Observações (opcional)</label>
            <textarea className="dc-input" rows={3} placeholder="Alguma instrução especial?"
              value={form.observacoes}
              onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} />
          </div>

          <button type="button" className="dc-btn-secondary dc-btn-full"
            style={{ marginBottom: 10 }}
            onClick={() => setShowModal(true)}>
            📋 Ver tabela de preços
          </button>

          <button type="submit" className="dc-btn-primary dc-btn-full" disabled={loading}>
            {loading ? "Confirmando..." : "🗓 Confirmar agendamento"}
          </button>

        </form>
      </div>
    </section>
  );
}

export default Daycare;