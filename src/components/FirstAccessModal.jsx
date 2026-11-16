import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { completeFirstAccess } from '../services/adminService';

export default function FirstAccessModal() {
  const { user, profile, changePassword, refreshProfile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!profile?.firstAccessPending || dismissed) return null;

  async function finish(change) {
    setError('');
    if (change && (password.length < 6 || password !== confirm)) {
      setError('A senha deve ter pelo menos 6 caracteres e coincidir com a confirmação.');
      return;
    }
    setBusy(true);
    try {
      if (change) await changePassword(password);
      await completeFirstAccess(user.uid);
      await refreshProfile();
      setDismissed(true);
    } catch {
      setError('Não foi possível concluir. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="editor-modal" role="dialog" aria-modal="true" aria-label="Primeiro acesso">
        <h2>Bem-vindo à Villains!</h2>
        <p className="muted">Este é seu primeiro acesso. Você pode alterar sua senha provisória agora ou depois.</p>
        {error && <p className="notice error">{error}</p>}
        <div className="form-stack">
          <label>Nova senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <label>Confirmar nova senha<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>
          <div className="modal-actions">
            <button className="button subtle" disabled={busy} onClick={() => finish(false)}>Agora não</button>
            <button className="button primary" disabled={busy} onClick={() => finish(true)}>Atualizar senha</button>
          </div>
        </div>
      </div>
    </div>
  );
}
