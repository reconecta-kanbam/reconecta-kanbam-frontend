import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Settings, LogOut, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/icons/logo-reconecta.png";

interface HeaderProps {
  // adicione props se precisar
}

const Header: React.FC<HeaderProps> = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // Recupera dados do usuário do token
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData({
          id: payload.sub,
          nome: payload.nome || payload.email?.split("@")[0] || "Usuário",
          email: payload.email,
          perfil: payload.perfil,
        });
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
  }, [location.pathname]); // Adiciona location.pathname como dependência

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Função para pegar as iniciais do nome
  const getInitials = (name: string): string => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Função para gerar cor baseada no nome
  const getAvatarColor = (name: string): string => {
    if (!name) return "#4c010c";
    const colors = [
      "#4c010c", // vermelho principal
      "#dc2626", // vermelho
      "#ea580c", // laranja
      "#d97706", // amarelo escuro
      "#059669", // verde
      "#0891b2", // ciano
      "#2563eb", // azul
      "#7c3aed", // roxo
      "#db2777", // rosa
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const canManageUsers = userData?.perfil === "ADMIN" || userData?.perfil === "GESTOR";

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
                  to="/workflows"
                  onClick={closeMenu}
                >
                  Workflows
                </Link>
              </li>

              <li className="nav__menu__list__item">
                <Link
                  to="/occurrence"
                  className="nav__menu__list__item__link"
                  onClick={closeMenu}
                >
                  Ocorrências
                </Link>
              </li>

              <li className="nav__menu__list__item">
                <Link
                  to="/logs"
                  className="nav__menu__list__item__link"
                  onClick={closeMenu}
                >
                  Logs
                </Link>
              </li>

              <li className="nav__menu__list__item">
                <Link
                  to="/setores"
                  className="nav__menu__list__item__link"
                  onClick={closeMenu}
                >
                  Setores
                </Link>
              </li>

              {/* User Dropdown */}
              <li className="nav__menu__list__item relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="nav__menu__list__item__link flex items-center gap-3"
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar com iniciais */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                      style={{ backgroundColor: getAvatarColor(userData?.nome || "U") }}
                    >
                      {getInitials(userData?.nome || "Usuário")}
                    </div>
                    <span className="hidden md:inline">{userData?.nome || "Usuário"}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`hidden md:inline transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                    {/* Header do dropdown com avatar maior */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                          style={{ backgroundColor: getAvatarColor(userData?.nome || "U") }}
                        >
                          {getInitials(userData?.nome || "Usuário")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userData?.nome}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{userData?.email}</p>
                        </div>
                      </div>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-[#4c010c] text-white rounded">
                        {userData?.perfil}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {canManageUsers && (
                        <button
                          onClick={() => {
                            navigate("/users");
                            setIsDropdownOpen(false);
                            closeMenu();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Users size={16} className="text-gray-500" />
                          Usuários
                        </button>
                      )}

                      <button
                        onClick={() => {
                          navigate("/settings");
                          setIsDropdownOpen(false);
                          closeMenu();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <Settings size={16} className="text-gray-500" />
                        Configurações
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;