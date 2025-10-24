import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

interface HeaderProps {
  // adicione props se precisar
}

const Header: React.FC<HeaderProps> = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <article className="header__logo">
          <Link to="/" className="header__logo__link">
            <img src={logo} alt="reconecta Kabam" />
          </Link>
        </article>

        {location.pathname !== "/login" && (
          <>
            {/* Hamburger Button - só aparece em mobile */}
            <button
              className="hamburger-menu"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Navigation Menu */}
            <ul className={`nav ${isMenuOpen ? "nav--open" : ""}`}>
              <li className="nav__menu__list__item">
                <Link
                  className="nav__menu__list__item__link"
                  to="/KanbanBoard"
                  onClick={closeMenu}
                >
                  Kanban
                </Link>
              </li>

              <li className="nav__menu__list__item">
                <Link
                  to="/criar-ocorrencia"
                  className="nav__menu__list__item__link"
                  onClick={closeMenu}
                >
                  Criar Ocorrência
                </Link>
              </li>

              <li className="nav__menu__list__item">
                <Link
                  to="/listar-ocorrencias"
                  className="nav__menu__list__item__link"
                  onClick={closeMenu}
                >
                  Todas as ocorrências
                </Link>
              </li>

              <li className="nav__menu__list__item">
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="nav__menu__list__item__link"
                  style={{
                    cursor: "pointer",
                  }}
                >
                  Sair
                </button>
              </li>
            </ul>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;