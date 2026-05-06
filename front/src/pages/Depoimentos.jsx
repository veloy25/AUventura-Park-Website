import "../styles/Depoimentos.css";

function Depoimentos({
  showForm,
  setShowForm,
  formError,
  feedbackMessage,
  loadingDepoimentos,
  depoimentos,
  newDepoimento,
  handleDepoimentoChange,
  handleDepoimentoSubmit,
}) {
  return (
    <section className="depoimentos-page">
      <div className="depoimentos-header">
        <h2 className="depoimentos-title">Depoimentos</h2>

        <button
          className="depoimentos-button"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? "Fechar formulário" : "Adicionar depoimento"}
        </button>
      </div>

      {showForm && (
        <section className="depoimentos-form-card">
          <h3 className="depoimentos-card-title">Novo Depoimento</h3>

          {formError && <p className="depoimentos-error">{formError}</p>}
          {feedbackMessage && (
            <p className="depoimentos-success">{feedbackMessage}</p>
          )}

          <form onSubmit={handleDepoimentoSubmit} className="depoimentos-form">
            <div className="depoimentos-form-group">
              <label htmlFor="nomeCachorro" className="depoimentos-label">
                Nome do cachorro:
              </label>

              <input
                id="nomeCachorro"
                name="nomeCachorro"
                className="depoimentos-input"
                value={newDepoimento.nomeCachorro}
                onChange={handleDepoimentoChange}
                required
              />
            </div>

            <div className="depoimentos-form-group">
              <label htmlFor="nomeTutor" className="depoimentos-label">
                Nome do tutor:
              </label>

              <input
                id="nomeTutor"
                name="nomeTutor"
                className="depoimentos-input"
                value={newDepoimento.nomeTutor}
                onChange={handleDepoimentoChange}
                required
              />
            </div>

            <div className="depoimentos-form-group">
              <label htmlFor="raca" className="depoimentos-label">
                Raça do cachorro:
              </label>

              <input
                id="raca"
                name="raca"
                className="depoimentos-input"
                value={newDepoimento.raca}
                onChange={handleDepoimentoChange}
                required
              />
            </div>

            <div className="depoimentos-form-group">
              <label htmlFor="comentario" className="depoimentos-label">
                Comentário:
              </label>

              <textarea
                id="comentario"
                name="comentario"
                className="depoimentos-input depoimentos-textarea"
                value={newDepoimento.comentario}
                onChange={handleDepoimentoChange}
                rows={4}
                required
              />
            </div>

            <button type="submit" className="depoimentos-button depoimentos-full-button">
              Enviar depoimento
            </button>
          </form>
        </section>
      )}

      <section className="depoimentos-list">
        {loadingDepoimentos && (
          <p className="depoimentos-text">Carregando depoimentos...</p>
        )}

        {formError && !showForm && (
          <p className="depoimentos-error">{formError}</p>
        )}

        {!loadingDepoimentos && depoimentos.length === 0 && (
          <p className="depoimentos-text">
            Ainda não há depoimentos cadastrados. Seja o primeiro a contribuir!
          </p>
        )}

        {depoimentos.map((depoimento) => (
          <div key={depoimento.id} className="depoimento-card">
            <h3 className="depoimentos-card-title">
              {depoimento.nomeCachorro}
            </h3>

            <div className="depoimento-info-group">
              <p className="depoimentos-text">
                <strong>Tutor:</strong> {depoimento.nomeTutor}
              </p>

              <p className="depoimentos-text">
                <strong>Raça:</strong> {depoimento.raca}
              </p>

              <p className="depoimentos-text">
                <strong>Enviado em:</strong>{" "}
                {new Date(depoimento.criado_em).toLocaleDateString()}
              </p>
            </div>

            <div className="depoimento-comment-box">
              <p className="depoimento-comment-title">Comentário:</p>
              <p className="depoimento-comment-text">
                {depoimento.comentario}
              </p>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}

export default Depoimentos;