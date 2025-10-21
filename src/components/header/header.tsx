import React from 'react';
import  { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

interface HeaderProps {
  // adicione props se precisar
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <>
       <header className="header">
            <div className="container">
                <article className="header__logo">
                    <Link to="/" className="header__logo__link"><img src={logo} alt="reconecta Kabam" /></Link>
                </article>

                <ul className="nav">
                    <li className="nav__menu__list__item">
                        <Link className="nav__menu__list__item__link" to="/KanbanBoard">
                            kanbam
                        </Link>
                    </li>

                    <li className="nav__menu__list__item">
                        <Link className="nav__menu__list__item__link" to="/">
                            Login
                        </Link>
                    </li>
                </ul>
            </div>
        </header>
    </>
  );
};

export default Header;