import { useEffect } from 'react';
import { fullDate, localEventStatus, parseDate, localEventRange, eventRangeLabel, brasiliaRangeLabel, usesBrasiliaTimeForEvent } from '../utils/dates';

function googleCalendarUrl(event) {
  const dateOnly = (value) => value.replaceAll('-', '');
  const start = dateOnly(event.startDate);
  const end = dateOnly(event.endDate || event.startDate);
  const startValue = event.allDay ? start : `${start}T${(event.startTime || '00:00').replace(':', '')}00`;
  const endValue = event.allDay
    ? dateOnly(new Date(`${event.endDate || event.startDate}T12:00:00`).toLocaleDateString('en-CA'))
    : `${end}T${(event.endTime || event.startTime || '23:59').replace(':', '')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description || '',
    dates: `${startValue}/${endValue}`,
    ctz: 'America/Sao_Paulo',
  });
  if (event.allDay) {
    const next = parseDate(event.endDate || event.startDate);
    next.setDate(next.getDate() + 1);
    params.set('dates', `${start}/${dateOnly([next.getFullYear(), String(next.getMonth() + 1).padStart(2, '0'), String(next.getDate()).padStart(2, '0')].join('-'))}`);
  }
  return `https://calendar.google.com/calendar/render?${params}`;
}

export default function EventModal({ event, category, onClose }) {
  useEffect(() => {
    if (!event) return undefined;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [event, onClose]);

  if (!event) return null;
  const status = localEventStatus(event);
  const localRange = localEventRange(event);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="event-modal" role="dialog" aria-modal="true" aria-label="Detalhes do evento">
        <button className="close-button" onClick={onClose} aria-label="Fechar">×</button>
        <div className="eyebrow"><span className="category-dot" style={{ background: category?.color }} />{category?.name || 'Sem categoria'}</div>
        <h2>{event.title}</h2>
        <p className="muted">{fullDate(parseDate(localRange.start))}</p>
        <p className="muted">{eventRangeLabel(event)}{localRange.end !== localRange.start ? ` · até ${fullDate(parseDate(localRange.end))}` : ''}</p>
        {!event.allDay && !usesBrasiliaTimeForEvent(event) && <p className="muted">{brasiliaRangeLabel(event)} · horário oficial</p>}
        <span className={`status ${status.tone}`}>{status.label}</span>
        <p className="event-description">{event.description || 'Sem mais detalhes por enquanto.'}</p>
        <div className="modal-actions">
          <button className="button subtle" onClick={onClose}>Fechar</button>
          <a className="button primary" href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">Adicionar ao Google Agenda</a>
        </div>
      </section>
    </div>
  );
}
