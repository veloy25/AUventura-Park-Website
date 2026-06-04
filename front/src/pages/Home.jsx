import "../styles/Home.css";

function Home({ setAbaAtiva}) {
  const handleAgendar = () => setAbaAtiva("agendamentos");
  const handleDepoimentos = () => setAbaAtiva("depoimentos");

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-paw-deco">🐾</div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-dot" />
            São Paulo
          </div>
          <h1 className="hero-title">
            O melhor <em>lar temporário</em> do seu cão
          </h1>
          <p className="hero-desc">
            Na AUventura Park, seu pet é tratado como família. Segurança, socialização e carinho em cada momento do dia.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={handleAgendar}>
              🗓 Agendar agora
            </button>
            <button className="hero-btn-secondary" onClick={handleDepoimentos}>
              Ver depoimentos
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-icon">🐶</div>
          <div className="stat-number">200+</div>
          <div className="stat-label">Cães atendidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">4.9</div>
          <div className="stat-label">Avaliação média</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-number">5/7</div>
          <div className="stat-label">Dias na semana</div>
        </div>
      </div>

      {/* Services */}
      <section className="services-section">
        <div className="services-header">
          <div>
            <span className="badge">Serviços</span>
            <h2 className="section-heading" style={{ marginTop: 10 }}>Tudo que seu pet precisa</h2>
          </div>
          <p>Escolha o serviço ideal e agende com poucos cliques.</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <span className="service-emoji">🏡</span>
            <div className="service-name">Daycare</div>
            <p className="service-desc">Seu cão passa o dia se divertindo com outros pets em ambiente seguro e supervisionado.</p>
          </div>
          <div className="service-card">
            <span className="service-emoji">🛁</span>
            <div className="service-name">Banho & Tosa</div>
            <p className="service-desc">Banho, secagem e tosa profissional com produtos pet-friendly de qualidade.</p>
          </div>
          <div className="service-card">
            <span className="service-emoji">🎓</span>
            <div className="service-name">Adestramento</div>
            <p className="service-desc">Sessões individuais com adestrador certificado para desenvolver obediência e boas maneiras.</p>
          </div>
          <div className="service-card">
            <span className="service-emoji">🤸</span>
            <div className="service-name">Socialização</div>
            <p className="service-desc">Atividades em grupo para desenvolver habilidades sociais e gastar energia de forma saudável.</p>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="why-section">
        <div className="why-inner">
          <div className="why-content">
            <h2>Por que escolher a AUventura Park?</h2>
            <p>Somos especialistas em bem-estar animal. Nossa equipe é treinada para cuidar do seu pet com segurança e afeto.</p>
            <ul className="why-list">
              <li><span className="why-check">✓</span> Espaço amplo e higienizado diariamente</li>
              <li><span className="why-check">✓</span> Monitoramento em tempo real</li>
              <li><span className="why-check">✓</span> Equipe certificada em primeiros socorros</li>
              <li><span className="why-check">✓</span> Relatório diário de atividades</li>
              <li><span className="why-check">✓</span> Ambiente separado por porte</li>
            </ul>
          </div>
          <div className="why-visual">
            <img
              src="/why-image.jpg"
              alt="Cuidado com amor na AUventura Park"
              className="why-img"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Pronto para dar o primeiro passo?</h2>
        <p>Agende uma visita gratuita e conheça nosso espaço com o seu pet.</p>
        <button className="hero-btn-primary" onClick={handleAgendar}>
          🗓 Fazer meu primeiro agendamento
        </button>
      </section>
    </div>
  );
}

export default Home;