import { Toast, ConfirmDialog } from '../components/Feedback';
import { useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FirstAccessModal from '../components/FirstAccessModal';
import AdminManager from '../components/AdminManager';
import ProfileManager from '../components/ProfileManager';
import EventForm from '../components/EventForm';
import CategoryForm from '../components/CategoryForm';
import SelectPicker from '../components/SelectPicker';
import { DatePicker } from '../components/DateTimePickers';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';
import { createRecord, initialCategories, removeRecord, updateRecord } from '../services/calendarService';
import { dateKey, eventOnDate, fullDate, getMonthCells, getStatus, monthLabel, parseDate, sortEvents } from '../utils/dates';

const EVENTS_PER_PAGE = 8;
const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function AdminPage() {
  const { logout } = useAuth();
  const { events, categories, loading: calendarLoading, error: dataError } = useCalendar();
  const [section, setSection] = useState('events');
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [eventOrder, setEventOrder] = useState('dateAsc');
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const resetPage = () => { setPage(1); setPageInput('1'); };
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const selectedEvents = useMemo(() => sortEvents(events.filter((event) => eventOnDate(event, selectedDate))), [events, selectedDate]);
  const matchingEvents = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    const filtered = events.filter((event) => {
      if (normalized && !event.title?.toLocaleLowerCase('pt-BR').includes(normalized)) return false;
      if (categoryFilter !== 'all' && event.categoryId !== categoryFilter) return false;
      if (statusFilter !== 'all') {
        const status = getStatus(event);
        const key = event.status === 'cancelled' ? 'cancelled' : status.label === 'Agendado' ? 'scheduled' : status.label === 'Em andamento' ? 'ongoing' : status.label === 'Encerrado' ? 'ended' : status.label === 'Concluído' ? 'completed' : 'other';
        if (key !== statusFilter) return false;
      }
      if (dateFrom && (event.endDate || event.startDate) < dateFrom) return false;
      if (dateTo && event.startDate > dateTo) return false;
      return true;
    });
    filtered.sort((a, b) => {
      if (eventOrder.startsWith('name')) return (a.title || '').localeCompare(b.title || '', 'pt-BR') * (eventOrder === 'nameDesc' ? -1 : 1);
      const cmp = `${a.startDate} ${a.startTime || '00:00'}`.localeCompare(`${b.startDate} ${b.startTime || '00:00'}`);
      return eventOrder === 'dateDesc' ? -cmp : cmp;
    });
    return filtered;
  }, [events, query, categoryFilter, statusFilter, dateFrom, dateTo, eventOrder]);
  const totalPages = Math.max(1, Math.ceil(matchingEvents.length / EVENTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedEvents = matchingEvents.slice((currentPage - 1) * EVENTS_PER_PAGE, currentPage * EVENTS_PER_PAGE);
  function goToPage(next) {
    const valid = Math.min(totalPages, Math.max(1, Number(next) || 1));
    setPage(valid);
    setPageInput(String(valid));
  }
  const visiblePages = Array.from(new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1].filter((n) => n >= 1 && n <= totalPages))).sort((a, b) => a - b);

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
            {section === 'admins' ? <AdminManager /> : section === 'profile' ? <ProfileManager /> : section === 'events' ? <>
              <div className="event-admin-filters">
                <input className="search-input" placeholder="Pesquisar eventos..." aria-label="Pesquisar eventos" value={query} onChange={(e) => { setQuery(e.target.value); resetPage(); }} />
                <div className="event-filter-grid">
                  <label>Categoria<SelectPicker searchable value={categoryFilter} onChange={(value) => { setCategoryFilter(value); resetPage(); }} options={[{value:'all',label:'Todas as categorias'}, ...categories.map((category) => ({value:category.id,label:category.name,color:category.color}))]} /></label>
                  <label>Status<SelectPicker value={statusFilter} onChange={(value) => { setStatusFilter(value); resetPage(); }} options={[{value:'all',label:'Todos os status'},{value:'scheduled',label:'Agendados'},{value:'ongoing',label:'Em andamento'},{value:'ended',label:'Encerrados'},{value:'completed',label:'Concluídos'},{value:'cancelled',label:'Cancelados'}]} /></label>
                  <label>Data inicial<DatePicker value={dateFrom} onChange={(value) => { setDateFrom(value); if (dateTo && value && dateTo < value) setDateTo(''); resetPage(); }} /></label>
                  <label>Data final<DatePicker min={dateFrom || undefined} value={dateTo} onChange={(value) => { setDateTo(value); resetPage(); }} /></label>
                  <label>Ordenar por<SelectPicker value={eventOrder} onChange={(value) => { setEventOrder(value); resetPage(); }} options={[{value:'dateAsc',label:'Data — mais próximos primeiro'},{value:'dateDesc',label:'Data — mais distantes primeiro'},{value:'nameAsc',label:'Nome — A a Z'},{value:'nameDesc',label:'Nome — Z a A'}]} /></label>
                  <div className="event-clear-wrap"><button type="button" className="event-clear-filters" onClick={() => { setQuery(''); setCategoryFilter('all'); setStatusFilter('all'); setDateFrom(''); setDateTo(''); setEventOrder('dateAsc'); resetPage(); }}>Limpar filtros</button></div>
                </div>
              </div>
              <div className="event-results-count">{matchingEvents.length} evento(s) encontrado(s)</div>
              <div className="admin-items">{pagedEvents.length ? pagedEvents.map((event) => { const category = categories.find((item) => item.id === event.categoryId); return <article className="admin-item" key={event.id} style={{ '--event-color': category?.color || '#8b9b8d' }}><div className="admin-item-main"><span className="item-category">{category?.name || 'Sem categoria'}</span><h3>{event.title}</h3><p>{fullDate(parseDate(event.startDate))} · {event.allDay ? 'Dia inteiro' : `${event.startTime}–${event.endTime}`}</p><span className={`status ${getStatus(event).tone}`}>{getStatus(event).label}</span></div><div className="item-actions"><button onClick={() => openModal('event', event)}>Editar</button><button className="danger-text" onClick={() => deleteItem('events', event)}>Excluir</button></div></article>; }) : <div className="empty-state">Nenhum evento encontrado.</div>}</div>
              {totalPages > 1 && <nav className="event-pagination" aria-label="Paginação de eventos"><button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Anterior</button>{visiblePages.map((number, index) => <span className="page-segment" key={number}>{index > 0 && number - visiblePages[index - 1] > 1 && <span className="page-ellipsis">…</span>}<button className={currentPage === number ? 'active' : ''} aria-current={currentPage === number ? 'page' : undefined} onClick={() => goToPage(number)}>{number}</button></span>)}<label className="page-jump">Página <input type="number" min="1" max={totalPages} value={pageInput} onChange={(e) => setPageInput(e.target.value)} onBlur={() => goToPage(pageInput)} onKeyDown={(e) => { if (e.key === 'Enter') { goToPage(pageInput); e.currentTarget.blur(); } }} /></label><button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Próximo</button></nav>}
            </> : <><p className="section-description">Personalize os tipos de evento e suas cores de identificação.</p><div className="admin-items">{categories.map((category) => <article className="admin-item category-admin-item" key={category.id} style={{ '--event-color': category.color }}><div className="admin-item-main"><h3>{category.name}</h3><p>{events.filter((event) => event.categoryId === category.id).length} evento(s) vinculado(s)</p></div><div className="item-actions"><button onClick={() => openModal('category', category)}>Editar</button><button className="danger-text" onClick={() => deleteItem('categories', category)}>Excluir</button></div></article>)}{!categories.length && <div className="empty-state">Nenhuma categoria cadastrada.</div>}</div><button className="button subtle seed-button" onClick={seedCategories} disabled={busy || initialCategories.every((category) => categories.some((item) => item.name.toLowerCase() === category.name.toLowerCase()))}>Cadastrar categorias iniciais ausentes</button></>}
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
