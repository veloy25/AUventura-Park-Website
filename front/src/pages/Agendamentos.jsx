import "../styles/Agendamentos.css";

function Agendamentos({
  isLogado,
  user,
  setAbaAtiva,
  setAuthMode,
  agendamentos,
  novoAgendamento,
  handleAgendamentoChange,
  handleAgendamentoSubmit,
  agendamentoError,
  agendamentoFeedback,
  loadingAgendamentos,
}) {
  const abrirLogin = () => {
    setAuthMode("login");
    setAbaAtiva("login");
  };

  return (
    <section className="agendamentos-page">
      <div className="agendamentos-header">
        <h2 className="page-title">Agendamentos</h2>
      </div>

      {!isLogado && (
        <section className="agendamento-alert-card">
          <h3 className="section-title">Faça login para agendar</h3>

          <p className="section-text">
            Para criar ou visualizar seus agendamentos, você precisa entrar na
            sua conta de tutor.
          </p>

          <button className="primary-button" onClick={abrirLogin}>
            Fazer login
          </button>
        </section>
      )}

      {isLogado && (
        <>
          <section className="agendamento-form-card">
            <h3 className="section-title">
              Novo agendamento para {user?.nome || "Tutor"}
            </h3>

            {agendamentoError && (
              <p className="form-error">{agendamentoError}</p>
            )}

            {agendamentoFeedback && (
              <p className="form-success">{agendamentoFeedback}</p>
            )}

            <form
              className="agendamento-form"
              onSubmit={handleAgendamentoSubmit}
            >
              <div className="agendamento-form-group">
                <label htmlFor="nomeCachorro" className="agendamento-label">
                  Nome do cachorro:
                </label>

                <input
                  id="nomeCachorro"
                  name="nomeCachorro"
                  className="agendamento-input"
                  value={novoAgendamento.nomeCachorro}
                  onChange={handleAgendamentoChange}
                  required
                />
              </div>

              <div className="agendamento-form-group">
                <label htmlFor="servico" className="agendamento-label">
                  Serviço:
                </label>

                <select
                  id="servico"
                  name="servico"
                  className="agendamento-input"
                  value={novoAgendamento.servico}
                  onChange={handleAgendamentoChange}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  <option value="daycare">Daycare</option>
                  <option value="banho">Banho</option>
                  <option value="banho_tosa">Banho e tosa</option>
                  <option value="hospedagem">Hospedagem</option>
                </select>
              </div>

              <div className="agendamento-form-row">
                <div className="agendamento-form-group">
                  <label htmlFor="data" className="agendamento-label">
                    Data:
                  </label>

                  <input
                    id="data"
                    name="data"
                    type="date"
                    className="agendamento-input"
                    value={novoAgendamento.data}
                    onChange={handleAgendamentoChange}
                    required
                  />
                </div>

                <div className="agendamento-form-group">
                  <label htmlFor="horario" className="agendamento-label">
                    Horário:
                  </label>

                  <input
                    id="horario"
                    name="horario"
                    type="time"
                    className="agendamento-input"
                    value={novoAgendamento.horario}
                    onChange={handleAgendamentoChange}
                    required
                  />
                </div>
              </div>

              <div className="agendamento-form-group">
                <label htmlFor="observacoes" className="agendamento-label">
                  Observações:
                </label>

                <textarea
                  id="observacoes"
                  name="observacoes"
                  className="agendamento-input agendamento-textarea"
                  value={novoAgendamento.observacoes}
                  onChange={handleAgendamentoChange}
                  rows={4}
                />
              </div>

              <button type="submit" className="primary-button full-width-button">
                Criar agendamento
              </button>
            </form>
          </section>

          <section className="agendamentos-list">
            <h3 className="section-title">Meus agendamentos</h3>

            {loadingAgendamentos && (
              <p className="section-text">Carregando agendamentos...</p>
            )}

            {!loadingAgendamentos && agendamentos.length === 0 && (
              <p className="section-text">
                Você ainda não possui agendamentos cadastrados.
              </p>
            )}

            {agendamentos.map((agendamento) => (
              <div key={agendamento.id} className="agendamento-card">
                <h4 className="agendamento-card-title">
                  {agendamento.nomeCachorro}
                </h4>

                <div className="agendamento-info-group">
                  <p className="section-text">
                    <strong>Serviço:</strong> {agendamento.servico}
                  </p>

                  <p className="section-text">
                    <strong>Data:</strong>{" "}
                    {new Date(agendamento.data).toLocaleDateString()}
                  </p>

                  <p className="section-text">
                    <strong>Horário:</strong> {agendamento.horario}
                  </p>
                </div>

                {agendamento.observacoes && (
                  <div className="agendamento-observacao-box">
                    <p className="agendamento-observacao-title">
                      Observações:
                    </p>

                    <p className="agendamento-observacao-text">
                      {agendamento.observacoes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </section>
        </>
      )}
    </section>
  );
}

export default Agendamentos;