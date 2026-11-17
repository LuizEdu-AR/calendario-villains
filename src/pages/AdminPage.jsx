import { Toast, ConfirmDialog } from '../components/Feedback';
import { useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FirstAccessModal from '../components/FirstAccessModal';
import AdminManager from '../components/AdminManager';
import ProfileManager from '../components/ProfileManager';
import EventForm from '../components/EventForm';
import CategoryForm from '../components/CategoryForm';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';
import { createRecord, initialCategories, removeRecord, updateRecord } from '../services/calendarService';
import { dateKey, eventOnDate, fullDate, getMonthCells, getStatus, monthLabel, parseDate, sortEvents } from '../utils/dates';

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function AdminPage() {
  const { logout } = useAuth();
  const { events, categories, loading: calendarLoading, error: dataError } = useCalendar();
  const [section, setSection] = useState('events');
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const selectedEvents = useMemo(() => sortEvents(events.filter((event) => eventOnDate(event, selectedDate))), [events, selectedDate]);
  const matchingEvents = sortEvents(events.filter((event) => event.title?.toLowerCase().includes(query.toLowerCase())));

  function openModal(kind, item = null) {
    setEditing(item);
    setModal(kind);
    setError('');
    setSuccess('');
  }

  async function perform(action, message) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await action();
      setSuccess(message);
      setModal(null);
      setEditing(null);
    } catch (issue) {
      console.error(issue);
      setError('Não foi possível concluir a operação. Verifique suas permissões e tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  function saveEvent(payload) {
    return perform(() => editing ? updateRecord('events', editing.id, payload) : createRecord('events', payload), 'Evento salvo com sucesso.');
  }

  function saveCategory(payload) {
    return perform(() => editing ? updateRecord('categories', editing.id, payload) : createRecord('categories', payload), 'Categoria salva com sucesso.');
  }

  function deleteItem(name, item) {
    if (name === 'categories' && events.some((event) => event.categoryId === item.id)) {
      setError('Esta categoria possui eventos vinculados. Altere a categoria desses eventos antes de removê-la.');
      return;
    }
    setConfirmDelete({ name, item });
  }

  async function seedCategories() {
    const existing = new Set(categories.map((category) => category.name.toLowerCase()));
    const missing = initialCategories.filter((category) => !existing.has(category.name.toLowerCase()));
    if (!missing.length) return;
    await perform(() => Promise.all(missing.map((category) => createRecord('categories', category))), 'Categorias iniciais cadastradas.');
  }

  const cells = getMonthCells(month);

  return (
    <div className="app-shell admin-shell">
      <Header admin />
      <main className="container admin-main">
        <div className="admin-heading"><div><span className="overline">ÁREA RESTRITA</span><h1>Painel administrativo<span className="green-period">.</span></h1><p>Gerencie os eventos e as categorias da fraternidade.</p></div><button className="button subtle" onClick={logout}>Sair da conta</button></div>

        {calendarLoading ? <div className="calendar-loading" role="status"><span className="villains-spinner" aria-hidden="true" /><span>Carregando dados...</span></div> : dataError ? <div className="calendar-loading"><p>Não foi possível carregar os dados.</p><button className="button subtle" onClick={() => window.location.reload()}>Tentar novamente</button></div> : <div className="admin-layout">
          <aside className="admin-menu"><p className="menu-label">GERENCIAMENTO</p><button className={section === 'events' ? 'selected' : ''} onClick={() => setSection('events')}>Eventos <span>{events.length}</span></button><button className={section === 'categories' ? 'selected' : ''} onClick={() => setSection('categories')}>Categorias <span>{categories.length}</span></button><button className={section === 'admins' ? 'selected' : ''} onClick={() => setSection('admins')}>Administradores</button><p className="menu-label account-label">CONTA</p><button className={section === 'profile' ? 'selected' : ''} onClick={() => setSection('profile')}>Perfil</button><div className="admin-menu-footer">Calendário Villains <small>Gestão da fraternidade</small></div></aside>
          <section className="admin-content"><div className="content-heading"><div><span className="overline">ORGANIZAÇÃO</span><h2>{section === 'events' ? 'Eventos' : section === 'categories' ? 'Categorias' : section === 'admins' ? 'Administradores' : 'Perfil'}</h2></div>{section !== 'admins' && section !== 'profile' && <button className="button primary" onClick={() => openModal(section === 'events' ? 'event' : 'category')}>+ {section === 'events' ? 'Novo evento' : 'Nova categoria'}</button>}</div>
            {section === 'admins' ? <AdminManager /> : section === 'profile' ? <ProfileManager /> : section === 'events' ? <><input className="search-input" placeholder="Pesquisar eventos..." value={query} onChange={(e) => setQuery(e.target.value)} /><div className="admin-items">{matchingEvents.length ? matchingEvents.map((event) => { const category = categories.find((item) => item.id === event.categoryId); return <article className="admin-item" key={event.id} style={{ '--event-color': category?.color || '#8b9b8d' }}><div className="admin-item-main"><span className="item-category">{category?.name || 'Sem categoria'}</span><h3>{event.title}</h3><p>{fullDate(parseDate(event.startDate))} · {event.allDay ? 'Dia inteiro' : `${event.startTime}–${event.endTime}`}</p><span className={`status ${getStatus(event).tone}`}>{getStatus(event).label}</span></div><div className="item-actions"><button onClick={() => openModal('event', event)}>Editar</button><button className="danger-text" onClick={() => deleteItem('events', event)}>Excluir</button></div></article>; }) : <div className="empty-state">Nenhum evento encontrado.</div>}</div></> : <><p className="section-description">Personalize os tipos de evento e suas cores de identificação.</p><div className="admin-items">{categories.map((category) => <article className="admin-item category-admin-item" key={category.id} style={{ '--event-color': category.color }}><div className="admin-item-main"><h3>{category.name}</h3><p>{events.filter((event) => event.categoryId === category.id).length} evento(s) vinculado(s)</p></div><div className="item-actions"><button onClick={() => openModal('category', category)}>Editar</button><button className="danger-text" onClick={() => deleteItem('categories', category)}>Excluir</button></div></article>)}{!categories.length && <div className="empty-state">Nenhuma categoria cadastrada.</div>}</div><button className="button subtle seed-button" onClick={seedCategories} disabled={busy || initialCategories.every((category) => categories.some((item) => item.name.toLowerCase() === category.name.toLowerCase()))}>Cadastrar categorias iniciais ausentes</button></>}
          </section>
          <aside className="admin-date-panel"><div className="compact-header"><h3>{monthLabel(month)}</h3><div><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mês anterior">‹</button><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Próximo mês">›</button></div></div><div className="mini-calendar">{weekdays.map((day, index) => <span className="mini-weekday" key={index}>{day}</span>)}{cells.map((date) => { const key = dateKey(date); return <button key={key} className={`${date.getMonth() !== month.getMonth() ? 'faded' : ''} ${key === selectedDate ? 'selected' : ''} ${events.some((event) => eventOnDate(event, key)) ? 'has-event' : ''}`} onClick={() => { setSelectedDate(key); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }}>{date.getDate()}</button>; })}</div><div className="selected-day-events"><h4>{fullDate(parseDate(selectedDate))}</h4>{selectedEvents.length ? selectedEvents.map((event) => <div key={event.id} className="small-day-event"><strong>{event.title}</strong><small>{event.allDay ? 'Dia inteiro' : event.startTime}</small></div>) : <p>Nenhum evento neste dia.</p>}</div></aside>
        </div>}
      </main>
      <Footer />
      <FirstAccessModal />
      <Toast message={error || dataError} tone="error" onClose={() => setError('')} />
      <Toast message={success} onClose={() => setSuccess('')} />
      {confirmDelete && <ConfirmDialog title={confirmDelete.name === 'events' ? 'Excluir evento' : 'Excluir categoria'} description={`Tem certeza de que deseja excluir “${confirmDelete.item.title || confirmDelete.item.name}”? Esta ação não poderá ser desfeita.`} confirmLabel="Excluir" danger busy={busy} onCancel={() => setConfirmDelete(null)} onConfirm={async () => { const { name, item } = confirmDelete; await perform(() => removeRecord(name, item.id), 'Item excluído com sucesso.'); setConfirmDelete(null); }} />}
      {modal && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}><div className="editor-modal" role="dialog" aria-modal="true"><div className="editor-heading"><h2>{modal === 'event' ? editing ? 'Editar evento' : 'Novo evento' : editing ? 'Editar categoria' : 'Nova categoria'}</h2><button className="close-button" onClick={() => setModal(null)} aria-label="Fechar">×</button></div>{error && <p className="notice error">{error}</p>}{modal === 'event' ? <EventForm event={editing} categories={categories} onSave={saveEvent} onClose={() => setModal(null)} busy={busy} /> : <CategoryForm category={editing} onSave={saveCategory} onClose={() => setModal(null)} busy={busy} />}</div></div>}
    </div>
  );
}
