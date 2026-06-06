import { useState, useEffect } from "react";
import {
  apiGetNotificacoes,
  apiMarcarNotificacaoComoLida,
  apiExcluirNotificacao
} from "../services/notificacoesService";
import "../styles/Notificacoes.css";

function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetNotificacoes(token);
      setNotificacoes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      setFeedback("");
      setError(null);
      await apiMarcarNotificacaoComoLida(token, id);
      await carregarNotificacoes();
      window.dispatchEvent(new CustomEvent("notificacoes-updated"));
      setFeedback("Notificação marcada como lida.");
    } catch (err) {
      setError("Erro ao marcar como lida: " + err.message);
    }
  };

  const confirmarExclusao = (id) => {
    setConfirmDeleteId(id);
    setFeedback("");
    setError(null);
  };

  const excluirNotificacao = async () => {
    const token = localStorage.getItem("authToken");
    try {
      await apiExcluirNotificacao(token, confirmDeleteId);
      setConfirmDeleteId(null);
      await carregarNotificacoes();
      window.dispatchEvent(new CustomEvent("notificacoes-updated"));
      setFeedback("Notificação excluída com sucesso.");
    } catch (err) {
      setConfirmDeleteId(null);
      setError("Erro ao excluir: " + err.message);
    }
  };

  if (loading) return <div className="notificacoes-loading">Carregando notificações...</div>;

  return (
    <section className="notificacoes-page">
      <div className="notificacoes-header">
        <h2>Notificações</h2>
        <p>Acompanhe as novidades e atualizações da AUventura Park</p>
      </div>

      {/* Feedback e erro inline — sem alert() */}
      {feedback && <p className="form-success">{feedback}</p>}
      {error && <p className="form-error">{error}</p>}

      {/* Modal de confirmação de exclusão — sem confirm() */}
      {confirmDeleteId && (
        <div className="confirm-modal">
          <p>Tem certeza que deseja excluir esta notificação?</p>
          <div className="confirm-modal-actions">
            <button className="btn-excluir" onClick={excluirNotificacao}>
              Sim, excluir
            </button>
            <button className="secondary-button" onClick={() => setConfirmDeleteId(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="notificacoes-list">
        {notificacoes.length === 0 ? (
          <div className="notificacoes-empty">
            <div className="empty-icon">🔔</div>
            <p>Você não tem notificações no momento.</p>
          </div>
        ) : (
          notificacoes.map((notif) => (
            <div
              key={notif.id}
              className={`notificacao-item ${notif.lida ? "lida" : "nao-lida"}`}
            >
              <div className="notificacao-content">
                <div className="notificacao-header">
                  <h4>{notif.titulo}</h4>
                  <span className="notificacao-tipo">{notif.tipo}</span>
                </div>
                <p className="notificacao-mensagem">{notif.mensagem}</p>
                <small className="notificacao-data">
                  {new Date(notif.criado_em).toLocaleString("pt-BR")}
                </small>
              </div>
              <div className="notificacao-actions">
                {!notif.lida && (
                  <button
                    className="btn-marcar-lida"
                    onClick={() => marcarComoLida(notif.id)}
                  >
                    Marcar como lida
                  </button>
                )}
                <button
                  className="btn-excluir"
                  onClick={() => confirmarExclusao(notif.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Notificacoes;