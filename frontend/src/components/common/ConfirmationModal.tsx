import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import globals from '../../styles/globals.module.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}: ConfirmationModalProps) {
  if (!isOpen) return null;
    return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '28rem',
        width: '100%'
      }}>
        <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
            {variant === 'danger' && <AlertTriangle size={20} className={`${globals.textDanger}`} />}
            <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>{title}</h2>
          </div>
          <button 
            onClick={onCancel}
            style={{
              padding: '8px',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p className={`${globals.textMuted} ${globals.mb6}`}>
          {message}
        </p>

        <div className={`${globals.flex} ${globals.gap3} ${globals.justifyEnd}`}>
          <button 
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              background: 'transparent'
            }}
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              backgroundColor: variant === 'danger' ? 'var(--danger)' : 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}