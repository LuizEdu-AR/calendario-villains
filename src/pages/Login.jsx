import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firebaseConfigured } from '../services/firebase';

export default function Login() {
  const { user, isAdmin, loading, login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user && isAdmin) return <Navigate to="/admin" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(id, password);
      navigate('/admin');
    } catch {
      setError('Não foi possível entrar. Confira suas credenciais.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen"><div className="auth-card"><Link to="/" className="back-link"><span className="back-circle">←</span><span>Voltar ao calendário</span></Link><img src="/logo-3d.png" alt="Villains" className="login-logo" /><h1>Acesso administrativo</h1><p className="muted">Entre com sua conta autorizada para gerenciar a agenda.</p>{!firebaseConfigured && <p className="notice error">Configure o Firebase no arquivo .env antes de utilizar o login.</p>}{error && <p className="notice error">{error}</p>}{user && !isAdmin && !loading && <p className="notice error">Esta conta não possui permissão administrativa.</p>}<form onSubmit={submit} className="form-stack"><label>ID<input type="text" inputMode="numeric" pattern="[0-9]+" required value={id} onChange={(e) => setId(e.target.value)} placeholder="Seu ID" /></label><label>Senha<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" /></label><button className="button primary full" disabled={!firebaseConfigured || busy}>{busy ? 'Entrando...' : 'Entrar'}</button></form></div></div>
  );
}
