import { useState } from "react";
import "../styles/Contato.css";

function Contato() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: "",
  });

  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((dadosAtuais) => ({
    ...dadosAtuais,
    [name]: value,
  }));

  if (enviado) {
    setEnviado(false);
  }

  if (erro) {
    setErro("");
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  setCarregando(true);
  setEnviado(false);
  setErro("");

  try {
    const response = await fetch("/api/contatos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível enviar a mensagem.");
    }

    setEnviado(true);

    setForm({
      nome: "",
      email: "",
      telefone: "",
      assunto: "",
      mensagem: "",
    });
  } catch (error) {
    setErro(
      error.message ||
        "Não foi possível enviar a mensagem. Tente novamente mais tarde."
    );
  } finally {
    setCarregando(false);
  }
};

  return (
    <div className="contato-page">
      <section className="contato-hero">
        <div className="contato-hero-content">
          <span className="badge">Atendimento</span>

          <h1>Fale com a AUventura Park</h1>

          <p>
            Tem alguma dúvida sobre nossos serviços, agendamentos ou cuidados
            com seu pet? Nossa equipe está pronta para ajudar você.
          </p>
        </div>

        <div className="contato-hero-paw">🐾</div>
      </section>

      <section className="contato-grid">
        <div className="contato-info">
          <h2>Estamos pertinho de você</h2>

          <p>
            Entre em contato pelos nossos canais de atendimento ou envie uma
            mensagem pelo formulário. Vamos responder o mais rápido possível.
          </p>

          <div className="contato-cards">
            <div className="contato-card">
              <span className="contato-icon">📞</span>
              <div>
                <h3>WhatsApp</h3>
                <p>(11) 99999-9999</p>
              </div>
            </div>

            <div className="contato-card">
              <span className="contato-icon">✉️</span>
              <div>
                <h3>E-mail</h3>
                <p>contato@auventurapark.com</p>
              </div>
            </div>

            <div className="contato-card">
              <span className="contato-icon">📍</span>
              <div>
                <h3>Localização</h3>
                <p>São Paulo - SP</p>
              </div>
            </div>

            <div className="contato-card">
              <span className="contato-icon">🕒</span>
              <div>
                <h3>Horário</h3>
                <p>Segunda a sábado, das 8h às 18h</p>
              </div>
            </div>
          </div>
        </div>

        <form className="contato-form section-card" onSubmit={handleSubmit}>
          <h2>Envie uma mensagem</h2>

          <p>
            Conte para a gente como podemos ajudar no cuidado do seu melhor
            amigo.
          </p>

          {enviado && (
            <div className="contato-sucesso">
              Mensagem enviada com sucesso! Em breve entraremos em contato.
            </div>
          )}

          {erro && (
            <div className="contato-erro">
              {erro}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="nome">
              Nome
            </label>
            <input
              className="form-input"
              id="nome"
              name="nome"
              type="text"
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              E-mail
            </label>
            <input
              className="form-input"
              id="email"
              name="email"
              type="email"
              placeholder="seuemail@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="telefone">
              Telefone
            </label>
            <input
              className="form-input"
              id="telefone"
              name="telefone"
              type="text"
              placeholder="(11) 99999-9999"
              value={form.telefone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="assunto">
              Assunto
            </label>
            <input
              className="form-input"
              id="assunto"
              name="assunto"
              type="text"
              placeholder="Ex: dúvida sobre daycare"
              value={form.assunto}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mensagem">
              Mensagem
            </label>
            <textarea
              className="form-input"
              id="mensagem"
              name="mensagem"
              placeholder="Digite sua mensagem..."
              value={form.mensagem}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="primary-button full-width-button"
            type="submit"
            disabled={carregando}
          >
            {carregando ? "Enviando..." : "🐶 Enviar mensagem"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Contato;