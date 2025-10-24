import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

interface HeaderProps {
  // adicione props se precisar
}

const Header: React.FC<HeaderProps> = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <article className="header__logo">
            <Link to="/" className="header__logo__link">
              <img src={logo} alt="reconecta Kabam" />
            </Link>
          </article>

          <ul className="nav">
            <li className="nav__menu__list__item">
              <Link className="nav__menu__list__item__link" to="/KanbanBoard">
                kanban
              </Link>
            </li>

            <li className="nav__menu__list__item">
              <Link
                to="/criar-ocorrencia"
                className="nav__menu__list__item__link"
              >
                Criar Ocorrência
              </Link>
            </li>

            <li className="nav__menu__list__item">
              <Link
                to="/listar-ocorrencias"
                className="nav__menu__list__item__link"
              >
                Todas as ocorrências
              </Link>
            </li>

            <li className="nav__menu__list__item">
              <button
                onClick={handleLogout}
                className="nav__menu__list__item__link"
                style={{
                  cursor: "pointer",
                }}
              >
                Sair
              </button>
            </li>
          </ul>
        </div>
      </header>
    </>
  );
};

export default Header;
