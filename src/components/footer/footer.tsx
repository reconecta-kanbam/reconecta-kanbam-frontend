import React from 'react';

interface FooterProps {
  // adicione props se precisar
}

const Footer: React.FC<FooterProps> = () => {
  return (
    <>
      <footer className="footer">
            <div className="container">
              <p>Reconecta kanban – 2025 © Todos os direitos reservados</p>
            </div>
        </footer>
    </>
  );
};

export default Footer;