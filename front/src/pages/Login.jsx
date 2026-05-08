import { useState } from "react";
import { apiLogin, apiSignup } from "../services/authService";
import "../styles/Login.css";

function Login({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const isSignup = authMode === "signup";

  const trocarModo = () => {
    setAuthError("");
    setFeedbackMessage("");
    setAuthMode(isSignup ? "login" : "signup");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setFeedbackMessage("");
    setAuthLoading(true);

    if (!authEmail || !authPassword || (isSignup && !authName)) {
      setAuthError("Preencha todos os campos obrigatórios.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isSignup) {
        await apiSignup(authName, authEmail, authPassword);
        setFeedbackMessage("Conta criada com sucesso. Faça login para continuar.");
        setAuthMode("login");
        setAuthName("");
      } else {
        const data = await apiLogin(authEmail, authPassword);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        onLoginSuccess(data.user); // avisa o App
      }
      setAuthEmail("");
      setAuthPassword("");
    } catch (error) {
      setAuthError(error.message || "Erro ao autenticar. Tente novamente.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-split">
        <div className="login-deco">
          <div className="login-deco-paw">🐾</div>
          <div className="login-deco-text">
            <h3>Bem-vindo de volta!</h3>
            <p>Acesse sua área do tutor e acompanhe cada momento do seu pet.</p>
          </div>
        </div>

        <div className="login-panel">
          <p className="login-eyebrow">{isSignup ? "Cadastro" : "Login"}</p>
          <h2>{isSignup ? "Crie sua conta" : "Entre na sua conta"}</h2>
          <p className="login-description">
            {isSignup
              ? "Crie sua conta para acompanhar seu pet na AUventura Park."
              : "Entre para acessar a Área do Tutor."}
          </p>

          {authError && <p className="form-error">{authError}</p>}
          {feedbackMessage && <p className="form-success">{feedbackMessage}</p>}

          <form className="login-form" onSubmit={handleAuthSubmit}>
            {isSignup && (
              <div className="form-group">
                <label htmlFor="authName" className="form-label">Nome</label>
                <input
                  id="authName" type="text" className="form-input"
                  value={authName} onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Seu nome completo" required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="authEmail" className="form-label">E-mail</label>
              <input
                id="authEmail" type="email" className="form-input"
                value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="seu@email.com" required
              />
            </div>

            <div className="form-group">
              <label htmlFor="authPassword" className="form-label">Senha</label>
              <input
                id="authPassword" type="password" className="form-input"
                value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••" required
              />
            </div>

            <button type="submit" className="primary-button full-width-button" disabled={authLoading} style={{ marginTop: 8 }}>
              {authLoading ? "Carregando..." : isSignup ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <div className="login-switch">
            {isSignup ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
            <button className="login-switch-btn" onClick={trocarModo}>
              {isSignup ? "Fazer login" : "Criar cadastro"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;