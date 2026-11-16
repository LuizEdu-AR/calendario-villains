import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { createAdministrator, removeAdministrator, updateAdministrator } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

export default function AdminManager() {
  const { user, changePassword } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => onSnapshot(collection(db, 'admins'), (snapshot) => {
    setAdmins(snapshot.docs.map((entry) => ({ uid: entry.id, ...entry.data() })));
  }), []);

  async function run(action, success) {
    setBusy(true);
    setMessage('');
    try { await action(); setMessage(success); }
    catch (error) { setMessage(error.message || 'Não foi possível concluir.'); }
    finally { setBusy(false); }
  }

  async function submit(event) {
    event.preventDefault();
    await run(async () => {
      if (editing) await updateAdministrator({ uid: editing.uid, name });
      else await createAdministrator({ id, name, password });
      setId(''); setName(''); setPassword(''); setEditing(null);
    }, editing ? 'Administrador atualizado.' : 'Administrador cadastrado.');
  }

  return (
    <div className="admin-manager">
      <h3>Administradores</h3>
      <p className="muted">Somente administradores podem gerenciar estas contas.</p>
      {message && <p className="notice">{message}</p>}
      <form className="form-stack" onSubmit={submit}>
        <label>ID<input value={id} disabled={Boolean(editing)} inputMode="numeric" pattern="[0-9]+" required onChange={(event) => setId(event.target.value)} /></label>
        <label>Nome<input value={name} required onChange={(event) => setName(event.target.value)} /></label>
        {!editing && <label>Senha provisória<input type="password" minLength={6} value={password} required onChange={(event) => setPassword(event.target.value)} /></label>}
        <div className="item-actions">
          <button disabled={busy} type="submit">{editing ? 'Salvar alterações' : 'Cadastrar administrador'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setId(''); setName(''); }}>Cancelar</button>}
        </div>
      </form>
      <div className="admin-items admin-list-users">
        {admins.map((admin) => <article className="admin-item" key={admin.uid}>
          <div className="admin-item-main"><h3>{admin.name}</h3><p>ID: {admin.id}{admin.uid === user.uid ? ' · Você' : ''}</p></div>
          <div className="item-actions">
            <button onClick={() => { setEditing(admin); setId(admin.id); setName(admin.name); }}>Editar</button>
            {admin.uid !== user.uid && <button className="danger-text" disabled={busy} onClick={() => { if (window.confirm(`Remover ${admin.name}?`)) run(() => removeAdministrator(admin.uid), 'Administrador removido.'); }}>Excluir</button>}
          </div>
        </article>)}
      </div>
      <form className="form-stack admin-password-form" onSubmit={(event) => { event.preventDefault(); run(async () => { await changePassword(newPassword); setNewPassword(''); }, 'Sua senha foi atualizada.'); }}>
        <h3>Alterar minha senha</h3>
        <label>Nova senha<input type="password" minLength={6} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
        <button className="button subtle" disabled={busy}>Alterar senha</button>
        <p className="muted">Por segurança, o Firebase pode solicitar novo login antes de alterar uma senha antiga.</p>
      </form>
    </div>
  );
}
