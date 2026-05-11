import { useState, useRef, useEffect } from "react";
import { apiGetNotificacoesNaoLidas } from "../services/notificacoesService";
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

function NotificationIcon({ count }) {
  return (
    <div className="notification-icon-wrapper">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C10.896 2 10 2.896 10 4V5.586L7.707 8.293C7.512 8.488 7.256 8.744 7.061 9.061L4.707 11.414C4.512 11.609 4.256 11.865 4.061 12.182V12.182C3.866 12.479 3.866 12.776 4.061 13.073L7.061 16.073C7.256 16.39 7.512 16.646 7.707 16.841L10 19.414V21C10 22.104 10.896 23 12 23C13.104 23 14 22.104 14 21V19.414L16.293 16.841C16.488 16.646 16.744 16.39 16.939 16.073L19.939 13.073C20.134 12.776 20.134 12.479 19.939 12.182V12.182C19.744 11.865 19.488 11.609 19.293 11.414L16.939 9.061C16.744 8.744 16.488 8.488 16.293 8.293L14 5.586V4C14 2.896 13.104 2 12 2Z" fill="currentColor"/>
        <circle cx="12" cy="9" r="3" fill="currentColor"/>
      </svg>
      {count > 0 && (
        <span className="notification-badge">{count > 99 ? '99+' : count}</span>
      )}
    </div>
  );
}

function Navbar({ isLogado, abaAtiva, setAbaAtiva, handleLogout }) {
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const wrapperRef = useRef(null);

  const cls = (aba) => `nav-button${abaAtiva === aba ? " nav-button-active" : ""}`;

  // Carregar notificações não lidas
  useEffect(() => {
    if (!isLogado) {
      setNotificacoesNaoLidas(0);
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      setNotificacoesNaoLidas(0);
      return;
    }

    const carregarNaoLidas = async () => {
      try {
        const data = await apiGetNotificacoesNaoLidas(token);
        setNotificacoesNaoLidas(data.length);
      } catch (err) {
        console.error("Erro ao carregar notificações não lidas:", err);
        setNotificacoesNaoLidas(0);
      }
    };

    carregarNaoLidas();

    // Escutar evento de atualização de notificações
    const handleNotificacoesUpdate = () => carregarNaoLidas();
    window.addEventListener('notificacoes-updated', handleNotificacoesUpdate);

    return () => {
      window.removeEventListener('notificacoes-updated', handleNotificacoesUpdate);
    };
  }, [isLogado]);

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

      {isLogado && (
        <button
          className="nav-notification-btn"
          onClick={() => setAbaAtiva("notificacoes")}
          aria-label="Notificações"
        >
          <NotificationIcon count={notificacoesNaoLidas} />
        </button>
      )}

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