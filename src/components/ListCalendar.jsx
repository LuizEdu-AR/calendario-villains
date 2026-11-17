import { dateKey, localEventOnDate, fullDate, localEventStatus, localHasStartedEarlier, parseDate, eventRangeLabel, brasiliaInstant } from '../utils/dates';

export default function ListCalendar({ month, events, categories, onSelect, now }) {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const groups = [];

  for (let day = 1; day <= days; day += 1) {
    const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
    const dayEvents = events.filter((event) => localEventOnDate(event, key)).sort((a, b) => brasiliaInstant(a.startDate, a.startTime || '00:00') - brasiliaInstant(b.startDate, b.startTime || '00:00'));
    if (dayEvents.length) groups.push({ key, events: dayEvents });
  }

  if (!groups.length) return <div className="empty-state">Nenhum evento encontrado neste mês.</div>;

  return (
    <div className="list-calendar">
      {groups.map((group) => (
        <section className="date-group" key={group.key}>
          <div className="date-group-heading"><strong>{parseDate(group.key).getDate().toString().padStart(2, '0')}</strong><span>{fullDate(parseDate(group.key))}</span></div>
          {group.events.map((event) => {
            const category = categories.find((item) => item.id === event.categoryId);
            const status = localEventStatus(event, now);
            return (
              <button className={`list-event ${localHasStartedEarlier(event, now) ? 'event-past' : ''}`} key={event.id} onClick={() => onSelect(event)} style={{ '--event-color': category?.color || '#8b9b8d' }}>
                <span className="list-time">{event.allDay ? 'Dia inteiro' : eventRangeLabel(event)}</span>
                <span className="list-event-info"><strong>{event.title}</strong><small>{category?.name || 'Sem categoria'} <span className={`status ${status.tone}`}>{status.label}</span></small></span>
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}
