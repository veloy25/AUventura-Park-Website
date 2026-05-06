import "../styles/Login.css";

function Login({
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  feedbackMessage,
  authLoading,
  handleAuthSubmit,
  setAuthError,
  setFeedbackMessage,
}) {
  const isSignup = authMode === "signup";

  const trocarModo = () => {
    setAuthError("");
    setFeedbackMessage("");
    setAuthMode(isSignup ? "login" : "signup");
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <h2 className="section-title">
          {isSignup ? "Criar conta" : "Entrar"}
        </h2>

        <p className="login-description">
          {isSignup
            ? "Crie sua conta para acompanhar seu pet na AUventura Park."
            : "Entre na sua conta para acessar a Área do Tutor."}
        </p>

        {authError && <p className="form-error">{authError}</p>}

        {feedbackMessage && (
          <p className="form-success">{feedbackMessage}</p>
        )}

        <form className="login-form" onSubmit={handleAuthSubmit}>
          {isSignup && (
            <div className="login-form-group">
              <label htmlFor="authName" className="login-label">
                Nome:
              </label>

              <input
                id="authName"
                type="text"
                className="login-input"
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="login-form-group">
            <label htmlFor="authEmail" className="login-label">
              E-mail:
            </label>

            <input
              id="authEmail"
              type="email"
              className="login-input"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="authPassword" className="login-label">
              Senha:
            </label>

            <input
              id="authPassword"
              type="password"
              className="login-input"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button full-width-button"
            disabled={authLoading}
          >
            {authLoading
              ? "Carregando..."
              : isSignup
              ? "Criar conta"
              : "Entrar"}
          </button>
        </form>

        <button className="login-switch-button" onClick={trocarModo}>
          {isSignup
            ? "Já tenho conta. Fazer login"
            : "Ainda não tenho conta. Criar cadastro"}
        </button>
      </div>
    </section>
  );
}

export default Login;