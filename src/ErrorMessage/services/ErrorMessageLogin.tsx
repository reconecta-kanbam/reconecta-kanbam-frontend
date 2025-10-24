import React from 'react';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  type = 'error', 
  onClose,
  className = '' 
}) => {
  if (!message) return null;

  const iconClasses = {
    error: 'bx bx-error-circle',
    warning: 'bx bx-error',
    info: 'bx bx-info-circle',
    success: 'bx bx-check-circle'
  };

  return (
    <div className={`error-message ${type} ${className}`}>
      <i className={`icon ${iconClasses[type]}`}></i>
      
      <div className="message-content">
        {message}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Fechar mensagem"
        >
          <i className="bx bx-x"></i>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
