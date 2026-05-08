import { useState, useEffect, useRef, useCallback } from "react";
import { apiGetAgendamentos, apiCreateAgendamento } from "../services/agendamentosService";
import { apiGetPets, apiCreatePet } from "../services/petsService";
import "../styles/Agendamentos.css";


// ─── Serviços ─────────────────────────────────────────────────────────────────
const SERVICOS = [
  {
    id: "daycare",
    label: "Daycare",
    emoji: "🏡",
    img: "/images/servicos/daycare.jpg",
    resumo: "Cuidado e diversão o dia todo enquanto você trabalha.",
    descricao: "No nosso Daycare, seu pet passa o dia em um ambiente seguro, supervisionado e cheio de amigos. Oferecemos atividades lúdicas, socialização controlada e muito carinho para que ele chegue em casa feliz e saudado.",
  },
  {
    id: "banho",
    label: "Banho",
    emoji: "🛁",
    img: "/images/servicos/banho.jpg",
    resumo: "Banho completo com produtos premium e secagem profissional.",
    descricao: "Utilizamos produtos hipoalergênicos e adequados para cada tipo de pelagem. O banho inclui limpeza de ouvidos, corte de unhas e secagem profissional.",
  },
  {
    id: "tosa",
    label: "Tosa",
    emoji: "✂️",
    img: "/images/servicos/tosa.jpg",
    resumo: "Tosa personalizada por profissionais experientes.",
    descricao: "A tosa pode ser higiênica, padrão da raça ou personalizada conforme sua preferência. Realizada por profissionais com anos de experiência.",
  },
  {
    id: "banho_tosa",
    label: "Banho e Tosa",
    emoji: "🛁✂️",
    img: "/images/servicos/banho_tosa.jpg",
    resumo: "Banho completo mais tosa personalizada para seu pet.",
    descricao: "Combine o banho completo com uma tosa feita por profissionais experientes. Deixamos seu pet impecável de ponta a ponta.",
  },
  {
    id: "hospedagem",
    label: "Hospedagem",
    emoji: "🌙",
    img: "/images/servicos/hospedagem.jpg",
    resumo: "Acomodação confortável para quando você precisar viajar.",
    descricao: "Nossa hospedagem oferece quartos privativos, caminhas confortáveis, alimentação monitorada e acompanhamento 24h.",
  },
];


// ─── Geração de slots ─────────────────────────────────────────────────────────
function gerarSlots(servico) {
  const slots = [];
  const intervalo = servico === "banho_tosa" ? 60 : 30;
  const fimH = 17;
  const fimM = servico === "banho_tosa" ? 0 : 30;

  let h = 8, m = 0;
  while (h < fimH || (h === fimH && m <= fimM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += intervalo;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}


const SERVICOS_COM_SLOTS = ["banho", "tosa", "banho_tosa"];


// ─── Raças / Vacinas ──────────────────────────────────────────────────────────
const RACAS = [
  "Akita", "American Bully", "Basenji", "Beagle", "Bichon Frisé", "Border Collie",
  "Boston Terrier", "Boxer", "Buldogue Francês", "Buldogue Inglês", "Cavalier King Charles",
  "Chihuahua", "Chow Chow", "Cocker Spaniel", "Dachshund", "Dálmata", "Dobermann",
  "Dogo Argentino", "Fila Brasileiro", "Golden Retriever", "Husky Siberiano",
  "Jack Russell Terrier", "Labrador Retriever", "Lhasa Apso", "Malamute do Alasca",
  "Maltês", "Mastiff", "Pinscher Miniatura", "Pit Bull", "Pomerânia", "Poodle", "Pug",
  "Rottweiler", "Samoieda", "Schnauzer", "Shar Pei", "Shih Tzu", "Spitz Alemão",
  "Vira-lata", "Weimaraner", "Yorkshire Terrier",
];


const VACINAS = [
  { id: "antirrabica", label: "Antirrábica" },
  { id: "polivalente", label: "Polivalente" },
  { id: "traqueobronquite", label: "Traqueobronquite" },
];


const AGENDAMENTO_VAZIO = { petId: "", servico: "", data: "", horario: "", observacoes: "" };
const PET_VAZIO = { nome: "", idade: "", peso: "", raca: "", vacinas: [] };


const servicoLabel = {
  daycare: "Daycare 🏡", banho: "Banho 🛁", tosa: "Tosa ✂️",
  banho_tosa: "Banho e Tosa 🛁✂️", hospedagem: "Hospedagem 🌙",
};


// ─── TimePicker (drum roll) ───────────────────────────────────────────────────
const ITEM_HEIGHT = 44;

function TimePicker({ slots, value, onChange, horariosOcupados = [], disabled = false }) {
  const listRef = useRef(null);

  const snapToNearest = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, slots.length - 1));
    el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
    if (!horariosOcupados.includes(slots[clamped])) {
      onChange(slots[clamped]);
    }
  }, [slots, onChange, horariosOcupados]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !value) return;
    const index = slots.indexOf(value);
    if (index >= 0) el.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
  }, [value, slots]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let timeout;
    const onScroll = () => { clearTimeout(timeout); timeout = setTimeout(snapToNearest, 120); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(timeout); };
  }, [snapToNearest]);

  return (
    <div className="tp-root" aria-label="Selecionar horário">
      <div className="tp-fade tp-fade-top" />
      <div className="tp-selector" />
      <div className="tp-fade tp-fade-bottom" />
      <ul
        ref={listRef}
        className="tp-list"
        role="listbox"
        aria-label="Horários disponíveis"
        style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}
      >
        <li className="tp-spacer" aria-hidden="true" />
        {slots.map((slot) => {
          const ocupado = horariosOcupados.includes(slot);
          const ativo = value === slot;
          return (
            <li
              key={slot}
              role="option"
              aria-selected={ativo}
              aria-disabled={ocupado}
              className={`tp-item ${ativo ? "tp-item--active" : ""} ${ocupado ? "tp-item--ocupado" : ""}`}
              onClick={() => {
                if (ocupado) return;
                onChange(slot);
                const index = slots.indexOf(slot);
                listRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
              }}
            >
              <span className="tp-item-time">{slot}</span>
              {ocupado && <span className="tp-item-tag">ocupado</span>}
            </li>
          );
        })}
        <li className="tp-spacer" aria-hidden="true" />
      </ul>
    </div>
  );
}


// ─── Componente principal ─────────────────────────────────────────────────────
function Agendamentos({ isLogado, user, setAbaAtiva, servicoPendente, setServicoPendente }) {
  const [tela, setTela] = useState("servicos");
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [pets, setPets] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState(AGENDAMENTO_VAZIO);
  const [loadingAg, setLoadingAg] = useState(false);
  const [errorAg, setErrorAg] = useState("");
  const [feedbackAg, setFeedbackAg] = useState("");
  const [showPetForm, setShowPetForm] = useState(false);
  const [novoPet, setNovoPet] = useState(PET_VAZIO);
  const [errorPet, setErrorPet] = useState("");
  const [feedbackPet, setFeedbackPet] = useState("");
  const [loadingPet, setLoadingPet] = useState(false);
  const [racaInput, setRacaInput] = useState("");
  const [racaSugestoes, setRacaSugestoes] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const racaRef = useRef(null);


  useEffect(() => {
    if (isLogado) {
      loadAgendamentos();
      loadPets();
    }
  }, [isLogado]);


  useEffect(() => {
    if (isLogado && servicoPendente) {
      setServicoSelecionado(servicoPendente);
      setNovoAgendamento({ ...AGENDAMENTO_VAZIO, servico: servicoPendente.id });
      setServicoPendente(null);
      setTela("form");
    }
  }, [isLogado, servicoPendente]);


  useEffect(() => {
    const handler = (e) => {
      if (racaRef.current && !racaRef.current.contains(e.target)) setRacaSugestoes([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  // Busca horários ocupados quando data ou serviço mudam
  useEffect(() => {
    const { data, servico } = novoAgendamento;
    if (!data || !servico || !SERVICOS_COM_SLOTS.includes(servico)) {
      setHorariosOcupados([]);
      return;
    }
    const controller = new AbortController();
    setLoadingSlots(true);
    fetch(`/api/agendamentos/horarios-ocupados?data=${data}&servico=${servico}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((ocupados) => setHorariosOcupados(Array.isArray(ocupados) ? ocupados : []))
      .catch(() => setHorariosOcupados([]))
      .finally(() => setLoadingSlots(false));
    return () => controller.abort();
  }, [novoAgendamento.data, novoAgendamento.servico]);


  const loadAgendamentos = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setLoadingAg(true);
    try {
      const data = await apiGetAgendamentos(token);
      setAgendamentos(data);
    } catch {
      setErrorAg("Não foi possível carregar os agendamentos.");
    } finally {
      setLoadingAg(false);
    }
  };


  const loadPets = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const data = await apiGetPets(token);
      setPets(data);
    } catch {
      // silencioso — pets vazios apenas
    }
  };


  const abrirDetalhe = (servico) => {
    setServicoSelecionado(servico);
    setTela("detalhe");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleAgendeJa = () => {
    if (!isLogado) {
      setServicoPendente(servicoSelecionado);
      setAbaAtiva("login");
      return;
    }
    setNovoAgendamento({ ...AGENDAMENTO_VAZIO, servico: servicoSelecionado.id });
    setTela("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleAgendamentoSubmit = async (e) => {
    e.preventDefault();
    setErrorAg(""); setFeedbackAg("");
    const { petId, servico, data, horario } = novoAgendamento;
    if (!petId || !servico || !data || !horario) {
      setErrorAg("Preencha todos os campos obrigatórios."); return;
    }
    const token = localStorage.getItem("authToken");
    const petSelecionado = pets.find((p) => p.id === petId);
    try {
      await apiCreateAgendamento(token, { ...novoAgendamento, nomeCachorro: petSelecionado?.nome || "" });
      await loadAgendamentos();
      setFeedbackAg("Agendamento criado com sucesso!");
      setNovoAgendamento(AGENDAMENTO_VAZIO);
      setTimeout(() => { setTela("servicos"); setFeedbackAg(""); }, 2000);
    } catch {
      setErrorAg("Não foi possível criar o agendamento.");
    }
  };


  const handleRacaChange = (val) => {
    setRacaInput(val);
    setNovoPet((p) => ({ ...p, raca: val }));
    if (val.length < 1) { setRacaSugestoes([]); return; }
    setRacaSugestoes(RACAS.filter((r) => r.toLowerCase().startsWith(val.toLowerCase())).slice(0, 6));
  };


  const selecionarRaca = (raca) => {
    setRacaInput(raca); setNovoPet((p) => ({ ...p, raca })); setRacaSugestoes([]);
  };


  const toggleVacina = (id) => {
    setNovoPet((p) => ({
      ...p,
      vacinas: p.vacinas.includes(id) ? p.vacinas.filter((v) => v !== id) : [...p.vacinas, id],
    }));
  };


  const handlePetSubmit = async (e) => {
    e.preventDefault();
    setErrorPet(""); setFeedbackPet("");
    const { nome, idade, peso, raca } = novoPet;
    if (!nome || !idade || !peso || !raca) { setErrorPet("Preencha todos os campos obrigatórios."); return; }

    const token = localStorage.getItem("authToken");
    setLoadingPet(true);
    try {
      const petCriado = await apiCreatePet(token, novoPet);
      setPets((prev) => [...prev, petCriado]);
      setFeedbackPet(`${nome} cadastrado com sucesso!`);
      setNovoPet(PET_VAZIO); setRacaInput("");
      setTimeout(() => { setShowPetForm(false); setFeedbackPet(""); }, 1800);
    } catch {
      setErrorPet("Não foi possível cadastrar o pet.");
    } finally {
      setLoadingPet(false);
    }
  };


  // ─── TELA 1: Grid de serviços ───────────────────────────────────────────────
  if (tela === "servicos") return (
    <section className="ag-page">
      <div className="ag-hero">
        <span className="badge">Nossos Serviços</span>
        <h2 className="page-title" style={{ marginTop: 10 }}>O que podemos fazer pelo seu pet?</h2>
        <p className="ag-hero-sub">Escolha um serviço para ver mais detalhes e agendar.</p>
      </div>

      <div className="ag-servicos-grid">
        {SERVICOS.map((s) => (
          <button key={s.id} className="ag-servico-card" onClick={() => abrirDetalhe(s)}>
            <div className="ag-servico-img-wrap">
              <img src={s.img} alt={s.label} className="ag-servico-img"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
              <div className="ag-servico-emoji-placeholder" style={{ display: "none" }}>{s.emoji}</div>
            </div>
            <div className="ag-servico-body">
              <h3 className="ag-servico-title">{s.label}</h3>
              <p className="ag-servico-resumo">{s.resumo}</p>
              <span className="ag-servico-cta">Ver detalhes →</span>
            </div>
          </button>
        ))}
      </div>

      {isLogado && agendamentos.length > 0 && (
        <div className="ag-meus-agendamentos">
          <div className="list-header">
            <h3 className="section-title" style={{ marginBottom: 0 }}>Meus agendamentos</h3>
            <span className="badge badge-green">
              {agendamentos.length} {agendamentos.length === 1 ? "agendamento" : "agendamentos"}
            </span>
          </div>
          {agendamentos.map((a) => <AgendamentoCard key={a.id} a={a} />)}
        </div>
      )}
    </section>
  );


  // ─── TELA 2: Detalhe ────────────────────────────────────────────────────────
  if (tela === "detalhe" && servicoSelecionado) return (
    <section className="ag-page">
      <button className="ag-back-btn" onClick={() => setTela("servicos")}>← Voltar aos serviços</button>
      <div className="ag-detalhe-card">
        <div className="ag-detalhe-img-col">
          <img src={servicoSelecionado.img} alt={servicoSelecionado.label} className="ag-detalhe-img"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
          <div className="ag-detalhe-img-fallback"><span>{servicoSelecionado.emoji}</span></div>
        </div>
        <div className="ag-detalhe-text-col">
          <span className="badge">{servicoSelecionado.label}</span>
          <h2 className="page-title" style={{ marginTop: 12 }}>{servicoSelecionado.resumo}</h2>
          <p className="ag-detalhe-desc">{servicoSelecionado.descricao}</p>
          <button className="primary-button ag-agende-btn" onClick={handleAgendeJa}>🗓 Agende já</button>
          {!isLogado && <p className="ag-login-hint">Você precisará fazer login para finalizar o agendamento.</p>}
        </div>
      </div>
    </section>
  );


  // ─── TELA 3: Formulário ─────────────────────────────────────────────────────
  if (tela === "form") {
    const servicoAtual = SERVICOS.find((s) => s.id === novoAgendamento.servico);
    const usaSlots = SERVICOS_COM_SLOTS.includes(novoAgendamento.servico);
    const slots = usaSlots ? gerarSlots(novoAgendamento.servico) : [];

    return (
      <section className="ag-page">
        <button className="ag-back-btn" onClick={() => setTela("detalhe")}>← Voltar ao serviço</button>
        <div className="ag-form-wrap">
          <div className="ag-form-header">
            <span className="badge">{servicoAtual?.label}</span>
            <h2 className="page-title" style={{ marginTop: 10 }}>Confirmar agendamento</h2>
            <p className="section-text">Olá, <strong>{user?.nome}</strong>! Escolha o pet e o horário.</p>
          </div>

          {errorAg && <p className="form-error">{errorAg}</p>}
          {feedbackAg && <p className="form-success">{feedbackAg}</p>}

          <form className="ag-form-card" onSubmit={handleAgendamentoSubmit}>

            {/* Pet */}
            <div className="form-group">
              <label className="form-label">Qual pet vai ser atendido?</label>
              <div className="ag-pet-grid">
                {pets.map((pet) => (
                  <button key={pet.id} type="button"
                    className={`ag-pet-chip ${novoAgendamento.petId === pet.id ? "ag-pet-chip-active" : ""}`}
                    onClick={() => setNovoAgendamento((p) => ({ ...p, petId: pet.id }))}>
                    🐶 {pet.nome}
                  </button>
                ))}
                <button type="button" className="ag-pet-chip ag-pet-chip-add" onClick={() => setShowPetForm(true)}>
                  + Cadastrar pet
                </button>
              </div>
            </div>

            {/* Cadastro de pet */}
            {showPetForm && (
              <div className="ag-pet-form-box">
                <div className="ag-pet-form-header">
                  <h4 className="section-title" style={{ marginBottom: 0 }}>Cadastrar novo pet</h4>
                  <button type="button" className="ag-pet-form-close"
                    onClick={() => { setShowPetForm(false); setErrorPet(""); }}>✕</button>
                </div>
                {errorPet && <p className="form-error">{errorPet}</p>}
                {feedbackPet && <p className="form-success">{feedbackPet}</p>}
                <div className="ag-pet-form-row">
                  <div className="form-group">
                    <label className="form-label">Nome do pet</label>
                    <input className="form-input" placeholder="Ex: Rex" value={novoPet.nome}
                      onChange={(e) => setNovoPet((p) => ({ ...p, nome: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Idade (anos)</label>
                    <input className="form-input" type="number" min="1" placeholder="Ex: 3" value={novoPet.idade}
                      onChange={(e) => setNovoPet((p) => ({ ...p, idade: e.target.value }))} />
                  </div>
                </div>
                <div className="ag-pet-form-row">
                  <div className="form-group">
                    <label className="form-label">Peso (kg)</label>
                    <input className="form-input" type="number" min="0" step="0.1" placeholder="Ex: 12.5" value={novoPet.peso}
                      onChange={(e) => setNovoPet((p) => ({ ...p, peso: e.target.value }))} />
                  </div>
                  <div className="form-group" ref={racaRef} style={{ position: "relative" }}>
                    <label className="form-label">Raça</label>
                    <input className="form-input" placeholder="Ex: Golden Retriever" value={racaInput}
                      onChange={(e) => handleRacaChange(e.target.value)} autoComplete="off" />
                    {racaSugestoes.length > 0 && (
                      <ul className="ag-autocomplete">
                        {racaSugestoes.map((r) => (
                          <li key={r} className="ag-autocomplete-item" onMouseDown={() => selecionarRaca(r)}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Vacinação</label>
                  <div className="ag-vacinas-grid">
                    {VACINAS.map((v) => (
                      <label key={v.id} className="ag-vacina-check">
                        <input type="checkbox" checked={novoPet.vacinas.includes(v.id)} onChange={() => toggleVacina(v.id)} />
                        <span className="ag-vacina-label">{v.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="button" className="primary-button full-width-button" onClick={handlePetSubmit} disabled={loadingPet}>
                  {loadingPet ? "Cadastrando..." : "Cadastrar pet"}
                </button>
              </div>
            )}

            {/* Data */}
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" className="form-input" value={novoAgendamento.data}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setNovoAgendamento((p) => ({ ...p, data: e.target.value, horario: "" }))} required />
            </div>

            {/* Horário — TimePicker para banho/tosa/banho_tosa, time input para os demais */}
            {usaSlots ? (
              <div className="form-group">
                <label className="form-label">
                  Horário
                  {loadingSlots && <span style={{ marginLeft: 8, fontSize: 12, color: "var(--muted)" }}>carregando...</span>}
                </label>
                {!novoAgendamento.data ? (
                  <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Selecione uma data primeiro.</p>
                ) : (
                  <TimePicker
                    slots={slots}
                    value={novoAgendamento.horario}
                    onChange={(slot) => setNovoAgendamento((p) => ({ ...p, horario: slot }))}
                    horariosOcupados={horariosOcupados}
                    disabled={loadingSlots}
                  />
                )}
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Horário</label>
                <input type="time" className="form-input" value={novoAgendamento.horario}
                  onChange={(e) => setNovoAgendamento((p) => ({ ...p, horario: e.target.value }))} required />
              </div>
            )}

            {/* Observações */}
            <div className="form-group">
              <label className="form-label">Observações (opcional)</label>
              <textarea className="form-input" rows={3} placeholder="Alguma instrução especial?"
                value={novoAgendamento.observacoes}
                onChange={(e) => setNovoAgendamento((p) => ({ ...p, observacoes: e.target.value }))} />
            </div>

            <button type="submit" className="primary-button full-width-button">🗓 Confirmar agendamento</button>
          </form>
        </div>
      </section>
    );
  }

  return null;
}


function AgendamentoCard({ a }) {
  return (
    <div className="agendamento-card">
      <div className="agendamento-card-header">
        <h4 className="agendamento-card-title">🐶 {a.nomeCachorro}</h4>
        <span className="badge badge-green">{servicoLabel[a.servico] || a.servico}</span>
      </div>
      <div className="agendamento-info-group">
        <strong>{new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR")}</strong>
        <span className="agendamento-info-item">🕐 <strong>{a.horario}</strong></span>
      </div>
      {a.observacoes && <div className="agendamento-obs">💬 {a.observacoes}</div>}
    </div>
  );
}


export default Agendamentos;