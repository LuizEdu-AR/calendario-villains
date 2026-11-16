import { dateKey, eventOnDate, fullDate, getMonthCells, getStatus, hasStartedEarlier } from '../utils/dates';

const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export default function MonthCalendar({ month, events, categories, onSelect, now }) {
  const cells = getMonthCells(month);
  const today = dateKey(new Date());

  return (
    <div className="calendar-grid" role="grid" aria-label="Calendário mensal">
      {weekdays.map((day) => <div key={day} className="weekday">{day}</div>)}
      {cells.map((date) => {
        const key = dateKey(date);
        const dayEvents = events.filter((event) => eventOnDate(event, key));
        return (
          <div key={key} className={`calendar-day ${date.getMonth() !== month.getMonth() ? 'outside' : ''} ${key === today ? 'today' : ''}`} role="gridcell" tabIndex={0} aria-label={`${fullDate(date)}, ${dayEvents.length} eventos`}>
            <div className="day-number">{key === today && <span>HOJE</span>}{date.getDate()}</div>
            <div className="day-events">
              {dayEvents.slice(0, 3).map((event) => {
                const category = categories.find((item) => item.id === event.categoryId);
                return <button key={event.id} className={`calendar-event ${hasStartedEarlier(event, now) ? 'event-past' : ''}`} style={{ '--event-color': category?.color || '#8b9b8d' }} onClick={() => onSelect(event)} title={event.title}><span>{event.allDay ? '' : event.startTime?.slice(0, 5)}</span> {event.title}</button>;
              })}
              {dayEvents.length > 3 && <small className="more-events">+{dayEvents.length - 3} eventos</small>}
            </div>
            {dayEvents.length > 0 && (
              <div className="day-popover">
                <div className="popover-title"><strong>{fullDate(date)}</strong><small>{dayEvents.length} evento(s)</small></div>
                {dayEvents.map((event) => {
                  const category = categories.find((item) => item.id === event.categoryId);
                  return <button key={event.id} className={`popover-event ${hasStartedEarlier(event, now) ? 'event-past' : ''}`} style={{ '--event-color': category?.color || '#8b9b8d' }} onClick={() => onSelect(event)}><strong>{event.title}</strong><span>{category?.name || 'Sem categoria'} · {event.allDay ? 'Dia inteiro' : `${event.startTime} às ${event.endTime}`} · {getStatus(event).label}</span></button>;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
