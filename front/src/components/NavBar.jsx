import "../styles/Navbar.css";

function AvatarIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14" r="14" fill="#e0d4f0" />
      <circle cx="14" cy="11" r="4.5" fill="#9e87bb" />
      <path d="M4 24c0-5.523 4.477-8 10-8s10 2.477 10 8" fill="#9e87bb" />
    </svg>
  );
}

function Navbar({
  isLogado,
  abaAtiva,
  setAbaAtiva,
  handleLogout,
  setAuthMode,
  setAuthError,
  setFeedbackMessage,
}) {
  const cls = (aba) =>
    `nav-button${abaAtiva === aba ? " nav-button-active" : ""}`;

  const limparMensagens = () => {
    setAuthMode("login");
    setAuthError("");
    setFeedbackMessage("");
  };

  const handleLogin = () => {
    limparMensagens();
    setAbaAtiva("login");
  };

  return (
    <nav className="nav">
      <button className={cls("home")} onClick={() => setAbaAtiva("home")}>
        Home
      </button>

      {isLogado && (
        <button className={cls("mypet")} onClick={() => setAbaAtiva("mypet")}>
          My Pet
        </button>
      )}

      <button
        className={cls("agendamentos")}
        onClick={() => setAbaAtiva("agendamentos")}
      >
        Agendamentos
      </button>

      <button
        className={cls("depoimentos")}
        onClick={() => {
          limparMensagens();
          setAbaAtiva("depoimentos");
        }}
      >
        Depoimentos
      </button>

      <div className="avatar-wrapper">
        <button className="avatar-btn" aria-label="Menu do usuário">
          <AvatarIcon />
        </button>

        <div className="avatar-dropdown">
          <div className="avatar-dropdown-inner">
            {isLogado ? (
              <button
                className="dropdown-item dropdown-item-sair"
                onClick={handleLogout}
              >
                Sair
              </button>
            ) : (
              <button className="dropdown-item" onClick={handleLogin}>
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;