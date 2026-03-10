import React, { useEffect, useRef, useCallback, createContext, useContext } from 'react';
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

const ModalContext = createContext<{ onClose: () => void; titleId: string; contentId: string } | null>(null);

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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = 'modal-title';
  const contentId = 'modal-content';

  // Store the element that triggered the modal and handle body scroll
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      // Focus the modal container after render
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Restore focus on close
  useEffect(() => {
    if (!open && previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [open]);

  // Keyboard handling: Escape and focus trapping
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable || document.activeElement === modalRef.current) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    },
    [onClose],
  );

  if (!open) return null;

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalContext.Provider value={{ onClose, titleId, contentId }}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        data-testid="modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleBackdropClick}
      >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={contentId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          data-testid="modal-content"
          className={cn('bg-white dark:bg-slate-950 rounded-lg shadow-xl mx-4 w-full focus:outline-none', sizeStyles[size], className)}
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
  const titleId = context?.titleId;

  return (
    <div
      className={cn('flex items-center justify-between p-6 border-b border-gray-200', className)}
    >
      <div className="flex-1">
        {title && <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>}
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
  const context = useContext(ModalContext);
  const contentId = context?.contentId;

  return <div id={contentId} className={cn('p-6', className)}>{children}</div>;
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
