import React, { useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ModalHeaderProps {
  title?: string;
  showCloseButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalContext = createContext<{ onClose: () => void } | null>(null);

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  size = 'md',
  className,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div
        data-testid="modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleBackdropClick}
      >
        <div
          data-testid="modal-content"
          className={cn('bg-white dark:bg-slate-950 rounded-lg shadow-xl mx-4 w-full', sizeStyles[size], className)}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  showCloseButton = false,
  children,
  className,
}) => {
  const context = useContext(ModalContext);
  const onClose = context?.onClose;

  return (
    <div
      className={cn('flex items-center justify-between p-6 border-b border-gray-200', className)}
    >
      <div className="flex-1">
        {title && <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>}
        {children}
      </div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export const ModalContent: React.FC<ModalContentProps> = ({ children, className }) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn('flex items-center justify-end gap-3 p-6 border-t border-gray-200', className)}
    >
      {children}
    </div>
  );
};
