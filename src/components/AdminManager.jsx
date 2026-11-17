import { Toast } from './Feedback';
import { useEffect, useState } from 'react';
import { createAdministrator, listAdministrators, removeAdministrator, updateAdministrator } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

const blank = { id: '', name: '', password: '' };

export default function AdminManager() {
  const { user, profile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('success');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  async function refresh() {
    try {
      const result = await listAdministrators();
      setIsOwner(result.isOwner === true);
      setAdmins(result.admins.sort((a, b) => Number(a.id !== '194') - Number(b.id !== '194') || a.name.localeCompare(b.name)));
    } catch (error) {
      setMessageTone('error');
      setMessage(error.message || 'Não foi possível carregar administradores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function open(kind, admin = null) {
    setForm(admin ? { uid: admin.uid, id: admin.id, name: admin.name, password: '' } : blank);
    setModal({ kind, admin });
    setMessage('');
  }

  async function execute(action, success) {
    setBusy(true);
    setMessage('');
    try {
      await action();
      setModal(null);
      setMessageTone('success');
      setMessage(success);
      await refresh();
    } catch (error) {
      setMessageTone('error');
      setMessage(error.message || 'Não foi possível concluir.');
    } finally {
      setBusy(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    execute(() => modal.kind === 'edit'
      ? updateAdministrator({ uid: form.uid, id: form.id, name: form.name, ...(form.password ? { password: form.password } : {}) })
      : createAdministrator(form), modal.kind === 'edit' ? 'Administrador atualizado.' : 'Administrador cadastrado.');
  }

  return (
    <div className="admin-manager">
      <div className="admin-manager-top">
        <p className="muted">Contas com acesso à gestão do calendário.</p>
        <button className="button primary" onClick={() => open('create')}>+ Cadastrar</button>
      </div>
      <Toast message={message} tone={messageTone} onClose={() => setMessage('')} />
      <div className="admin-items admin-list-users">
        {loading && <p className="muted">Carregando administradores...</p>}
        {!loading && admins.length === 0 && <p className="muted">Nenhum administrador encontrado.</p>}
        {admins.map((admin) => (
          <article className="admin-item" key={admin.uid}>
            <div className="admin-item-main">
              <h3>{admin.name} {admin.isOwner && <span className="admin-role-tag">Dev</span>}</h3>
              <p>ID: {admin.id}{admin.uid === user?.uid ? ' · Você' : ''}</p>
            </div>
            <div className="item-actions admin-icon-actions">
              {isOwner && admin.uid !== user?.uid && <button title="Editar administrador" aria-label={`Editar ${admin.name}`} onClick={() => open('edit', admin)}>Editar</button>}
              {!admin.isOwner && admin.uid !== user?.uid && <button className="danger-text admin-trash" title="Remover administrador" aria-label={`Remover ${admin.name}`} onClick={() => open('delete', admin)}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v7m4-7v7"/></svg></button>}
            </div>
          </article>
        ))}
      </div>
      {modal && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setModal(null); }}>
        <div className="editor-modal admin-editor-modal" role="dialog" aria-modal="true" aria-label={modal.kind === 'create' ? 'Cadastrar administrador' : modal.kind === 'edit' ? 'Editar administrador' : 'Remover administrador'}>
          <div className="editor-heading"><h2>{modal.kind === 'create' ? 'Cadastrar administrador' : modal.kind === 'edit' ? 'Editar administrador' : 'Remover administrador'}</h2><button className="close-button" disabled={busy} onClick={() => setModal(null)} aria-label="Fechar">×</button></div>
          
          {modal.kind === 'delete' ? <div className="form-stack"><p>Deseja remover <strong>{modal.admin.name}</strong> (ID {modal.admin.id})? O acesso será revogado.</p><div className="item-actions"><button disabled={busy} onClick={() => setModal(null)}>Cancelar</button><button className="danger-text" disabled={busy} onClick={() => execute(() => removeAdministrator(modal.admin.uid), 'Administrador removido.')}>Confirmar remoção</button></div></div> :
            <form className="form-stack" onSubmit={submit}>
              <label>ID<input inputMode="numeric" pattern="[0-9]+" required value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })}/></label>
              <label>Nome<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></label>
              <label>{modal.kind === 'create' ? 'Senha provisória' : 'Nova senha (opcional)'}<input type="password" minLength={6} required={modal.kind === 'create'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })}/></label>
              <div className="item-actions"><button type="button" onClick={() => setModal(null)}>Cancelar</button><button className="button primary" disabled={busy}>{busy ? 'Salvando...' : modal.kind === 'create' ? 'Cadastrar' : 'Salvar alterações'}</button></div>
            </form>}
        </div>
      </div>}
    </div>
  );
}
