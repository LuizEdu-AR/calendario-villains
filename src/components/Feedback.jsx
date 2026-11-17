import { useEffect } from 'react';

export function Toast({ message, tone = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4200);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return <div className={`villains-toast ${tone}`} role={tone === 'error' ? 'alert' : 'status'}><span className="toast-symbol">{tone === 'error' ? '!' : '✓'}</span><span>{message}</span><button type="button" aria-label="Fechar notificação" onClick={onClose}>×</button></div>;
}

export function ConfirmDialog({ title, description, confirmLabel = 'Confirmar', danger = false, busy = false, onCancel, onConfirm }) {
  useEffect(() => {
    const key = (e) => { if (e.key === 'Escape' && !busy) onCancel(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [busy, onCancel]);
  return <div className="modal-backdrop feedback-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}><div className="editor-modal confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><div className="editor-heading"><h2 id="confirm-title">{title}</h2><button className="close-button" disabled={busy} onClick={onCancel} aria-label="Fechar">×</button></div><p id="confirm-description">{description}</p><div className="modal-actions"><button type="button" className="button subtle" disabled={busy} onClick={onCancel}>Cancelar</button><button type="button" className={`button ${danger ? 'confirm-danger' : 'primary'}`} disabled={busy} onClick={onConfirm}>{busy ? 'Aguarde...' : confirmLabel}</button></div></div></div>;
}
