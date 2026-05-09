import { useEffect, useState } from "react";
import "./styles/global.css";
import { apiGetMe } from "./services/authService";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Depoimentos from "./pages/Depoimentos";
import Agendamentos from "./pages/Agendamentos";
import Contato from "./pages/Contato";
import MyPet from "./pages/MyPet";
import Daycare from "./pages/Daycare";

function App() {
  const [abaAtiva, setAbaAtiva] = useState("home");
  const [isLogado, setIsLogado] = useState(false);
  const [user, setUser] = useState(null);
  const [servicoPendente, setServicoPendente] = useState(null);
  const [daycareAtivo, setDaycareAtivo] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    apiGetMe(token)
      .then((data) => {
        setUser(data.user);
        setIsLogado(true);
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
      });
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLogado(true);
    setAbaAtiva(servicoPendente ? "agendamentos" : "mypet");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
    setIsLogado(false);
    setAbaAtiva("home");
    setDaycareAtivo(false);
  };

  return (
    <div className="page">
      <Header
        isLogado={isLogado}
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        handleLogout={handleLogout}
      />

      <main className="main">
        {abaAtiva === "home" && (
          <Home setAbaAtiva={setAbaAtiva} />
        )}

        {abaAtiva === "login" && !isLogado && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}

        {abaAtiva === "mypet" && isLogado && (
          <MyPet user={user} />
        )}

        {abaAtiva === "depoimentos" && (
          <Depoimentos isLogado={isLogado} user={user} />
        )}

        {abaAtiva === "contato" && (
          <Contato />
        )}

        {abaAtiva === "agendamentos" && !daycareAtivo && (
          <Agendamentos
            isLogado={isLogado}
            user={user}
            setAbaAtiva={setAbaAtiva}
            servicoPendente={servicoPendente}
            setServicoPendente={setServicoPendente}
            setDaycareAtivo={setDaycareAtivo}
          />
        )}

        {abaAtiva === "agendamentos" && daycareAtivo && (
          <Daycare
            user={user}
            onVoltar={() => setDaycareAtivo(false)}
            onSuccess={() => setDaycareAtivo(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;