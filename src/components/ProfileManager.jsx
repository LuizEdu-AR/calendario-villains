import { Toast } from './Feedback';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateAdministrator } from '../services/adminService';

export default function ProfileManager() {
  const { user, profile, changePassword, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [id, setId] = useState(profile?.id || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('success');

  async function perform(action, success) {
    setBusy(true);
    setMessage('');
    try {
      await action();
      setMessageTone('success');
      setMessage(success);
    } catch (error) {
      setMessageTone('error');
      setMessage(error.message || 'Não foi possível concluir.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="profile-manager">
    <p className="muted">Gerencie os dados da sua conta.</p>
    <Toast message={message} tone={messageTone} onClose={() => setMessage('')} />
    <form className="form-stack profile-form" onSubmit={(event) => { event.preventDefault(); perform(async () => { await updateAdministrator({ uid: user.uid, name, id }); await refreshProfile(); }, 'Perfil atualizado.'); }}>
      <h3>Meus dados</h3>
      <label>ID<input required pattern="[0-9]+" inputMode="numeric" disabled={profile?.id === '194'} value={id} onChange={(event) => setId(event.target.value)} /></label>
      <label>Nome<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <button className="button subtle" disabled={busy}>Salvar dados</button>
    </form>
    <form className="form-stack profile-form profile-password" onSubmit={(event) => { event.preventDefault(); if (password !== confirmPassword || password.length < 6) return; perform(async () => { await changePassword(password); setPassword(''); setConfirmPassword(''); setShowPassword(false); setShowConfirmPassword(false); }, 'Senha atualizada.'); }}>
      <h3>Alterar minha senha</h3>
      <label>Nova senha<span className="password-input-wrap"><input type={showPassword ? 'text' : 'password'} minLength={6} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="password-visibility-toggle" aria-label={showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
      <label>Confirmar nova senha<span className="password-input-wrap"><input type={showConfirmPassword ? 'text' : 'password'} minLength={6} required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><button type="button" className="password-visibility-toggle" aria-label={showConfirmPassword ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
      {confirmPassword && password !== confirmPassword && <p className="profile-password-error" role="alert">As senhas não coincidem.</p>}
      <button className="button subtle" disabled={busy || password.length < 6 || password !== confirmPassword}>Alterar senha</button>
    </form>
  </div>;
}
