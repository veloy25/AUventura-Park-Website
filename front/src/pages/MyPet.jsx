import "../styles/MyPet.css";

function MyPet({ user }) {
  return (
    <section className="mypet-card">
      <h2 className="mypet-title">Olá, {user?.nome || "Tutor"}!</h2>

      <p className="mypet-text">
        Você está logado como <strong>{user?.email}</strong>.
      </p>

      <p className="mypet-text">
        Aqui você poderá acompanhar a rotina do seu pet, verificar agendamentos
        e ver fotos das atividades diárias.
      </p>

      <div className="mypet-status-box">
        <p className="mypet-status-title">Status de hoje:</p>

        <p className="mypet-status-text">
          Seu pet está aproveitando as atividades da AUventura Park!
        </p>
      </div>
    </section>
  );
}

export default MyPet;