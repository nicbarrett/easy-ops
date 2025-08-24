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

  const confirmButtonClass = variant === 'danger' 
    ? `${globals.bgDanger} ${globals.textPrimary}` 
    : `${globals.bgPrimary} ${globals.textPrimary}`;

  return (
    <div className={`${globals.fixed} ${globals.inset0} ${globals.bgBlackOpacity50} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.p4} ${globals.zIndex50}`}>
      <div className={`${globals.bgPrimary} ${globals.rounded} ${globals.p6} ${globals.maxWMd} ${globals.wFull}`}>
        <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
            {variant === 'danger' && <AlertTriangle size={20} className={`${globals.textDanger}`} />}
            <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>{title}</h2>
          </div>
          <button 
            onClick={onCancel}
            className={`${globals.p2} ${globals.textMuted} ${globals.rounded} ${globals.transition}`}
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
            className={`${globals.px4} ${globals.py2} ${globals.border} ${globals.rounded} ${globals.textMuted}`}
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            className={`${globals.px4} ${globals.py2} ${confirmButtonClass} ${globals.rounded}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}