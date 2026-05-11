import { useState, useEffect } from "react";
import {
  apiGetNotificacoes,
  apiGetNotificacoesNaoLidas,
  apiMarcarNotificacaoComoLida,
  apiExcluirNotificacao
} from "../services/notificacoesService";
import "../styles/Notificacoes.css";

function Notificacoes({ user }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;
    carregarNotificacoes();
  }, [token]);

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const data = await apiGetNotificacoes(token);
      setNotificacoes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id) => {
    try {
      await apiMarcarNotificacaoComoLida(token, id);
      // Recarregar notificações para refletir mudanças
      await carregarNotificacoes();
      // Notificar outros componentes sobre a mudança
      window.dispatchEvent(new CustomEvent('notificacoes-updated'));
    } catch (err) {
      alert("Erro ao marcar como lida: " + err.message);
    }
  };

  const excluirNotificacao = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta notificação?")) return;
    try {
      await apiExcluirNotificacao(token, id);
      // Recarregar notificações para refletir mudanças
      await carregarNotificacoes();
      // Notificar outros componentes sobre a mudança
      window.dispatchEvent(new CustomEvent('notificacoes-updated'));
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  if (loading) return <div className="notificacoes-loading">Carregando notificações...</div>;
  if (error) return <div className="notificacoes-error">Erro: {error}</div>;

  return (
    <section className="notificacoes-page">
      <div className="notificacoes-header">
        <h2>Notificações</h2>
        <p>Acompanhe as novidades e atualizações da AUventura Park</p>
      </div>

      <div className="notificacoes-list">
        {notificacoes.length === 0 ? (
          <div className="notificacoes-empty">
            <div className="empty-icon">🔔</div>
            <p>Você não tem notificações no momento.</p>
          </div>
        ) : (
          notificacoes.map((notif) => (
            <div key={notif.id} className={`notificacao-item ${notif.lida ? 'lida' : 'nao-lida'}`}>
              <div className="notificacao-content">
                <div className="notificacao-header">
                  <h4>{notif.titulo}</h4>
                  <span className="notificacao-tipo">{notif.tipo}</span>
                </div>
                <p className="notificacao-mensagem">{notif.mensagem}</p>
                <small className="notificacao-data">
                  {new Date(notif.criado_em).toLocaleString('pt-BR')}
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
                  onClick={() => excluirNotificacao(notif.id)}
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