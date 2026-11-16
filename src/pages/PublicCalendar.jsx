import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CalendarDays, List, Clock3 } from 'lucide-react';
import CategorySidebar from '../components/CategorySidebar';
import MonthCalendar from '../components/MonthCalendar';
import ListCalendar from '../components/ListCalendar';
import EventModal from '../components/EventModal';
import { useCalendar } from '../contexts/CalendarContext';
import { dateKey, eventOnDate, monthLabel, sortEvents } from '../utils/dates';

export default function PublicCalendar() {
  const { events, categories: savedCategories, initialCategories, loading, error } = useCalendar();
  // Exibe as categorias padrão enquanto não houver categorias salvas no Firestore.
  const categories = useMemo(() => savedCategories.length
    ? savedCategories
    : initialCategories.map((category, index) => ({ ...category, id: `default-${index}` })),
  [savedCategories, initialCategories]);
  const [month, setMonth] = useState(() => new Date());
  const [view, setView] = useState('month');
  const [visible, setVisible] = useState([]);
  const [selected, setSelected] = useState(null);
  const [now, setNow] = useState(() => new Date());

  // Atualiza o risco automaticamente, sem recarregar a página.
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => setVisible(categories.map((category) => category.id)), [categories]);

  const monthlyEvents = useMemo(() => events.filter((event) => {
    const start = dateKey(new Date(month.getFullYear(), month.getMonth(), 1));
    const end = dateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));
    return event.startDate <= end && (event.endDate || event.startDate) >= start;
  }), [events, month]);

  const filtered = monthlyEvents.filter((event) => visible.includes(event.categoryId));
  const categoryCounts = categories.map((category) => ({ ...category, count: monthlyEvents.filter((event) => event.categoryId === category.id).length }));
  const upcoming = sortEvents(events.filter((event) => event.startDate >= dateKey(new Date()) && event.status !== 'cancelled'))[0];
  const nextCategory = categories.find((category) => category.id === upcoming?.categoryId);

  const toggle = (id) => setVisible((previous) => id === null
    ? previous.length === categories.length ? [] : categories.map((item) => item.id)
    : previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);

  const changeMonth = (offset) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  return (
    <div className="app-shell">
      <Header />
      <main className="container public-main">
        <div className="toolbar"><div className="segmented"><button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}><CalendarDays size={15} /> Mês</button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={15} /> Lista</button></div><div className="upcoming-strip"><span className="live-dot" />{upcoming ? <><strong>A seguir</strong><span>{upcoming.title}</span><small>{nextCategory?.name || 'Evento'}</small><button onClick={() => setSelected(upcoming)}>Ver detalhes</button></> : <span>Novos eventos serão anunciados aqui.</span>}</div><span className="timezone"><Clock3 size={15} /> Horário de Brasília</span></div>
        {error && <p className="notice error">{error}</p>}
        <div className="public-layout"><CategorySidebar categories={categoryCounts} visible={visible} toggle={toggle} eventCount={monthlyEvents.length} /><section className="calendar-panel"><div className="calendar-header"><div className="month-controls"><button onClick={() => changeMonth(-1)} aria-label="Mês anterior">‹</button><button onClick={() => changeMonth(1)} aria-label="Próximo mês">›</button></div><h2>{monthLabel(month)}</h2><button className="text-button today-link" onClick={() => setMonth(new Date())}>Hoje</button></div>{loading ? <div className="empty-state">Carregando eventos...</div> : view === 'month' ? <MonthCalendar month={month} events={filtered} categories={categories} onSelect={setSelected} now={now} /> : <ListCalendar month={month} events={filtered} categories={categories} onSelect={setSelected} now={now} />}</section></div>
        <div className="bottom-note">As datas e horários podem sofrer alterações. Consulte este calendário antes de se programar.</div>
        <Footer />
      </main>
      <EventModal event={selected} category={categories.find((category) => category.id === selected?.categoryId)} onClose={() => setSelected(null)} />
    </div>
  );
}
