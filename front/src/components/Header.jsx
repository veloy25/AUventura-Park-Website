import "../styles/Header.css";
import Navbar from "./NavBar";

function Header({ isLogado, abaAtiva, setAbaAtiva, handleLogout }) {
  return (
    <header className="header-area">
      <div className="header-inner">
        <div className="header-brand" onClick={() => setAbaAtiva("home")}>
          <img
            src="/logo.png"
            alt="AUventura Park"
            className="header-logo-img"
          />
          <div>
            <h1 className="logo">
              <span className="logo-au">AU</span>ventura Park
            </h1>
            <p className="subtitle">
              {isLogado
                ? "Área do Tutor"
                : "Cuidado para seu pet, tranquilidade para você!"}
            </p>
          </div>
        </div>

        <Navbar
          isLogado={isLogado}
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          handleLogout={handleLogout}
        />
      </div>
    </header>
  );
}

export default Header;