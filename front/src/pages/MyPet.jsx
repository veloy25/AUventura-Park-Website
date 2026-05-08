import "../styles/MyPet.css";

function MyPet({ user }) {
  return (
    <section className="mypet-page">
      <div className="mypet-welcome">
        <div className="mypet-welcome-icon">🐾</div>
        <div className="mypet-welcome-text">
          <h2>Olá, {user?.nome || "Tutor"}!</h2>
          <p>Seja bem-vindo(a) à sua Área do Tutor. Aqui você acompanha tudo sobre o seu pet.</p>
        </div>
      </div>

      <div className="mypet-cards">
        <div className="mypet-info-card">
          <div className="card-icon">👤</div>
          <h4>Nome</h4>
          <p>{user?.nome || "—"}</p>
        </div>
        <div className="mypet-info-card">
          <div className="card-icon">📧</div>
          <h4>E-mail</h4>
          <p>{user?.email || "—"}</p>
        </div>
      </div>

      <div className="mypet-status">
        <div className="mypet-status-dot" />
        <p>Seu pet está aproveitando as atividades da AUventura Park!</p>
      </div>
    </section>
  );
}

export default MyPet;
