import { useEffect, useRef } from 'react';
import { SPRING } from '../constants';

/**
 * Custom Modal component with backdrop blur and animations.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 *   title: string,
 *   description: string,
 *   confirmText?: string,
 *   isDanger?: boolean
 * }} props
 */
export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  isDanger = false
}) {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      
      // Auto-focus the modal container or first button
      const focusable = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    } else {
      document.body.style.overflow = 'unset';
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-[440px] p-10 bg-[var(--color-surface)] border border-[var(--color-border)] animate-scaleIn shadow-2xl"
        style={{ borderRadius: 32, boxShadow: "0 24px 64px -12px rgba(0,0,0,0.24)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-[24px] font-semibold text-[var(--color-heading)] mb-4" style={{ letterSpacing: "-0.025em" }}>
          {title}
        </h2>
        <div className="text-[14px] text-[var(--color-muted)] leading-relaxed mb-8">
          {description}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 h-12 text-[14px] font-medium rounded-2xl bg-[var(--color-raised)] text-[var(--color-heading)] hover:opacity-80 active:scale-[0.98]"
            style={{ transition: SPRING }}
          >
            {onConfirm ? 'Cancel' : 'Close'}
          </button>
          {onConfirm && (
            <button 
              onClick={onConfirm}
              className={`flex-1 h-12 text-[14px] font-semibold rounded-2xl text-white active:scale-[0.98] ${
                isDanger ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-accent)]'
              }`}
              style={{ 
                transition: SPRING,
                boxShadow: isDanger 
                  ? '0 4px 14px -4px rgba(239, 68, 68, 0.4)' 
                  : '0 4px 14px -4px rgba(10, 10, 10, 0.5)'
              }}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
