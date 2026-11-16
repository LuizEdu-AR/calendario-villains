import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateAdministrator } from '../services/adminService';

export default function ProfileManager() {
  const { user, profile, changePassword, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [id, setId] = useState(profile?.id || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function perform(action, success) {
    setBusy(true);
    setMessage('');
    try {
      await action();
      setMessage(success);
    } catch (error) {
      setMessage(error.message || 'Não foi possível concluir.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="profile-manager">
    <p className="muted">Gerencie os dados da sua conta.</p>
    {message && <p className="notice" role="status">{message}</p>}
    <form className="form-stack profile-form" onSubmit={(event) => { event.preventDefault(); perform(async () => { await updateAdministrator({ uid: user.uid, name, id }); await refreshProfile(); }, 'Perfil atualizado.'); }}>
      <h3>Meus dados</h3>
      <label>ID<input required pattern="[0-9]+" inputMode="numeric" disabled={profile?.id === '194'} value={id} onChange={(event) => setId(event.target.value)} /></label>
      <label>Nome<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <button className="button subtle" disabled={busy}>Salvar dados</button>
    </form>
    <form className="form-stack profile-form profile-password" onSubmit={(event) => { event.preventDefault(); perform(async () => { await changePassword(password); setPassword(''); }, 'Senha atualizada.'); }}>
      <h3>Alterar minha senha</h3>
      <label>Nova senha<input type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button className="button subtle" disabled={busy}>Alterar senha</button>
      <p className="muted">O Firebase pode solicitar que você faça login novamente antes de alterar a senha.</p>
    </form>
  </div>;
}
