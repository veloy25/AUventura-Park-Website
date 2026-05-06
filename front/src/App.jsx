import { useEffect, useState } from "react";
import "./styles/global.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Depoimentos from "./pages/Depoimentos";
import Agendamentos from "./pages/Agendamentos";
import MyPet from "./pages/MyPet";

function App() {
  const [abaAtiva, setAbaAtiva] = useState("home");
  const [isLogado, setIsLogado] = useState(false);
  const [user, setUser] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [depoimentos, setDepoimentos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingDepoimentos, setLoadingDepoimentos] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [agendamentos, setAgendamentos] = useState([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(false);
  const [agendamentoError, setAgendamentoError] = useState("");
  const [agendamentoFeedback, setAgendamentoFeedback] = useState("");

  const [novoAgendamento, setNovoAgendamento] = useState({
    nomeCachorro: "",
    servico: "",
    data: "",
    horario: "",
    observacoes: "",
  });

  const [newDepoimento, setNewDepoimento] = useState({
    nomeCachorro: "",
    nomeTutor: "",
    raca: "",
    comentario: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) return;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Token inválido");

        const data = await response.json();

        setUser(data.user);
        setIsLogado(true);
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setUser(null);
        setIsLogado(false);
      }
    };

    loadProfile();
  }, []);

  const loadDepoimentos = async () => {
    setLoadingDepoimentos(true);
    setFormError("");

    try {
      const response = await fetch("/api/depoimentos");

      if (!response.ok) throw new Error("Falha ao buscar depoimentos");

      const data = await response.json();
      setDepoimentos(data);
    } catch {
      setFormError(
        "Não foi possível carregar os depoimentos. Tente novamente mais tarde."
      );
    } finally {
      setLoadingDepoimentos(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === "depoimentos") {
      loadDepoimentos();
    }
  }, [abaAtiva]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    setAuthError("");
    setFeedbackMessage("");
    setAuthLoading(true);

    if (!authEmail || !authPassword || (authMode === "signup" && !authName)) {
      setAuthError("Preencha todos os campos obrigatórios.");
      setAuthLoading(false);
      return;
    }

    try {
      const endpoint = authMode === "login" ? "/api/login" : "/api/signup";

      const payload =
        authMode === "login"
          ? { email: authEmail, senha: authPassword }
          : { nome: authName, email: authEmail, senha: authPassword };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody.error || "Falha na autenticação.");
      }

      if (authMode === "signup") {
        setFeedbackMessage("Conta criada com sucesso. Faça login para continuar.");
        setAuthMode("login");
        setAuthName("");
      } else {
        localStorage.setItem("authToken", responseBody.token);
        localStorage.setItem("authUser", JSON.stringify(responseBody.user));

        setUser(responseBody.user);
        setIsLogado(true);
        setAbaAtiva("mypet");
      }

      setAuthEmail("");
      setAuthPassword("");
    } catch (error) {
      setAuthError(error.message || "Erro ao autenticar. Tente novamente.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    setUser(null);
    setIsLogado(false);
    setAbaAtiva("home");

    setAuthMode("login");
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
    setFeedbackMessage("");

    setAgendamentos([]);
    setAgendamentoError("");
    setAgendamentoFeedback("");
  };

  const handleDepoimentoChange = (event) => {
    const { name, value } = event.target;

    setNewDepoimento((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleDepoimentoSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setFeedbackMessage("");

    const { nomeCachorro, nomeTutor, raca, comentario } = newDepoimento;

    if (!nomeCachorro || !nomeTutor || !raca || !comentario) {
      setFormError("Preencha todos os campos antes de enviar.");
      return;
    }

    try {
      const response = await fetch("/api/depoimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDepoimento),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Falha ao enviar depoimento.");
      }

      await loadDepoimentos();

      setFeedbackMessage("Depoimento enviado com sucesso!");
      setShowForm(false);

      setNewDepoimento({
        nomeCachorro: "",
        nomeTutor: "",
        raca: "",
        comentario: "",
      });
    } catch {
      setFormError("Não foi possível enviar o depoimento. Tente novamente.");
    }
  };

  const loadAgendamentos = async () => {
    setLoadingAgendamentos(true);
    setAgendamentoError("");

    const token = localStorage.getItem("authToken");

    if (!token) {
      setAgendamentoError("Você precisa fazer login para ver seus agendamentos.");
      setLoadingAgendamentos(false);
      return;
    }

    try {
      const response = await fetch("/api/agendamentos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Falha ao buscar agendamentos.");
      }

      const data = await response.json();
      setAgendamentos(data);
    } catch {
      setAgendamentoError("Não foi possível carregar os agendamentos.");
    } finally {
      setLoadingAgendamentos(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === "agendamentos" && isLogado) {
      loadAgendamentos();
    }
  }, [abaAtiva, isLogado]);

  const handleAgendamentoChange = (event) => {
    const { name, value } = event.target;

    setNovoAgendamento((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAgendamentoSubmit = async (event) => {
    event.preventDefault();

    setAgendamentoError("");
    setAgendamentoFeedback("");

    const { nomeCachorro, servico, data, horario } = novoAgendamento;

    if (!nomeCachorro || !servico || !data || !horario) {
      setAgendamentoError("Preencha todos os campos obrigatórios.");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      setAgendamentoError("Você precisa fazer login para criar um agendamento.");
      return;
    }

    try {
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoAgendamento),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Falha ao criar agendamento.");
      }

      await loadAgendamentos();

      setAgendamentoFeedback("Agendamento criado com sucesso!");

      setNovoAgendamento({
        nomeCachorro: "",
        servico: "",
        data: "",
        horario: "",
        observacoes: "",
      });
    } catch {
      setAgendamentoError("Não foi possível criar o agendamento.");
    }
  };

  return (
    <div className="page">
      <Header
        isLogado={isLogado}
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        handleLogout={handleLogout}
        setAuthMode={setAuthMode}
        setAuthError={setAuthError}
        setFeedbackMessage={setFeedbackMessage}
      />

      <main className="main">
        {abaAtiva === "home" && <Home />}

        {abaAtiva === "login" && !isLogado && (
          <Login
            authMode={authMode}
            setAuthMode={setAuthMode}
            authName={authName}
            setAuthName={setAuthName}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authError={authError}
            feedbackMessage={feedbackMessage}
            authLoading={authLoading}
            handleAuthSubmit={handleAuthSubmit}
            setAuthError={setAuthError}
            setFeedbackMessage={setFeedbackMessage}
          />
        )}

        {abaAtiva === "mypet" && isLogado && <MyPet user={user} />}

        {abaAtiva === "depoimentos" && (
          <Depoimentos
            showForm={showForm}
            setShowForm={setShowForm}
            formError={formError}
            feedbackMessage={feedbackMessage}
            loadingDepoimentos={loadingDepoimentos}
            depoimentos={depoimentos}
            newDepoimento={newDepoimento}
            handleDepoimentoChange={handleDepoimentoChange}
            handleDepoimentoSubmit={handleDepoimentoSubmit}
          />
        )}

        {abaAtiva === "agendamentos" && (
          <Agendamentos
            isLogado={isLogado}
            user={user}
            setAbaAtiva={setAbaAtiva}
            setAuthMode={setAuthMode}
            agendamentos={isLogado ? agendamentos : []}
            novoAgendamento={novoAgendamento}
            handleAgendamentoChange={handleAgendamentoChange}
            handleAgendamentoSubmit={handleAgendamentoSubmit}
            agendamentoError={agendamentoError}
            agendamentoFeedback={agendamentoFeedback}
            loadingAgendamentos={isLogado ? loadingAgendamentos : false}
          />
        )}
      </main>
    </div>
  );
}

export default App;