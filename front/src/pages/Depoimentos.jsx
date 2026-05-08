import { useState, useEffect } from "react";
import { apiGetDepoimentos, apiCreateDepoimento } from "../services/depoimentosService";
import { apiGetPets } from "../services/petsService";
import "../styles/Depoimentos.css";

const DEPOIMENTO_VAZIO = {
  nomeCachorro: "",
  nomeTutor: "",
  raca: "",
  comentario: "",
};

function Depoimentos({ isLogado, user }) {
  const [depoimentos, setDepoimentos] = useState([]);
  const [newDepoimento, setNewDepoimento] = useState(DEPOIMENTO_VAZIO);
  const [pets, setPets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadDepoimentos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetDepoimentos();
      setDepoimentos(data);
    } catch {
      setError("Não foi possível carregar os depoimentos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Carrega pets do usuário logado para preencher o formulário
  const loadPets = async () => {
    if (!isLogado) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const data = await apiGetPets(token);
      setPets(data);
    } catch {
      // silencioso — pets são opcionais no depoimento
    }
  };

  useEffect(() => {
    loadDepoimentos();
  }, []);

  // Quando abre o formulário, preenche nome do tutor e carrega pets
  useEffect(() => {
    if (showForm) {
      setNewDepoimento((prev) => ({
        ...prev,
        nomeTutor: user?.nome || "",
      }));
      loadPets();
    }
  }, [showForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDepoimento((prev) => ({ ...prev, [name]: value }));
  };

  // Ao selecionar um pet, preenche nome e raça automaticamente
  const handlePetSelect = (e) => {
    const petId = e.target.value;
    if (!petId) {
      setNewDepoimento((prev) => ({ ...prev, nomeCachorro: "", raca: "" }));
      return;
    }
    const pet = pets.find((p) => String(p.id) === petId);
    if (pet) {
      setNewDepoimento((prev) => ({
        ...prev,
        nomeCachorro: pet.nome,
        raca: pet.raca,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    const { nomeCachorro, nomeTutor, raca, comentario } = newDepoimento;
    if (!nomeCachorro || !nomeTutor || !raca || !comentario) {
      setError("Preencha todos os campos antes de enviar.");
      return;
    }

    try {
      await apiCreateDepoimento(newDepoimento);
      await loadDepoimentos();
      setFeedback("Depoimento enviado com sucesso!");
      setShowForm(false);
      setNewDepoimento(DEPOIMENTO_VAZIO);
    } catch {
      setError("Não foi possível enviar o depoimento. Tente novamente.");
    }
  };

  return (
    <section className="depoimentos-page">
      <div className="depoimentos-page-header">
        <div>
          <span className="badge">Comunidade</span>
          <h2 className="page-title" style={{ marginTop: 10 }}>Depoimentos</h2>
          <p>Veja o que os tutores falam sobre a AUventura Park.</p>
        </div>
        <button
          className={showForm ? "secondary-button" : "primary-button"}
          onClick={() => setShowForm((c) => !c)}
        >
          {showForm ? "✕ Fechar" : "✍️ Deixar depoimento"}
        </button>
      </div>

      {showForm && (
        <div className="depoimentos-form-card">
          <h3 className="section-title">Conte sua experiência</h3>

          {error && <p className="form-error">{error}</p>}
          {feedback && <p className="form-success">{feedback}</p>}

          <form className="depoimentos-form" onSubmit={handleSubmit}>

            {/* Se logado e tem pets, mostra seletor; senão, campos manuais */}
            {isLogado && pets.length > 0 ? (
              <div className="form-group">
                <label className="form-label">Escolha o pet</label>
                <select className="form-input" onChange={handlePetSelect} defaultValue="">
                  <option value="">Selecione um pet...</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — {p.raca}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="depoimentos-form-row">
                <div className="form-group">
                  <label htmlFor="nomeCachorro" className="form-label">Nome do cachorro</label>
                  <input id="nomeCachorro" name="nomeCachorro" className="form-input"
                    placeholder="Ex: Bolinha" value={newDepoimento.nomeCachorro}
                    onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="raca" className="form-label">Raça</label>
                  <input id="raca" name="raca" className="form-input"
                    placeholder="Ex: Golden Retriever" value={newDepoimento.raca}
                    onChange={handleChange} required />
                </div>
              </div>
            )}

            {/* Nome do tutor — preenchido automaticamente se logado */}
            <div className="form-group">
              <label htmlFor="nomeTutor" className="form-label">Seu nome (tutor)</label>
              <input id="nomeTutor" name="nomeTutor" className="form-input"
                placeholder="Ex: Maria Silva"
                value={newDepoimento.nomeTutor}
                onChange={handleChange}
                readOnly={!!user?.nome}
                style={user?.nome ? { background: "var(--cream)", cursor: "not-allowed" } : {}}
                required />
            </div>

            <div className="form-group">
              <label htmlFor="comentario" className="form-label">Comentário</label>
              <textarea id="comentario" name="comentario" className="form-input"
                placeholder="Conte como foi a experiência do seu pet..."
                value={newDepoimento.comentario}
                onChange={handleChange} rows={4} required />
            </div>

            <button type="submit" className="primary-button full-width-button">
              Enviar depoimento
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p>Carregando depoimentos...</p>
        </div>
      )}

      {!loading && depoimentos.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🐾</div>
          <p>Ainda não há depoimentos. Seja o primeiro a contribuir!</p>
        </div>
      )}

      {!loading && depoimentos.length > 0 && (
        <div className="depoimentos-grid">
          {depoimentos.map((d) => (
            <div key={d.id} className="depoimento-card">
              <div className="depoimento-card-top">
                <div className="depoimento-avatar">🐶</div>
                <div className="depoimento-meta">
                  <h3>{d.nomeCachorro}</h3>
                  <p>{d.raca} · Tutor: {d.nomeTutor}</p>
                </div>
              </div>
              {/*<div className="stars">★★★★★</div>*/}
              <div className="depoimento-quote">{d.comentario}</div>
              <span className="depoimento-date">
                📅 {new Date(d.criado_em).toLocaleDateString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Depoimentos;