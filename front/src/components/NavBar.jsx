import { useState, useRef, useEffect } from "react";
import "../styles/Navbar.css";

function AvatarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="14" fill="#f0e8d8" />
      <circle cx="14" cy="11" r="4.5" fill="#c4956a" />
      <path d="M4 24c0-5.523 4.477-8 10-8s10 2.477 10 8" fill="#c4956a" />
    </svg>
  );
}

function Navbar({ isLogado, abaAtiva, setAbaAtiva, handleLogout }) {
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const wrapperRef = useRef(null);

  const cls = (aba) => `nav-button${abaAtiva === aba ? " nav-button-active" : ""}`;

  // fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogin = () => {
    setDropdownAberto(false);
    setAbaAtiva("login");
  };

  const handleSair = () => {
    setDropdownAberto(false);
    handleLogout();
  };

  return (
    <nav className="nav">
      <button className={cls("home")} onClick={() => setAbaAtiva("home")}>Home</button>

      {isLogado && (
        <button className={cls("mypet")} onClick={() => setAbaAtiva("mypet")}>My Pet</button>
      )}

      <button className={cls("agendamentos")} onClick={() => setAbaAtiva("agendamentos")}>
        Agendamentos
      </button>

      <button className={cls("depoimentos")} onClick={() => setAbaAtiva("depoimentos")}>
        Depoimentos
      </button>

      <button
        className={`${cls("contato")} nav-button-contato`}
        onClick={() => setAbaAtiva("contato")}
      >
        Contato
      </button>

      <div className="avatar-wrapper" ref={wrapperRef}>
        <button
          className={`avatar-btn${dropdownAberto ? " avatar-btn-active" : ""}`}
          aria-label="Menu do usuário"
          onClick={() => setDropdownAberto((v) => !v)}
        >
          <AvatarIcon />
        </button>

        {dropdownAberto && (
          <div className="avatar-dropdown-inner">
            {isLogado ? (
              <button className="dropdown-item dropdown-item-sair" onClick={handleSair}>
                Sair
              </button>
            ) : (
              <button className="dropdown-item" onClick={handleLogin}>
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;